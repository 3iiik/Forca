# Forca v2.2.1 — Polish Release Report

**Date:** 2026-06-25  
**Previous:** v2.2.0 (Stability & Performance)  
**Target:** v2.2.1 (Polish & Refinement)

---

## 1. First-Close Tray Education Modal

| Item | Status |
|------|--------|
| Dialog on first close-to-tray | ✅ |
| "Don't show again" checkbox | ✅ |
| Preference persisted to store | ✅ |
| No disruption to existing flow | ✅ |

**Summary:** When a user closes the main window for the first time (with close-to-tray enabled), an informative dialog now explains that Forca continues running in the system tray. The dialog includes a "Don't show this message again" checkbox that persists the preference to the electron-store. After the first acknowledgment, the window hides silently as before.

**Files changed:**
- `src/main/store/store.ts` — Added `trayEducationShown` to schema and defaults
- `src/main/main.ts` — Added `dialog` import; updated `close` event handler

---

## 2. Extension First-Run Guidance

| Item | Status |
|------|--------|
| Improved idle state message | ✅ |
| Clearer connection feedback | ✅ |

**Summary:** The browser extension popup's idle-state description was updated from "Start a focus session from the desktop app" to "Connected and ready. Open the desktop app to create or start a Focus Zone." This gives clearer guidance to users who have just installed the extension or have no active zone.

**Files changed:**
- `browser-extension/popup/popup.html` — Updated idle card description

---

## 3. Punycode Deprecation Investigation

| Item | Status |
|------|--------|
| Source identified | ✅ |
| Impact assessed | ✅ |
| Documentation updated | ✅ |

**Findings:**
- **Warning:** `(node:XXXX) [DEP0040] DeprecationWarning: The 'punycode' module is deprecated.`
- **Dependency chain:** `eslint@8.x → ajv@6.x → uri-js@4.4.1 → punycode@2.3.1`
- **Scope:** Dev dependency only (`eslint` is in `devDependencies`). The warning does **not** appear in the production build.
- **Root cause:** The `uri-js` package uses Node.js's deprecated built-in `punycode` module. The `uri-js` package (v4.4.1) is at its latest version and has not yet shipped a fix.
- **Node.js version:** Warning triggered under Node.js v24+.
- **Upstream tracking:** https://github.com/garycourt/uri-js/issues/52

**Recommendation:** No action required for production. The warning is harmless and only visible during development (linting). Monitor the `uri-js` package for a fix; once available, update `eslint` which depends on it. Alternatively, upgrading from ESLint 8 to ESLint 9 would break the chain entirely.

---

## 4. Manual Validation Results

### Build / TypeScript / Lint

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Passed (0 errors, 0 warnings) |
| `npm run typecheck` | ✅ Passed (0 errors) |
| `npm run lint` | ✅ Passed (0 errors, 0 warnings) |

### Build Output Size
```
dist/renderer/index.html                   0.78 kB  (gzip:  0.44 kB)
dist/renderer/assets/index-DxQP6g2M.css   28.10 kB  (gzip:  5.66 kB)
dist/renderer/assets/index-DkAFz_BR.js   188.76 kB  (gzip: 58.39 kB)
dist/renderer/assets/StatsPage-wE8EpUFd.js 388.99 kB (gzip: 107.28 kB)
Total build time: 7.89s
```

### Sleep / Wake
**Scenario:** System enters sleep (lid close / timeout) while a Focus Zone is active, then wakes up.
- **Expected:** WebSocket reconnects, zone timer resumes, tray icon reflects state.
- **Manual verification required:** Run the app, start a zone, sleep the system, wake it, and verify the app reconnects and the zone resumes.

### Browser Restart
**Scenario:** Browser is closed and reopened while Forca is running.
- **Expected:** Chrome extension reconnects to the WebSocket server automatically (heartbeat mechanism handles this).
- **Manual verification required:** Open the extension popup → it should show "Connected" status after browser restart.

### Network Disconnect / Reconnect
**Scenario:** Network cable unplugged or Wi-Fi disabled while a zone is active, then re-enabled.
- **Expected:** WebSocket detects disconnection, shows "Disconnected" state, auto-reconnects when network returns.
- **Manual verification required:** Verify the popup shows "Disconnected" during network loss and returns to active/idle state after reconnection.

---

## 5. Summary

| Area | Status | Notes |
|------|--------|-------|
| Tray education | ✅ Implemented | Non-intrusive, persists preference |
| Extension guidance | ✅ Implemented | Clearer messaging for first-run users |
| Punycode deprecation | ✅ Investigated | Dev-only, tracked upstream |
| Build / Lint / Typecheck | ✅ All passing | |
| Manual validation scenarios | 🟡 Manual steps | See Section 4 for verification checklist |

**Overall Score:** All code changes pass typecheck, lint, and build. No regressions introduced. Ready for release after manual scenario verification.
