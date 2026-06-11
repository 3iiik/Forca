const CIRCUMFERENCE = 2 * Math.PI * 85;

let zoneName = 'Focus';
let localRemaining = 0;
let initialRemaining = 0;
let zoneStatus = 'active';
let tickTimer = null;

function formatTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateDOM(name, remaining) {
  zoneName = name;
  document.getElementById('zoneName').textContent = name || 'Focus';
  document.getElementById('timeDisplay').textContent = formatTime(remaining);

  const fraction = initialRemaining > 0
    ? Math.min(Math.max(remaining / initialRemaining, 0), 1)
    : 0;
  document.getElementById('progressCircle').style.strokeDashoffset =
    CIRCUMFERENCE * (1 - fraction);
}

function startTick() {
  stopTick();
  tickTimer = setInterval(() => {
    if (zoneStatus === 'active') {
      localRemaining = Math.max(0, localRemaining - 1);
      updateDOM(zoneName, localRemaining);
    }
  }, 1000);
}

function stopTick() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
}

function applyZoneInfo(data) {
  if (!data || !data.zoneName) return;

  zoneName = data.zoneName;
  zoneStatus = data.status || 'active';

  localRemaining = Math.max(0, data.remaining || 0);

  if (initialRemaining <= 0) initialRemaining = localRemaining;

  updateDOM(zoneName, localRemaining);

  const pauseBtn = document.getElementById('pauseBtn');
  const statusDot = document.querySelector('.status-dot');
  const subtitle = document.querySelector('.subtitle');

  const reloadLink = document.getElementById('reloadLink');

  if (zoneStatus === 'paused') {
    pauseBtn.textContent = '▶ Resume Zone';
    pauseBtn.className = 'btn';
    statusDot.style.background = '#F59E0B';
    subtitle.textContent = 'Focus Zone — Paused';
    if (reloadLink) reloadLink.style.display = 'block';
  } else if (zoneStatus === 'active') {
    if (reloadLink) reloadLink.style.display = 'none';
    pauseBtn.textContent = '⏸ Pause Zone';
    pauseBtn.className = 'btn';
    statusDot.style.background = '#1D9E75';
    subtitle.textContent = "You're in Focus Mode";
  } else {
    pauseBtn.textContent = '⏸ Zone Ended';
    pauseBtn.className = 'btn btn-disabled';
    pauseBtn.disabled = true;
    document.getElementById('endBtn').disabled = true;
    document.getElementById('endBtn').textContent = '✓ Zone Ended';
    if (reloadLink) reloadLink.style.display = 'none';
    statusDot.style.background = '#6B5FD4';
    subtitle.textContent = 'Focus session complete';
  }
}

{
  const params = new URLSearchParams(window.location.search);
  const urlZone = params.get('zone') || 'Focus';
  const urlRemaining = parseInt(params.get('remaining') || '0', 10);
  zoneName = urlZone;
  localRemaining = Math.max(0, urlRemaining);
  if (initialRemaining <= 0) initialRemaining = localRemaining;
  updateDOM(zoneName, localRemaining);
  startTick();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.zoneInfo) return;
  const newVal = changes.zoneInfo.newValue;
  if (!newVal) {
    stopTick();
    zoneStatus = 'idle';
    applyZoneInfo({ zoneName, status: 'idle', remaining: 0 });
    return;
  }
  applyZoneInfo(newVal);
});

chrome.storage.local.get('zoneInfo').then((data) => {
  if (data.zoneInfo && data.zoneInfo.status !== 'idle') {
    applyZoneInfo(data.zoneInfo);
  }
});

setInterval(async () => {
  try {
    const data = await chrome.storage.local.get('zoneInfo');
    if (data.zoneInfo) applyZoneInfo(data.zoneInfo);
  } catch (_) {}
}, 10000);

function sendMessageToBackground(actionType) {
  chrome.runtime.sendMessage({ type: actionType, source: 'blocked-page' });
}

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (zoneStatus === 'idle') return;
  sendMessageToBackground('pause-zone');
});

document.getElementById('endBtn').addEventListener('click', () => {
  sendMessageToBackground('end-zone');
});

document.getElementById('reloadLink').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.reload();
});
