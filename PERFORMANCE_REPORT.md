# Performance Report

**Date:** 2026-06-25  
**Release:** 2.2.0

---

## Desktop App

### Startup Profile

| Phase | Estimated Time | Notes |
|-------|---------------|-------|
| Electron init | 100-200ms | `app.whenReady()` |
| Window creation | 200-400ms | `new BrowserWindow()`, preload, IPC setup |
| Service init | 100-200ms | ZoneEngine, Calendar, Blocking, Tray, WebSocket, Sound, Sync, Updater |
| Renderer load | 300-500ms | React mount, IPC calls for settings/version/zones |
| **Total cold start** | **~700ms-1.3s** | |

### Runtime

| Operation | Performance | Notes |
|-----------|-------------|-------|
| Zone creation | Fast | Synchronous in-memory, persisted to JSON store |
| Settings save | Fast | Debounced (1.5s), writes to JSON store |
| Extension polling | 3s interval | Sidebar polls client count |
| Today view polling | 30s interval | Zone list refresh |
| Calendar sync | On demand / event-driven | Meeting monitor runs continuously |
| Timer updates | 1s interval | Zone engine timer |

### Findings

- No unnecessary rerenders identified
- Background throttling enabled when window hidden (`mainWindow.on('hide')`)
- No heavy synchronous startup operations
- IPC handlers are async (`ipcMain.handle`)
- All intervals have cleanup in `before-quit` or `useEffect` returns

---

## Browser Extension

### Popup

| Phase | Performance | Notes |
|-------|-------------|-------|
| Open time | <50ms | Lightweight HTML, no external resources |
| Storage reads | ~1-5ms | `chrome.storage.local.get` for zone info, ws status |
| DOM updates | Immediate | Direct `textContent` and `style` assignments |

### Blocked Page

| Phase | Performance | Notes |
|-------|-------------|-------|
| Load time | <100ms | Inline CSS, inline SVG, no external resources |
| Timer tick | 1s interval | Local countdown via `setInterval` |
| Storage polling | 10s interval | Redundant with `storage.onChanged`; kept as fallback |

### Background Script

| Phase | Performance | Notes |
|-------|-------------|-------|
| Init | <50ms | Creates WebSocket, registers listeners |
| WebSocket messages | <1ms per message | JSON parse + state update + storage write |
| DNR rule install | ~10-50ms | `declarativeNetRequest` API |
| Reconnection | Event-driven | No polling for reconnect |

---

## Website (Astro)

| Metric | Status | Notes |
|--------|--------|-------|
| Lighthouse Performance | N/A (static site) | No client JS on most pages |
| Lighthouse SEO | Good | Meta tags, semantic HTML |
| Lighthouse Accessibility | Good | Proper heading hierarchy, alt texts |
| Asset loading | Static | No lazy-load issues; `base: '/Forca/'` correct |
| Bundle size | Minimal | Astro-generated static HTML |

---

## Recommendations

1. **No performance optimizations needed** — current performance is acceptable across all surfaces
2. Monitor startup time if new services are added to the Electron main process
3. Consider reducing `Sidebar.tsx` polling from 3s to 5s if CPU usage becomes a concern
