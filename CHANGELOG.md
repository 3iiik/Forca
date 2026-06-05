# Changelog

All notable changes to Forca will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-01-15

### Added

- **Calendar Integration** — connect Google Calendar or any iCal feed. Forca detects when meetings end and auto-starts focus zones.
- **Focus Zones Engine** — named zones with configurable timers, after-meeting triggers, and manual triggers.
- **App & Site Blocking** — block distracting applications and websites during focus sessions. Restores hosts file on cleanup.
- **System Tray** — colored tray icons (idle, focusing, paused) with context menu for quick actions.
- **Smart Suggestions** — calendar pattern analysis detects back-to-back meetings and suggests optimal focus windows.
- **Zone Profiles** — save and switch between presets with blocked apps/sites, timer duration, and ambient sound settings.
- **Ambient Focus Modes** — rain, white noise, lo-fi, and forest sounds via Web Audio API with volume control.
- **Focus Score** — daily/weekly/monthly productivity scoring (0–100) with Recharts visualizations.
- **Break Reminders** — Pomodoro-style 50-minute focus / 10-minute break with configurable intervals.
- **Do Not Disturb Sync** — automatically enable DND on macOS and Windows during focus sessions.
- **Multi-Device Sync** — Firebase Auth + Firestore for cross-device settings and session sync.
- **Focus Streaks** — consecutive day tracking with milestone unlocks and streak counter.
- **Auto-Updater** — seamless updates via electron-updater with GitHub Releases.
- **Dark Mode** — system-following dark/light theme with Tailwind CSS.
- **Close-to-Tray** — minimize to system tray instead of quitting.

### Changed

- Initial release.
