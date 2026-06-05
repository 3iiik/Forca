import { google } from 'googleapis';
import ical from 'node-ical';
import { CalendarEvent } from '../../shared/types';
import store from '../store/store';
import { BrowserWindow } from 'electron';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

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

      // In production, you'd open the OAuth URL in a browser window
      // and handle the redirect callback
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:5173/oauth/callback'
      );

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      if (this.window) {
        await this.window.webContents.loadURL(authUrl);
      }

      return false;
    } catch (err) {
      console.error('Google auth failed:', err);
      return false;
    }
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
      console.error('Failed to fetch Google events:', err);
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
      console.error('Failed to fetch iCal events:', err);
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
    }, 10000);
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
