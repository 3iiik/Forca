function showStatus(id) {
  ['statusDisconnected', 'statusConnecting', 'statusIdle', 'statusActive', 'statusPaused'].forEach(s => {
    document.getElementById(s).style.display = s === id ? 'flex' : 'none';
  });
}

function updateUI(data) {
  const zoneInfo = data.zoneInfo || { status: 'idle', zoneName: '', sites: [], remaining: 0 };
  const wsStatus = data.wsStatus || 'disconnected';

  const actionsContainer = document.getElementById('actionsContainer');

  if (wsStatus === 'disconnected' || !wsStatus) {
    showStatus('statusDisconnected');
    actionsContainer.style.display = 'none';
    return;
  }

  if (wsStatus === 'connecting') {
    showStatus('statusConnecting');
    actionsContainer.style.display = 'none';
    return;
  }

  switch (zoneInfo.status) {
    case 'active':
      showStatus('statusActive');
      document.getElementById('activeZoneName').textContent = zoneInfo.zoneName || 'Focus';
      document.getElementById('activeSitesCount').textContent =
        `${(zoneInfo.sites || []).length} sites blocked`;
      document.getElementById('activeTimeRemaining').textContent = formatTime(zoneInfo.remaining || 0);
      actionsContainer.style.display = 'flex';
      document.getElementById('pauseActionBtn').innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause Zone';
      break;

    case 'paused':
      showStatus('statusPaused');
      document.getElementById('pausedZoneName').textContent = zoneInfo.zoneName || 'Focus';
      actionsContainer.style.display = 'flex';
      document.getElementById('pauseActionBtn').innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume Zone';
      break;

    default:
      showStatus('statusIdle');
      actionsContainer.style.display = 'none';
  }
}

function formatTime(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function sendToBackground(type) {
  chrome.runtime.sendMessage({ type, source: 'popup' }, () => {
    window.close();
  });
}

chrome.storage.local.get(['zoneInfo', 'wsStatus'], updateUI);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.zoneInfo || changes.wsStatus) {
    chrome.storage.local.get(['zoneInfo', 'wsStatus'], updateUI);
  }
});

setInterval(() => {
  chrome.storage.local.get(['zoneInfo', 'wsStatus'], updateUI);
}, 3000);

document.getElementById('reconnectBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'reconnect', source: 'popup' });
});

document.getElementById('pauseActionBtn').addEventListener('click', () => {
  sendToBackground('pause-zone');
});

document.getElementById('endActionBtn').addEventListener('click', () => {
  sendToBackground('end-zone');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'reconnect', source: 'popup' });
  window.close();
});
