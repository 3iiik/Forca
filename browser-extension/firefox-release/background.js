console.log('[Forca] background script loaded');

// ---------------------------------------------------------------------------
// Helpers: handle chrome vs firefox API differences
// ---------------------------------------------------------------------------
const DNR = chrome.declarativeNetRequest;

function removeAllDynamicRules() {
  return new Promise((resolve, reject) => {
    DNR.getDynamicRules((existing) => {
      const ids = existing.map(r => r.id);
      if (ids.length === 0) return resolve();
      DNR.updateDynamicRules(
        { removeRuleIds: ids },
        () => { const e = chrome.runtime.lastError; e ? reject(e) : resolve(); }
      );
    });
  });
}

function addDynamicRules(rules) {
  return new Promise((resolve, reject) => {
    DNR.updateDynamicRules(
      { addRules: rules },
      () => { const e = chrome.runtime.lastError; e ? reject(e) : resolve(); }
    );
  });
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let ws = null;
let reconnectAttempts = 0;
let initRetryCount = 0;
const MAX_RECONNECT_ATTEMPTS = 15;
const RECONNECT_INTERVAL = 2000;
const MAX_INIT_RETRIES = 15; // 30 seconds total (15 × 2s)
let ruleIdCounter = 1;
let zoneInfo = { status: 'idle', zoneName: '', sites: [], remaining: 0, startedAt: null };
let retryTimer = null;
let initRetryTimer = null;

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------
function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  console.log('[Forca] connecting to ws://127.0.0.1:7432 ...');
  ws = new WebSocket('ws://127.0.0.1:7432');

  ws.onopen = () => {
    console.log('[Forca] WebSocket connected, sending handshake');
    reconnectAttempts = 0;
    initRetryCount = 0;
    ws.send(JSON.stringify({ type: 'handshake', payload: { client: 'forca-extension' } }));
    chrome.storage.local.set({ wsStatus: 'connected' });
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    } catch (e) {
      console.error('[Forca] Invalid message:', e);
    }
  };

  ws.onclose = () => {
    console.log('[Forca] WebSocket disconnected' + (reconnectAttempts > 0 ? ' (attempt ' + reconnectAttempts + ')' : ''));
    chrome.storage.local.set({ wsStatus: 'disconnected' });
    ws = null;
    scheduleReconnect();
  };

  ws.onerror = () => {
    if (ws) ws.close();
  };
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('[Forca] max reconnect attempts reached');
    return;
  }
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    reconnectAttempts++;
    console.log('[Forca] reconnect attempt ' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS);
    connect();
  }, RECONNECT_INTERVAL);
}

function startInitRetryWatchdog() {
  if (initRetryTimer) clearInterval(initRetryTimer);
  initRetryCount = 0;
  initRetryTimer = setInterval(() => {
    initRetryCount++;
    const isConnected = ws && ws.readyState === WebSocket.OPEN;
    if (isConnected) {
      console.log('[Forca] connected, stopping init watchdog');
      clearInterval(initRetryTimer);
      initRetryTimer = null;
      return;
    }
    if (initRetryCount >= MAX_INIT_RETRIES) {
      console.log('[Forca] init watchdog max retries reached, giving up');
      clearInterval(initRetryTimer);
      initRetryTimer = null;
      return;
    }
    console.log('[Forca] init watchdog retry ' + initRetryCount + '/' + MAX_INIT_RETRIES);
    connect();
  }, 2000);
}

// ---------------------------------------------------------------------------
// Message handling
// ---------------------------------------------------------------------------
function handleMessage(msg) {
  switch (msg.type) {
    case 'handshake:ack':
      chrome.storage.local.set({ wsStatus: 'connected' });
      break;

    case 'zone:start': {
      zoneInfo = {
        status: 'active',
        zoneName: msg.payload.zoneName || 'Focus',
        sites: msg.payload.sites || [],
        remaining: msg.payload.remaining || 0,
        startedAt: Date.now(),
      };
      chrome.storage.local.set({ zoneInfo });
      installBlockRules(zoneInfo.sites).catch(err =>
        console.error('[Forca] installBlockRules failed:', err)
      );
      break;
    }

    case 'zone:end':
      zoneInfo = { status: 'idle', zoneName: '', sites: [], remaining: 0, startedAt: null };
      chrome.storage.local.set({ zoneInfo });
      removeAllDynamicRules().catch(err =>
        console.error('[Forca] removeAllDynamicRules failed:', err)
      );
      closeBlockedTabs();
      break;

    case 'zone:pause':
      zoneInfo.status = 'paused';
      zoneInfo.remaining = msg.payload.remaining || zoneInfo.remaining;
      chrome.storage.local.set({ zoneInfo });
      removeAllDynamicRules().catch(err =>
        console.error('[Forca] removeAllDynamicRules failed:', err)
      );
      break;

    case 'zone:resume':
      zoneInfo.status = 'active';
      zoneInfo.sites = msg.payload.sites || zoneInfo.sites;
      zoneInfo.remaining = msg.payload.remaining || zoneInfo.remaining;
      chrome.storage.local.set({ zoneInfo });
      installBlockRules(zoneInfo.sites).catch(err =>
        console.error('[Forca] installBlockRules failed:', err)
      );
      break;
  }
}

// ---------------------------------------------------------------------------
// DNR rule management
// ---------------------------------------------------------------------------
function installBlockRules(sites) {
  if (!sites || sites.length === 0) return Promise.resolve();

  const rules = [];

  sites.forEach((site) => {
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    if (!cleanSite) return;

    const filter = '*://' + cleanSite + '/*';

    const id = ruleIdCounter++;
    rules.push({
      id,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/blocked/blocked.html'
            + '?zone=' + encodeURIComponent(zoneInfo.zoneName)
            + '&remaining=' + zoneInfo.remaining,
        },
      },
      condition: {
        urlFilter: filter,
        resourceTypes: ['main_frame', 'sub_frame'],
      },
    });

    if (!cleanSite.startsWith('www.')) {
      const wwwId = ruleIdCounter++;
      rules.push({
        id: wwwId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/blocked/blocked.html'
              + '?zone=' + encodeURIComponent(zoneInfo.zoneName)
              + '&remaining=' + zoneInfo.remaining,
          },
        },
        condition: {
          urlFilter: '*://www.' + cleanSite + '/*',
          resourceTypes: ['main_frame', 'sub_frame'],
        },
      });
    }
  });

  return removeAllDynamicRules().then(() => addDynamicRules(rules));
}

// ---------------------------------------------------------------------------
// Close all open blocked-page tabs
// ---------------------------------------------------------------------------
function closeBlockedTabs() {
  chrome.tabs.query({}, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error('[Forca] tabs.query error:', chrome.runtime.lastError);
      return;
    }
    const blocked = tabs.filter(t => t.url && t.url.includes('blocked/blocked.html'));
    if (blocked.length === 0) return;
    const ids = blocked.map(t => t.id).filter(Boolean);
    chrome.tabs.remove(ids, () => {
      const err = chrome.runtime.lastError;
      if (err) console.warn('[Forca] tabs.remove warning (already closed?):', err.message);
    });
  });
}

// ---------------------------------------------------------------------------
// Remaining-time ticking & tab events
// ---------------------------------------------------------------------------
function updateRemainingOnBlockedPages() {
  if (zoneInfo.status === 'active' && zoneInfo.startedAt) {
    const elapsed = Math.floor((Date.now() - zoneInfo.startedAt) / 1000);
    zoneInfo.remaining = Math.max(0, (zoneInfo.remaining || 0) - elapsed);
    zoneInfo.startedAt = Date.now();
    chrome.storage.local.set({ zoneInfo });
  }
}

chrome.runtime.onStartup.addListener(() => { connect(); startInitRetryWatchdog(); });
chrome.runtime.onInstalled.addListener(() => { connect(); startInitRetryWatchdog(); });
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && zoneInfo.status === 'active') {
    updateRemainingOnBlockedPages();
  }
});

// ---------------------------------------------------------------------------
// Messages from popup / blocked page
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'reconnect') {
    if (ws) ws.close();
    reconnectAttempts = 0;
    connect();
    startInitRetryWatchdog();
    return;
  }

  if (msg.type === 'pause-zone') {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const cmd = zoneInfo.status === 'paused' ? 'client:resume' : 'client:pause';
      const payload = zoneInfo.status === 'paused'
        ? { sites: zoneInfo.sites, remaining: zoneInfo.remaining }
        : { remaining: zoneInfo.remaining };
      ws.send(JSON.stringify({ type: cmd, payload }));
    }
    return;
  }

  if (msg.type === 'end-zone') {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'client:end', payload: {} }));
    }
    closeBlockedTabs();
    return;
  }
});

// Connect immediately with aggressive retry watchdog
connect();
startInitRetryWatchdog();
