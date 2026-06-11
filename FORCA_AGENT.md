# Forca Agent Context

## Project Overview
Forca is an Electron 42 desktop app (React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand 4) that automatically starts focus zones after meetings end. It uses a companion MV3 browser extension to block distracting websites via `declarativeNetRequest`.

## All Features
- **Calendar integration** (Google Calendar + iCal): detects meeting end and auto-triggers focus zones
- **Focus zones**: countdown timers with blocked websites, ambient sounds, and DND sync
- **Zone profiles**: reusable configurations with icons, sounds, and blocked site lists
- **Break reminders**: periodic break suggestions during long focus sessions
- **Score tracking**: focus score, weekly summaries, streaks
- **Do Not Disturb**: OS-level DND sync (macOS / Windows)
- **Ambient sounds**: rain, white noise, forest
- **Tray integration**: pause/resume/end from system tray
- **Auto-start / auto-launch**: configurable startup behavior
- **Cloud sync**: Firebase-based settings and session sync
- **Auto-updater**: electron-updater for seamless updates
- **Onboarding wizard**: first-run flow with zone creation and extension setup

## Architecture Decisions

### V2 Site Blocking (Browser Extension)
- **WebSocket server** (`src/main/services/websocket-server.service.ts`): binds to `127.0.0.1:7432`, manages client connections with handshake + auto-reconnect, broadcasts zone lifecycle events, accepts client commands
- **Zone engine integration** (`src/main/services/zone-engine.service.ts`): broadcasts `zone:start`/`zone:end`/`zone:pause`/`zone:resume` over WS; initial state sync via `getActiveZoneState` callback
- **Extension IPC** (`src/main/ipc/extension.ipc.ts`): `extension:get-client-count`, `extension:deploy`, `extension:identity`
- **MV3 Extension** (`browser-extension/`):
  - `manifest.json` for Firefox/Waterfox (background.scripts, CSP, web_accessible_resources, gecko.id=forca-focus@forca.app)
  - `manifest.chrome.json` for Chrome/Edge/Brave/Opera (service_worker, key=deterministic ID `kgklifcallapplgnjipeloiaocgalhco`)
  - `background.js`: WebSocket client + declarativeNetRequest rule management (`getDynamicRules` + `removeRuleIds` for cross-browser compat) + tab cleanup + storage sync
  - `blocked/blocked.html` + `blocked.js`: Deep Void (#1A1035) redirect page with SVG timer ring, chrome.storage.onChanged reactive updates, local 1s tick countdown, pause/end controls via `chrome.runtime.sendMessage`
  - `popup/popup.html` + `popup.css` + `popup.js`: connection status, active zone display, pause/end actions
  - Extension icons (16, 48, 128px) generated via sharp
- **Command pipeline**: blocked.js → `chrome.runtime.sendMessage` → background.js → WebSocket (`client:pause`/`client:resume`/`client:end`) → Electron → `ZoneEngine.pauseZone/resumeZone/stopZone`
- **Tab cleanup**: on zone end, all open `blocked/blocked.html` tabs are closed via `chrome.tabs.remove(ids)`
- **Cross-browser DNR**: uses `getDynamicRules` + `removeRuleIds` (no `removeAll` flag, unsupported in Firefox)
- **Debug logging stripped**: all developer `console.log` removed; only `console.error`/`console.warn` retained for unrecoverable failures

### Extension Auto-Deployment (`src/main/services/extension-deploy.service.ts`)
Three deployment methods tried in order:
1. **Chromium Registry** (Chrome/Brave/Edge on Windows): writes `HKCU\Software\{Google\Chrome|BraveSoftware\Brave|Microsoft\Edge}\Extensions\{id}` with `update_url` and `path` via `reg.exe`
2. **Firefox Enterprise Policy**: detects Firefox/Waterfox install directories, creates `distribution/policies.json` with `ExtensionSettings` → `force_installed` + `install_url: file:///path/to/extension/`
3. **Store URL fallback**: `shell.openExternal` to browser store (URLs configured when published)

### Onboarding Flow (`src/renderer/components/OnboardingFlow.tsx`)
4-step wizard:
- **Step 1**: Welcome screen with feature overview
- **Step 2**: Create first focus zone (name, duration, blocked sites)
- **Step 3**: Install browser extension — 4 browser select cards (Chrome, Brave, Edge, Firefox) with colored initials. Click triggers `extension:deploy` IPC. On success: verification auto-starts via `extension.getClientCount()` polling every 2s. On failure: shows manual install instructions with retry. On WebSocket handshake: green "Success: Connected!" unlocks Continue. Skip link available.
- **Step 4**: Completion screen with start button
- Uses `crypto.randomUUID()` for zone/profile IDs; `btn-primary`/`btn-secondary` CSS classes from index.css

### Chrome Extension Identity
- RSA 2048-bit key pair generated; public key added to `manifest.chrome.json` as `"key"` field
- Chrome derives extension ID from this key: `kgklifcallapplgnjipeloiaocgalhco` (32 chars, a-p alphabet)
- Private key saved to `forca-chrome-key.pem` (gitignored) — required to preserve ID when publishing to Chrome Web Store
- Firefox ID: `forca-focus@forca.app` (from `browser_specific_settings.gecko.id` in manifest.json)

### Custom App Blocking Removed
V1 used Windows hosts-file modification, `taskkill`/`pgrep` process killing, DNS flush, admin elevation. All replaced by WebSocket + declarativeNetRequest extension architecture. No `is-admin`, no `execSync`, no admin elevation, no hosts file, no DNS flushing. Port 7432 must be free for WebSocket server.

## Extension Publishing Checklist
Before publishing to browser stores:
- Update `STORE_URLS` in `src/main/services/extension-deploy.service.ts` — set Chrome Web Store URL and Firefox Add-ons URL
- Use `forca-chrome-key.pem` when uploading to Chrome Web Store to preserve extension ID `kgklifcallapplgnjipeloiaocgalhco`
- After publishing, the registry `update_url` entries will pull the signed extension automatically

## Key Files

### Main Process
- `src/main/main.ts` — app lifecycle, wsServer.start/stop, setExtensionDir, all IPC registration
- `src/main/preload.ts` — contextBridge exposing `electronAPI` with all IPC channels
- `src/main/services/websocket-server.service.ts` — WS server on 127.0.0.1:7432
- `src/main/services/zone-engine.service.ts` — zone lifecycle, WS broadcasts
- `src/main/services/extension-deploy.service.ts` — registry + Firefox policy + store fallback
- `src/main/services/blocker.service.ts` — lightweight site tracker (no hosts/app killing)
- `src/main/ipc/extension.ipc.ts` — extension:deploy, extension:identity, extension:get-client-count
- `src/main/ipc/app.ipc.ts` — app lifecycle channels (completeOnboarding, etc.)
- `src/main/store/store.ts` — electron-store schema (onboardingComplete, settings)

### Renderer
- `src/renderer/components/OnboardingFlow.tsx` — 4-step wizard, browser cards, auto-deploy, live verification
- `src/renderer/components/BlockRules.tsx` — blocked website editor + extension status indicator (green/red dot)
- `src/renderer/stores/appStore.ts` — Zustand store for all app state
- `src/renderer/types/index.ts` — TypeScript declarations for `window.electronAPI`

### Browser Extension
- `browser-extension/manifest.json` — Firefox/Waterfox (background.scripts, CSP for ws://127.0.0.1:7432, web_accessible_resources)
- `browser-extension/manifest.chrome.json` — Chrome/Edge/Brave/Opera (service_worker, key for deterministic ID)
- `browser-extension/background.js` — WS client, DNR rule management, tab cleanup, message forwarding
- `browser-extension/blocked/blocked.html` + `blocked.js` — redirect page with timer, pause/end controls
- `browser-extension/popup/popup.html` + `popup.css` + `popup.js` — toolbar popup
- `browser-extension/icons/icon-{16,48,128}.png` — extension icons

## Build Commands
- `npm run build` — TypeScript compile + Vite renderer build
- `npm start` — run compiled Electron app (`electron .`)
- `npm run typecheck` — `tsc --noEmit` (both node + renderer)
- `npm run lint` — ESLint on `src/`

## Critical Context
- Port 7432 must be free for WebSocket server; running app occupies it and must be killed before restart
- Extension loading in Firefox/Waterfox requires selecting the manifest file directly in "Load Temporary Add-on"
- `content_security_policy` in Firefox manifest required for `ws://127.0.0.1:7432` connections
- `web_accessible_resources` required for DNR redirect to `blocked/blocked.html` to work
- `forca-chrome-key.pem` in gitignore — DO NOT commit private key
