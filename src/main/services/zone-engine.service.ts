import { BrowserWindow } from 'electron';
import store from '../store/store';
import { FocusZone, ActiveZone, FocusSession, ZoneProfile } from '../../shared/types';
import { ScoreService } from './score.service';
import { BlockingService } from './blocker.service';
import { TrayService } from './tray.service';
import { DndService } from './dnd.service';
import { SoundService } from './sound.service';

export class ZoneEngine {
  private activeZone: ActiveZone | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private breakInterval: ReturnType<typeof setInterval> | null = null;
  private onUpdate: ((zone: ActiveZone | null) => void) | null = null;
  private onBreakUpdate: ((isBreak: boolean, remaining: number) => void) | null = null;
  private blocker: BlockingService;
  private tray: TrayService;
  private dnd: DndService;
  private sound: SoundService;
  private window: BrowserWindow | null = null;

  // Break timer state
  private isBreakActive = false;
  private breakRemaining = 0;
  private breakTotal = 0;

  constructor(
    blocker: BlockingService,
    tray: TrayService,
    dnd: DndService,
    sound: SoundService
  ) {
    this.blocker = blocker;
    this.tray = tray;
    this.dnd = dnd;
    this.sound = sound;
  }

  setWindow(win: BrowserWindow) {
    this.window = win;
    this.blocker.setWindow(win);
  }

  setCallbacks(opts: {
    onUpdate: (zone: ActiveZone | null) => void;
    onBreakUpdate: (isBreak: boolean, remaining: number) => void;
  }) {
    this.onUpdate = opts.onUpdate;
    this.onBreakUpdate = opts.onBreakUpdate;
  }

  getZones(): FocusZone[] {
    return store.get('zones', []);
  }

  createZone(zone: FocusZone): FocusZone {
    const zones = store.get('zones', []);
    zones.push(zone);
    store.set('zones', zones);
    return zone;
  }

  updateZone(zone: FocusZone): FocusZone {
    const zones = store.get('zones', []);
    const idx = zones.findIndex(z => z.id === zone.id);
    if (idx !== -1) {
      zone.updatedAt = new Date();
      zones[idx] = zone;
      store.set('zones', zones);
    }
    return zone;
  }

  deleteZone(zoneId: string): void {
    const zones = store.get('zones', []);
    store.set('zones', zones.filter(z => z.id !== zoneId));
  }

  getProfiles(): ZoneProfile[] {
    return store.get('profiles', []);
  }

  saveProfile(profile: ZoneProfile): void {
    const profiles = store.get('profiles', []);
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    store.set('profiles', profiles);
  }

  deleteProfile(profileId: string): void {
    const profiles = store.get('profiles', []);
    store.set('profiles', profiles.filter(p => p.id !== profileId));
  }

  async startZone(zoneId: string): Promise<boolean> {
    if (this.activeZone) {
      await this.stopZone();
    }

    const zones = store.get('zones', []);
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return false;

    const settings = store.get('settings');
    let ambientSound = settings.sounds.defaultSound;
    let ambientVolume = settings.sounds.defaultVolume;

    if (zone.profileId) {
      const profiles = store.get('profiles', []);
      const profile = profiles.find(p => p.id === zone.profileId);
      if (profile) {
        ambientSound = profile.ambientSound || ambientSound;
        ambientVolume = profile.ambientVolume ?? ambientVolume;
      }
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + zone.duration * 60 * 1000);

    this.activeZone = {
      zoneId: zone.id,
      zoneName: zone.name,
      profileId: zone.profileId,
      startTime: now,
      endTime,
      remaining: zone.duration * 60,
      status: 'running',
      ambientSound,
      ambientVolume,
    };

    // Start blocking
    await this.blocker.blockApps(zone.blockedApps);
    await this.blocker.blockSites(zone.blockedSites);

    // Enable DND if configured
    if (settings.general.dndSync) {
      await this.dnd.enable();
    }

    // Start ambient sound
    if (ambientSound && ambientSound !== 'none' && settings.sounds.enabled) {
      this.sound.play(ambientSound, ambientVolume);
    }

    // Update tray
    this.tray.updateState({
      status: 'active',
      activeZoneName: zone.name,
      remaining: zone.duration * 60,
    });

    // Start countdown timer
    this.startTimer();

    // Send notification
    if (settings.notifications.zoneStart) {
      this.window?.webContents?.send('notification:show', {
        title: 'Zone Started',
        body: `Forca: ${zone.name} is now active for ${zone.duration} minutes`,
      });
    }

    this.onUpdate?.(this.activeZone);
    return true;
  }

  async stopZone(): Promise<void> {
    if (!this.activeZone) return;

    const settings = store.get('settings');
    const completedDuration = Math.floor(
      (Date.now() - this.activeZone.startTime.getTime()) / 60000
    );
    const durationPlanned = Math.floor(
      (this.activeZone.endTime.getTime() - this.activeZone.startTime.getTime()) / 60000
    );

    // Save session
    const session: FocusSession = {
      id: crypto.randomUUID(),
      zoneId: this.activeZone.zoneId,
      zoneName: this.activeZone.zoneName,
      profileName: undefined,
      startTime: this.activeZone.startTime,
      endTime: new Date(),
      durationCompleted: completedDuration,
      durationPlanned,
      interruptions: 0,
      appsBlocked: 0,
      score: ScoreService.calculateSessionScore({
        id: '',
        zoneId: this.activeZone.zoneId,
        zoneName: this.activeZone.zoneName,
        startTime: this.activeZone.startTime,
        endTime: new Date(),
        durationCompleted: completedDuration,
        durationPlanned,
        interruptions: 0,
        appsBlocked: 0,
        score: 0,
        date: new Date().toISOString().split('T')[0],
      }),
      date: new Date().toISOString().split('T')[0],
    };

    const sessions = store.get('sessions', []);
    sessions.push(session);
    store.set('sessions', sessions);

    // Unblock everything
    await this.blocker.unblockApps();
    await this.blocker.unblockSites();

    // Disable DND
    if (settings.general.dndSync) {
      await this.dnd.disable();
    }

    // Stop sound
    this.sound.stop();

    // Clear timer
    this.stopTimer();

    // Update tray
    this.tray.updateState({ status: 'idle' });

    // Notification
    if (settings.notifications.zoneEnd) {
      this.window?.webContents?.send('notification:show', {
        title: 'Zone Ended',
        body: `${this.activeZone.zoneName} completed. Great focus session!`,
      });
    }

    // Start break timer
    if (settings.breakReminder.enabled && settings.breakReminder.autoStartBreak) {
      this.startBreakTimer();
    }

    this.activeZone = null;
    this.onUpdate?.(null);
  }

  pauseZone(): void {
    if (!this.activeZone || this.activeZone.status !== 'running') return;
    this.activeZone.status = 'paused';
    this.stopTimer();
    this.tray.updateState({
      status: 'paused',
      activeZoneName: this.activeZone.zoneName,
      remaining: this.activeZone.remaining,
    });
    this.onUpdate?.(this.activeZone);
  }

  resumeZone(): void {
    if (!this.activeZone || this.activeZone.status !== 'paused') return;
    this.activeZone.status = 'running';
    this.startTimer();
    this.tray.updateState({
      status: 'active',
      activeZoneName: this.activeZone.zoneName,
      remaining: this.activeZone.remaining,
    });
    this.onUpdate?.(this.activeZone);
  }

  getActiveZone(): ActiveZone | null {
    return this.activeZone;
  }

  private tickCount = 0;

  private startTimer(): void {
    this.stopTimer();
    this.tickCount = 0;
    this.timerInterval = setInterval(() => {
      if (!this.activeZone) return;

      if (this.activeZone.status === 'running') {
        this.activeZone.remaining--;

        if (this.activeZone.remaining <= 0) {
          this.stopZone();
          return;
        }

        // Check break reminder
        const settings = store.get('settings');
        if (settings.breakReminder.enabled) {
          const elapsed = Math.floor(
            (Date.now() - this.activeZone.startTime.getTime()) / 60000
          );
          if (elapsed > 0 && elapsed % settings.breakReminder.focusDuration === 0) {
            this.window?.webContents?.send('notification:show', {
              title: 'Break Reminder',
              body: `You've been focused for ${elapsed} minutes. Take a short break!`,
            });
          }
        }

        // Throttle tray updates to every 30 seconds
        this.tickCount++;
        if (this.tickCount % 30 === 0) {
          this.tray.updateState({
            status: 'active',
            activeZoneName: this.activeZone.zoneName,
            remaining: this.activeZone.remaining,
          });
        }
      }

      this.onUpdate?.(this.activeZone);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startBreakTimer(): void {
    const settings = store.get('settings');
    this.isBreakActive = true;
    this.breakTotal = settings.breakReminder.breakDuration * 60;
    this.breakRemaining = this.breakTotal;

    this.window?.webContents?.send('notification:show', {
      title: 'Break Time!',
      body: `Take ${settings.breakReminder.breakDuration} minutes to recharge.`,
    });

    this.breakInterval = setInterval(() => {
      this.breakRemaining--;
      this.onBreakUpdate?.(true, this.breakRemaining);

      if (this.breakRemaining <= 0) {
        this.endBreakTimer();
        this.window?.webContents?.send('notification:show', {
          title: 'Break Over',
          body: 'Time to get back to focus!',
        });
      }
    }, 1000);
  }

  private endBreakTimer(): void {
    if (this.breakInterval) {
      clearInterval(this.breakInterval);
      this.breakInterval = null;
    }
    this.isBreakActive = false;
    this.breakRemaining = 0;
    this.onBreakUpdate?.(false, 0);
  }

  getBreakState(): { isBreak: boolean; remaining: number } {
    return { isBreak: this.isBreakActive, remaining: this.breakRemaining };
  }

  destroy(): void {
    this.stopTimer();
    this.endBreakTimer();
    this.blocker.cleanup();
    this.tray.destroy();
  }
}
