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
      actionsContainer.style.display = 'block';
      document.getElementById('pauseActionBtn').textContent = '⏸ Pause Zone';
      break;

    case 'paused':
      showStatus('statusPaused');
      document.getElementById('pausedZoneName').textContent = zoneInfo.zoneName || 'Focus';
      actionsContainer.style.display = 'block';
      document.getElementById('pauseActionBtn').textContent = '▶ Resume Zone';
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

// Load initial state
chrome.storage.local.get(['zoneInfo', 'wsStatus'], updateUI);

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.zoneInfo || changes.wsStatus) {
    chrome.storage.local.get(['zoneInfo', 'wsStatus'], updateUI);
  }
});

// Recheck periodically
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
