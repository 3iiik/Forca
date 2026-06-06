# Forca — Agent Context

## App Name & Description

**Forca** (pronounced "for-sa") is an Electron + React desktop app for deep focus sessions powered by calendar integration and smart blocking.

> *Your calendar knows when you're free. Forca makes sure you actually use that time.*

Forca detects when meetings end, automatically starts focus zones, blocks distracting apps and websites, enables Do Not Disturb, plays ambient sounds, and tracks your productivity score and streaks.

---

## Full Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 29 |
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State Management | Zustand 4 |
| Charts | Recharts 2 |
| Main Process Bundler | tsc (tsconfig.node.json) |
| IPC | `ipcMain.handle` / `ipcRenderer.invoke` + `contextBridge` |
| Persistence | electron-store 8 |
| Calendar | `googleapis` (Google OAuth2) + `node-ical` (iCal feeds) |
| Sync | Firebase Auth + Firestore |
| Auto-Update | electron-updater 6 |
| Installer | electron-builder (NSIS, DMG, AppImage, deb, rpm) |
| CI/CD | GitHub Actions |
| Hosting (landing) | GitHub Pages (`docs/` folder) |

---

## All Features

### 1. Calendar Integration
- Connect Google Calendar via OAuth2 or any iCal feed URL
- Fetches today's events and monitors for meeting end times
- Auto-triggers focus zones after meetings end (configurable delay)

### 2. Focus Zones Engine
- Named zones with configurable duration, triggers, and presets
- Trigger types: manual, after-meeting
- Countdown timer with pause/resume
- Auto-start when calendar gaps are detected

### 3. App & Site Blocking
- Blocks distracting processes via `taskkill` on Windows (process name matching)
- Blocks distracting websites via `/etc/hosts` file modification (redirects to 127.0.0.1 / 0.0.0.0)
- Allowlist support for apps that should never be blocked
- Automatic cleanup on focus end or app quit

### 4. System Tray
- Colored tray icons: idle (gray), focusing (green/gold), paused (yellow)
- Context menu: Start Focus, Pause/Resume, Skip, Show Schedule, Settings, Quit
- Notifications for session events
- macOS: menu bar app (dock icon hidden by default)
- Windows: notification area + taskbar

### 5. Smart Suggestions
- Analyzes calendar patterns to detect back-to-back meetings
- Suggests optimal focus windows based on free time between events
- Recommends zone duration based on available gap

### 6. Zone Profiles
- Named presets combining: blocked apps, blocked sites, timer duration, ambient sound, volume
- Quick-switch between profiles from the UI

### 7. Ambient Focus Modes
- Four soundscapes: rain, white noise, lo-fi, forest
- Powered by Web Audio API (renderer-side via `useAudio` hook)
- Volume control and fade-out on zone end
- Audio files served from `public/sounds/` (placeholder MP3s)

### 8. Focus Score
- 0–100 score per session based on completion, duration, and breaks skipped
- Daily, weekly, and monthly aggregation
- Recharts bar/line chart visualizations on the Stats page

### 9. Break Reminders
- Pomodoro-style: 50-minute focus / 10-minute break (configurable)
- Break timer displayed in the UI
- Notification when break starts/ends

### 10. Do Not Disturb Sync
- Windows: enables DND (quiet hours) automatically during focus
- macOS: enables DND via AppleScript/notification center API
- Restores DND setting when focus ends

### 11. Multi-Device Sync
- Firebase Auth for authentication
- Firestore for cross-device settings and session history
- Manual upload/download sync triggers from Settings page

### 12. Focus Streaks
- Consecutive day tracking (at least one completed session per day)
- Current streak count and longest streak
- Milestones at 3, 7, 14, 30, 60, 90, 365 days
- Displayed on the Today view

### 13. Auto-Updater
- Checks for updates on every launch via GitHub Releases
- `autoUpdater.checkForUpdatesAndNotify()` on startup + 30s delay
- Events: checking, update-available, update-not-available, download-progress, update-downloaded, error
- `autoDownload: false` — user chooses when to install
- Native notification on download complete; clicking it restarts to install

### 14. Theme
- Dark/light mode: manual toggle or system-following
- Tailwind CSS `dark:` variant throughout
- Persisted in electron-store settings

### 15. Close-to-Tray
- Closing the window minimizes to system tray instead of quitting
- Configurable in Settings (general.closeToTray)
- `app.on('close')` event intercepts and hides window

---

## Folder Structure

```
C:\Users\Islem\forca\
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── release.yml
├── assets/
│   └── icons/
│       ├── icon-blue.png      (256×256, tray idle)
│       ├── icon-green.png     (256×256, tray focusing)
│       ├── icon-gray.png      (256×256, tray idle alt)
│       └── icon-yellow.png    (256×256, tray paused)
├── dist/                      (compiled output)
│   ├── main/
│   │   ├── main.js
│   │   ├── preload.js
│   │   ├── ipc/
│   │   ├── services/
│   │   └── store/
│   ├── renderer/              (Vite build output)
│   └── shared/
├── docs/
│   └── index.html             (GitHub Pages landing page)
├── node_modules/
├── public/
│   └── sounds/
│       ├── rain.mp3
│       ├── white-noise.mp3
│       ├── lofi.mp3
│       └── forest.mp3
├── release/                   (electron-builder output)
│   ├── Forca-Portable-x64.exe
│   └── Forca-Setup-x64.exe
├── scripts/
│   └── dev.js                 (placeholder asset generator)
├── src/
│   ├── main/
│   │   ├── main.ts            (Electron entry point)
│   │   ├── preload.ts         (contextBridge API)
│   │   ├── types.d.ts         (Firebase type declarations)
│   │   ├── ipc/
│   │   │   ├── app.ipc.ts
│   │   │   ├── blocker.ipc.ts
│   │   │   ├── calendar.ipc.ts
│   │   │   ├── dnd.ipc.ts
│   │   │   ├── profiles.ipc.ts
│   │   │   ├── sessions.ipc.ts
│   │   │   ├── settings.ipc.ts
│   │   │   ├── sound.ipc.ts
│   │   │   ├── stats.ipc.ts
│   │   │   ├── sync.ipc.ts
│   │   │   ├── tray.ipc.ts
│   │   │   └── zone.ipc.ts
│   │   ├── services/
│   │   │   ├── blocker.service.ts
│   │   │   ├── calendar.service.ts
│   │   │   ├── dnd.service.ts
│   │   │   ├── score.service.ts
│   │   │   ├── sound.service.ts
│   │   │   ├── suggestion.service.ts
│   │   │   ├── sync.service.ts
│   │   │   ├── tray.service.ts
│   │   │   ├── updater.service.ts
│   │   │   └── zone-engine.service.ts
│   │   └── store/
│   │       └── store.ts
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── ActiveZoneCard.tsx
│   │   │   ├── AmbientSoundControl.tsx
│   │   │   ├── BlockRules.tsx
│   │   │   ├── BreakReminder.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── TodayView.tsx
│   │   │   └── ZoneProfiles.tsx
│   │   ├── hooks/
│   │   │   └── useAudio.ts
│   │   ├── stores/
│   │   │   └── appStore.ts
│   │   └── types/
│   │       └── index.ts
│   └── shared/
│       └── types.ts
├── .gitignore
├── AGENT_CONTEXT.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE                       (MIT)
├── README.md
├── SECURITY.md
├── index.html                    (Vite HTML entry)
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json                 (renderer TS config)
├── tsconfig.node.json            (main process TS config)
└── vite.config.ts
```

---

## GitHub Repository URL

```
https://github.com/3iiik/forca
```

- **Owner:** `3iiik`
- **Repo:** `forca`
- **Landing page:** `https://3iiik.github.io/forca/` (via GitHub Pages, `docs/` folder)

---

## How to Run the App Locally

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
git clone https://github.com/3iiik/forca.git
cd forca
npm install
```

### Development Mode (hot reload)
```bash
npm run dev
```
This runs both:
- `tsc --watch` for the main process
- `vite` dev server for the renderer (port 5173)

Main process loads from `http://localhost:5173` when `VITE_DEV_SERVER_URL` is set.

### Production Build & Run
```bash
npm run build    # compile main + renderer
npm start        # launch the packaged app
```

### Platform-Specific Builds
```bash
npm run build:win     # Windows (NSIS installer + portable)
npm run build:mac     # macOS (DMG + ZIP for x64 + arm64)
npm run build:linux   # Linux (AppImage + deb + rpm)
npm run build:all     # all platforms
```

---

## How to Release a New Version

### Versioning (Semantic)
- Patch — bug fixes: `1.0.0` → `1.0.1`
- Minor — new features: `1.0.0` → `1.1.0`
- Major — breaking changes: `1.0.0` → `2.0.0`

### Steps
```bash
# 1. Update version in package.json
# 2. Add entry to CHANGELOG.md
# 3. Commit and push
git add -A
git commit -m "chore: release v1.0.0"
git push origin main

# 4. Tag and push the tag
git tag v1.0.0
git push origin v1.0.0
```

### CI/CD Pipeline (`.github/workflows/release.yml`)
The tag push triggers GitHub Actions:

1. **build-and-test** (ubuntu) — `npm ci` → `npm run lint` → `npm test` → `npm run build`
2. **release-mac** (macos) — `npm run build` → `npx electron-builder --mac --publish always`
3. **release-windows** (windows) — `npm run build` → `npx electron-builder --win --publish always`
4. **release-linux** (ubuntu) — `npm run build` → `npx electron-builder --linux --publish always`

### Artifacts Published to GitHub Releases
| File | Platform | Type |
|---|---|---|
| `Forca-Setup-x64.exe` | Windows | NSIS Installer |
| `Forca-Portable-x64.exe` | Windows | Portable |
| `Forca-x64.dmg` | macOS Intel | DMG |
| `Forca-arm64.dmg` | macOS Apple Silicon | DMG |
| `Forca-x64.AppImage` | Linux | AppImage |
| `Forca-x64.deb` | Linux | Debian |
| `Forca-x64.rpm` | Linux | RPM |
| `latest.yml` / `latest-mac.yml` | All | Auto-update manifests |

### Required GitHub Secrets
Add these under repo → Settings → Secrets and variables → Actions:

| Secret | Description | Required |
|---|---|---|
| `GH_TOKEN` | GitHub PAT with `repo` scope | **YES** |
| `MAC_CERT` | Base64-encoded `.p12` signing certificate | Optional |
| `MAC_CERT_PASSWORD` | Certificate password | Optional |
| `APPLE_ID` | Apple ID email for notarization | Optional |
| `APPLE_PASSWORD` | App-specific password for notarization | Optional |

---

## Key Design Decisions

### Architecture
- **IPC via `ipcMain.handle` / `ipcRenderer.invoke`** — all main-process operations (blocking, tray, DND, calendar, sound, sync) are exposed through a `contextBridge` API, never directly from the renderer.
- **Preload as API surface** — `preload.ts` defines a typed `ElectronAPI` with 12 module categories. Only explicitly listed event channels can be subscribed to from the renderer.

### Sound Architecture
- **SoundService delegates to renderer** — `main.ts` can't use Web Audio API, so it sends `sound:play` / `sound:stop` / `sound:volume` / `sound:fade-out` events to the renderer. The `useAudio` hook in the renderer handles actual playback via `AudioContext` / `OscillatorNode`.
- Audio files served from `public/sounds/` — Vite copies them to `dist/renderer/sounds/` in production.

### Zone Engine Design
- **ZoneEngine receives injected services** — `BlockingService`, `TrayService`, `DndService`, `SoundService` are injected into the constructor to avoid duplicate instances.
- Zone lifecycle: `startZone()` → block apps/sites → enable DND → play ambient sound → start countdown → on complete: unblock, disable DND, stop sound, log session, update score/streak.

### Blocking Strategy
- **Windows-only** for now — `taskkill` for process blocking, `%SystemRoot%\System32\drivers\etc\hosts` for site blocking.
- Comment markers `# Forca - Blocked Sites` / `# Forca - End Blocked Sites` are written to the hosts file for clean removal.
- TODO: add macOS support (`pkill`, `/etc/hosts`).

### TypeScript Build
- **Dual tsconfig** — `tsconfig.json` for the renderer (Vite), `tsconfig.node.json` for the main process (tsc).
- `rootDir: "src"` in `tsconfig.node.json` so both `src/main` and `src/shared` are included.
- `skipLibCheck: true` because `firebase` CJS bundle lacks proper type declarations.
- Firebase types declared manually in `src/main/types.d.ts` via `declare module "firebase/..."`.

### Build & Packaging
- **electron-builder 24** creates proper installers but has a limitation on Windows: `winCodeSign` archive extraction fails when the user lacks symbolic link privileges (admin). Workaround: run `electron-builder` from an **elevated PowerShell** window, or use `electron-packager` as fallback.
- The portable EXE (`Forca-Portable-x64.exe`) passes the signing step but NSIS fails on winCodeSign extraction on non-admin shells.

### Tray Behavior
- **macOS**: dock icon hidden by default (`app.dock?.hide()`), menu bar app behavior.
- **Windows**: appears in the notification area.
- Icons: 256×256 PNG generated by `scripts/dev.js`. Four states: blue (idle/active-ready), green (focusing), gray (idle), yellow (paused).

### App Name History
- Originally named **Focus Zones**, then globally renamed to **Forca**.
- `Focus Zones` / `FocusZones` / `focus-zones` / `focus_zones` → `Forca` / `Forca` / `forca` / `forca` everywhere in source code, configs, package.json, hosts comments, build artifact names.
- Project directory renamed from `focus-zones` → `forca`.
- Feature concept names kept as-is: "focus zone" (singular, lowercase) refers to the feature, not the app.

### Auto-Updater Decision
- `autoDownload: false` — download only starts when the user initiates via the UI.
- Uses `autoUpdater.checkForUpdatesAndNotify()` on launch + 30s delay.
- Update events sent to renderer via IPC channels: `update:available`, `update:progress`, `update:downloaded`.
- Update banner shown in UI: "A new version of Forca is available — restart to update."
- Click notification to restart and install.

### Missing / TODO
- Real Google Calendar OAuth (currently placeholder with URL loading)
- Real ambient sound files (replace placeholder MP3s)
- macOS process blocking (`pkill`) and DND
- Comprehensive test suite
- Linux site blocking (`/etc/hosts` already works on Linux too)
- CI/CD has not been tested end-to-end (no GitHub repo pushed yet)
