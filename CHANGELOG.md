# Changelog

All notable changes to Forca will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.1.0] — 2026-06-06

### Fixed
- 417-byte placeholder `.mp3` files deleted from `public/sounds/` (only real `.wav` files remain)
- Unused `@react-oauth/google` dependency removed
- Missing `assets/entitlements.mac.plist` — macOS hardened-runtime entitlements created so `electron-builder --mac` no longer fails
- Empty catch block in `updater.service.ts` now logs via `console.debug` in dev mode
- `console.log` calls in `main.ts` updater events now guarded — only print in development
- **Always-Allowed Apps** section in BlockRules was hardcoded with 5 fake entries that had no effect. Wired end-to-end: store schema → IPC handlers → preload → renderer UI with add/remove; blocker service now filters out always-allowed apps before killing processes
- Notification `setTimeout` in `App.tsx` now tracked via ref and cleared on unmount (was a memory leak)
- `TodayView.tsx` — removed unused `window.electronAPI.zone.getActive()` call (active zone already arrives via IPC listener)
- `.gitignore` pattern `.env.*` was also ignoring `.env.example` — added `!.env.example` negation rule

### Added
- `.env.example` template documenting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables

### Performance
- **React.lazy + Suspense** for all 6 route views — initial JS bundle reduced from 580 kB to 155 kB (73% reduction); 388 kB recharts chunk (StatsPage) deferred until visited
- **React.memo** applied to 12 components: Layout, Sidebar, ActiveZoneCard, Timeline, StreakCounter, BreakReminder, StatCard, EventRow, ScoreCard, SummaryItem, MilestoneCard, ToggleSetting
- **Session history capped** to 90 days — old sessions auto-pruned on each save via `pruneOldSessions()`
- **Tray updates throttled** from every 1 s to every 30 s during active zones (97% fewer redraws)
- **Calendar meeting monitor** interval reduced from 10 s to 5 min (300 s)
- **Settings writes debounced** — rapid toggle changes batch into a single IPC call after 500 ms
- **Electron optimizations**:
  - `app.disableHardwareAcceleration()` — saves GPU memory while idle
  - `backgroundThrottling: true` on `BrowserWindow` webPreferences
  - `setBackgroundThrottling(true/false)` on window hide/show — lowers CPU when minimized to tray
  - V8 flags `--max-old-space-size=256 --code-cache` — caps heap at 256 MB, enables bytecode cache
  - `disable-renderer-backgrounding` command-line switch
  - `os.setPriority()` — sets `IDLE_PRIORITY_CLASS` on Windows / nice 10 on Unix so Forca never competes with user's main apps

### Changed
- **Sidebar redesigned** — replaced colored-dot header with 32×32 px app icon (`/forca-icon.png`) next to "Forca" branding; removed the bottom section that showed "Forca v1.0", "Ready to focus", and the "FZ" avatar placeholder
- Lo-fi removed from ambient sounds entirely — deleted `lofi.wav`, removed from `AmbientSoundType` type, all UI dropdowns, sound file map, and sound generation scripts

## [v1.0.2] — 2026-06-06

### Fixed
- TypeScript typecheck failures (TS6305, TS6306) caused by broken project references in `tsconfig.json`
- Potential null reference on `activeZone` in `ActiveZoneCard.tsx` (TS18047)
- Type mismatch on select `value` prop in `ZoneProfiles.tsx` (TS2322)
- Removed unused imports and variables across 8 files to eliminate lint warnings
- Vite CJS deprecation warning for `postcss.config.js`

### Added
- Real ambient sound files replacing placeholder MP3s (`public/sounds/*.wav`): pink noise (rain), white noise, lo-fi chord pad, forest ambience with bird chirps
- Google Calendar OAuth flow with local HTTP server on a random port — opens a dedicated auth window, captures the redirect, and exchanges the code for tokens
- Automatic token refresh for expired Google Calendar access tokens via `oauth2Client.on('tokens')` handler
- macOS/Linux process blocking via `pgrep` + `kill` (was Windows-only)
- Cross-platform `/etc/hosts` site blocking (was Windows-only)
- `scripts/generate-sounds.js` — standalone script to generate ambient sound WAV files

### Changed
- `postcss.config.js` renamed to `postcss.config.mjs` for explicit ESM
- `src/renderer/hooks/useAudio.ts` — sound file references changed from `.mp3` to `.wav`
- `scripts/dev.js` — updated to call `generate-sounds.js` instead of creating placeholder MP3s
- `src/main/services/blocker.service.ts` — refactored process monitoring with platform-agnostic `findProcessPids()` and `killProcess()` methods
- `src/main/services/calendar.service.ts` — rewrote `authenticateGoogle()` with proper OAuth code exchange and token persistence

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
