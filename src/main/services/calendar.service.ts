import { google } from 'googleapis';
import ical from 'node-ical';
import { CalendarEvent } from '../../shared/types';
import store from '../store/store';
import { BrowserWindow } from 'electron';
import * as http from 'http';
import { AddressInfo } from 'net';
import { logger } from '../utils/logger';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const REDIRECT_PATH = '/oauth/callback';

export class CalendarService {
  private window: BrowserWindow | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private onMeetingEnd: ((event: CalendarEvent) => void) | null = null;
  private previousEvents: Map<string, boolean> = new Map();

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  setCallbacks(opts: { onMeetingEnd: (event: CalendarEvent) => void }) {
    this.onMeetingEnd = opts.onMeetingEnd;
  }

  async authenticate(): Promise<boolean> {
    const settings = store.get('settings');
    if (settings.calendar.provider === 'google') {
      return this.authenticateGoogle();
    }
    return false;
  }

  private async authenticateGoogle(): Promise<boolean> {
    try {
      const settings = store.get('settings');
      if (settings.calendar.googleAccessToken) {
        return true;
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        logger.warn('Google OAuth: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
        return false;
      }

      // Start a local server to receive the OAuth redirect
      const code = await this.getOAuthCode(clientId, clientSecret);
      if (!code) return false;

      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
      const { tokens } = await oauth2Client.getToken(code);

      // Save tokens
      const currentSettings = store.get('settings');
      store.set('settings', {
        ...currentSettings,
        calendar: {
          ...currentSettings.calendar,
          googleAccessToken: tokens.access_token || '',
          googleRefreshToken: tokens.refresh_token || '',
        },
      });

      return true;
    } catch (err) {
      logger.error('Google auth failed:', err);
      return false;
    }
  }

  private getOAuthCode(clientId: string, clientSecret: string): Promise<string | null> {
    return new Promise((resolve) => {
      // Start local server to catch the redirect
      const server = http.createServer();
      let authWindow: BrowserWindow | null = null;

      server.on('request', (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        if (url.pathname === REDIRECT_PATH) {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          if (error) {
            res.end('<html><body><h2>Authorization denied</h2><p>You can close this window.</p></body></html>');
            resolve(null);
          } else if (code) {
            res.end('<html><body><h2>Authorization successful!</h2><p>You can close this window and return to Forca.</p></body></html>');
            resolve(code);
          } else {
            res.end('<html><body><h2>No authorization code received</h2></body></html>');
            resolve(null);
          }

          if (authWindow && !authWindow.isDestroyed()) {
            authWindow.close();
          }
          server.close();
        }
      });

      server.listen(0, '127.0.0.1', () => {
        const port = (server.address() as AddressInfo).port;
        const redirectUri = `http://127.0.0.1:${port}${REDIRECT_PATH}`;

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent',
        });

        authWindow = new BrowserWindow({
          width: 600,
          height: 700,
          title: 'Forca — Google Calendar Authorization',
          webPreferences: { nodeIntegration: false, contextIsolation: true },
        });

        authWindow.loadURL(authUrl);

        authWindow.on('closed', () => {
          authWindow = null;
          server.close();
          resolve(null);
        });
      });
    });
  }

  async getEvents(date: string): Promise<CalendarEvent[]> {
    const settings = store.get('settings');
    if (settings.calendar.provider === 'google') {
      return this.getGoogleEvents(date);
    } else if (settings.calendar.provider === 'ical') {
      return this.getICalEvents();
    }
    return [];
  }

  private async getGoogleEvents(date: string): Promise<CalendarEvent[]> {
    try {
      const settings = store.get('settings');
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: settings.calendar.googleAccessToken,
        refresh_token: settings.calendar.googleRefreshToken,
      });

      // Auto-refresh if token expired
      oauth2Client.on('tokens', (tokens) => {
        if (tokens.access_token || tokens.refresh_token) {
          const currentSettings = store.get('settings');
          store.set('settings', {
            ...currentSettings,
            calendar: {
              ...currentSettings.calendar,
              ...(tokens.access_token ? { googleAccessToken: tokens.access_token } : {}),
              ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
            },
          });
        }
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await calendar.events.list({
        calendarId: settings.calendar.googleCalendarId || 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items || []).map(event => ({
        id: event.id || crypto.randomUUID(),
        title: event.summary || 'Untitled Event',
        start: new Date(event.start?.dateTime || event.start?.date || date),
        end: new Date(event.end?.dateTime || event.end?.date || date),
        isAllDay: !!event.start?.date,
        source: 'google' as const,
        calendarName: event.organizer?.displayName,
      }));
    } catch (err) {
      logger.error('Failed to fetch Google events:', err);
      return [];
    }
  }

  private async getICalEvents(): Promise<CalendarEvent[]> {
    try {
      const settings = store.get('settings');
      if (!settings.calendar.icalUrl) return [];

      const data = await ical.async.fromURL(settings.calendar.icalUrl);
      const events: CalendarEvent[] = [];

      for (const key of Object.keys(data)) {
        const event = data[key];
        if (event.type === 'VEVENT') {
          events.push({
            id: event.uid || key,
            title: event.summary || 'Untitled Event',
            start: new Date(event.start),
            end: new Date(event.end),
            isAllDay: event.datetype === 'date',
            source: 'ical',
          });
        }
      }

      return events.sort((a, b) => a.start.getTime() - b.start.getTime());
    } catch (err) {
      logger.error('Failed to fetch iCal events:', err);
      return [];
    }
  }

  async checkMeetingEnded(): Promise<CalendarEvent | null> {
    const events = await this.getEvents(new Date().toISOString().split('T')[0]);
    const now = new Date();

    for (const event of events) {
      if (event.isAllDay) continue;

      const eventEnd = new Date(event.end);

      // Event that just ended (within last 30 seconds)
      if (eventEnd <= now && now.getTime() - eventEnd.getTime() < 30000) {
        const key = event.id;
        if (!this.previousEvents.get(key)) {
          this.previousEvents.set(key, true);
          this.onMeetingEnd?.(event);
          return event;
        }
      }

      // Clean up old events
      if (now.getTime() - eventEnd.getTime() > 60000) {
        this.previousEvents.delete(event.id);
      }
    }

    return null;
  }

  startMeetingMonitor(): void {
    this.checkInterval = setInterval(() => {
      this.checkMeetingEnded();
    }, 300000);
  }

  stopMeetingMonitor(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  destroy(): void {
    this.stopMeetingMonitor();
    this.previousEvents.clear();
  }
}
