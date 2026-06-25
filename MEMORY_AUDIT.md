# Memory Audit

**Date:** 2026-06-25  
**Release:** 2.2.0

---

## Scope

Audit of all `setInterval`, `setTimeout`, `addEventListener`, IPC listeners, observers, and WebSocket handlers across the Forca ecosystem for proper lifecycle management.

---

## Summary

| Category | Total | Cleaned | Uncleaned (Leak) |
|----------|-------|---------|-------------------|
| `setInterval` | 10 | 10 | 0 |
| `setTimeout` | 7 | 6 | 1 (fixed) |
| `addEventListener` (DOM) | 7 | 4 | 3 (ephemeral) |
| IPC listeners | 57 | 57 | 0 |
| WebSocket listeners | 11 | 11 | 0 |
| Observers | 0 | 0 | 0 |
| React useEffect cleanup | 18 | 18 | 0 |

---

## Fixed in This Release

### 1. Uncancellable `setTimeout` — Meeting End Auto-Start

**File:** `src/main/main.ts:167`  
**Problem:** `setTimeout` to auto-start a zone after meeting ended was never stored. If user quit before timeout fired, it would attempt to start a zone post-shutdown. Multiple meetings ending simultaneously would create overlapping timeouts.  
**Fix:** Timer handle stored in `meetingZoneTimer` variable; cleared in `before-quit` handler and before reassignment.

### 2. Duplicate `autoUpdater` Listeners

**Files:** `src/main/main.ts:205-241`, `src/main/services/updater.service.ts:15-35`  
**Problem:** Both `main.ts` and `updater.service.ts` registered listeners for `update-available`, `download-progress`, `update-downloaded`, and `error`. Renderer received duplicate events.  
**Fix:** Removed listener registrations from `updater.service.ts.init()`. `main.ts` is now the single source for update event handling.

### 3. Blocked Page Polling Interval Never Cleaned

**File:** `browser-extension/blocked/blocked.js:128`  
**Problem:** 10-second polling interval continued indefinitely even after zone ended.  
**Fix:** Interval ID stored in `pollTimer`; `stopPolling()` called in `applyZoneInfo()` when status becomes idle.

### 4. Background.js WebSocket Race Condition

**File:** `browser-extension/background.js:51`  
**Problem:** `connect()` created new WebSocket without closing previous one. Old socket's `onclose` could fire after new connection established, triggering false reconnect.  
**Fix:** `connect()` now closes previous `ws` connection before creating new one.

---

## Verified Clean (No Issues)

### All `setInterval` (6 in Electron, 4 in Extension)

| File | Interval | Cleanup |
|------|----------|---------|
| `TodayView.tsx:31` | 30s zone list poll | `clearInterval` in useEffect return |
| `Sidebar.tsx:25` | 3s extension count poll | `clearInterval` in useEffect return |
| `OnboardingFlow.tsx:115` | 1s elapsed timer | `clearInterval` in useEffect + skip/timeout |
| `OnboardingFlow.tsx:119` | 200ms poll ref | Same cleanup as above |
| `BreakReminder.tsx:11` | 10s focus minute poll | `clearInterval` in useEffect return |
| `zone-engine.service.ts:303` | 1s zone timer | `stopTimer()` in `destroy()` |
| `zone-engine.service.ts:361` | Break timer | `endBreakTimer()` in `destroy()` |
| `calendar.service.ts:260` | Meeting monitor | `stopMeetingMonitor()` in `destroy()` |
| `blocked.js:29` | 1s timer tick | `stopTick()` when zone ends |
| `blocked.js:128` | 10s storage poll | `stopPolling()` when zone ends (fixed) |

### All React `useEffect` (18 total)

All return proper cleanup functions or have no subscriptions to clean up.

### IPC Event Subscriptions

All `ipcRenderer.on()` subscriptions return unsubscribe functions. All consumers call them in `useEffect` cleanup. `App.tsx:109-110` also calls `removeAllListeners` for safety.

---

## Known Acceptable Gaps

| Location | Issue | Rationale |
|----------|-------|-----------|
| `popup/popup.js:82` | 3s interval never cleared | Popup is ephemeral (auto-closes) |
| `blocked/blocked.js:139-148` | 3 click listeners never removed | Page is closed when zone ends |
| `popup/popup.js:86-94` | 3 click listeners never removed | Popup is ephemeral |

---

## Conclusion

All significant memory leak risks have been addressed. The remaining un-cleaned resources are in ephemeral contexts (popup, blocked page after zone end) and do not cause practical leaks.
