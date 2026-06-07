import { Notification } from 'electron';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { logger } from '../utils/logger';

const PLATFORM = os.platform();
const isWindows = PLATFORM === 'win32';
const isMac = PLATFORM === 'darwin';
const isLinux = PLATFORM === 'linux';

const BROWSERS_WIN = ['firefox.exe', 'chrome.exe', 'msedge.exe', 'waterfox.exe', 'brave.exe'];
const BROWSERS_MAC = ['Firefox', 'Google Chrome', 'Safari'];
const BROWSERS_LINUX = ['firefox', 'chrome', 'chromium'];

const APP_NAME_MAP_WIN: Record<string, string[]> = {
  'calculator': ['CalculatorApp.exe', 'Calculator.exe'],
  'chrome': ['chrome.exe'],
  'firefox': ['firefox.exe'],
  'spotify': ['Spotify.exe'],
  'discord': ['Discord.exe'],
  'slack': ['slack.exe'],
};

function resolveProcessNames(appName: string): string[] {
  if (isWindows) {
    const lower = appName.toLowerCase();
    if (APP_NAME_MAP_WIN[lower]) {
      return APP_NAME_MAP_WIN[lower];
    }
    if (lower.endsWith('.exe')) {
      return [appName];
    }
    return [`${appName}.exe`, appName];
  }
  return [appName];
}

function getHostsPath(): string {
  if (isWindows) return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  return '/etc/hosts';
}

const HOSTS_START_MARKER = '# Forca - Start Blocked Sites';
const HOSTS_END_MARKER = '# Forca - End Blocked Sites';

function canWriteHosts(): boolean {
  try {
    fs.accessSync(getHostsPath(), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function runPowerShellElevated(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = [
      'Start-Process',
      '-FilePath', 'powershell',
      '-ArgumentList', `@(${args.map(a => `'${a.replace(/'/g, "''")}'`).join(',')})`,
      '-Verb', 'RunAs',
      '-Wait',
      '-WindowStyle', 'Hidden',
    ].join(' ');

    const child = spawn('powershell', [
      '-NoProfile',
      '-Command',
      command,
    ], { windowsHide: false, stdio: 'pipe' });

    let stderr = '';
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`PowerShell elevation exited code ${code}: ${stderr}`));
    });

    child.on('error', reject);
  });
}

async function writeHostsFile(content: string): Promise<void> {
  const hostsPath = getHostsPath();
  if (canWriteHosts()) {
    fs.writeFileSync(hostsPath, content, 'utf-8');
    return;
  }

  const tmpFile = path.join(os.tmpdir(), `forca-hosts-${Date.now()}`);
  fs.writeFileSync(tmpFile, content, 'utf-8');

  try {
    await runPowerShellElevated([
      '-ExecutionPolicy', 'Bypass',
      '-Command',
      `Copy-Item -LiteralPath '${tmpFile.replace(/'/g, "''")}' -Destination '${hostsPath.replace(/'/g, "''")}' -Force; Remove-Item -LiteralPath '${tmpFile.replace(/'/g, "''")}' -Force`,
    ]);
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    throw err;
  }

  try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
}

function removeForcaSection(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    if (line.trim() === HOSTS_START_MARKER) {
      inBlock = true;
      continue;
    }
    if (line.trim() === HOSTS_END_MARKER) {
      inBlock = false;
      continue;
    }
    if (!inBlock) {
      result.push(line);
    }
  }
  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function flushDns(): void {
  try {
    if (isWindows) {
      execSync('ipconfig /flushdns', { stdio: 'pipe' });
    } else if (isMac) {
      execSync('dscacheutil -flushcache && killall -HUP mDNSResponder', { stdio: 'pipe' });
    } else if (isLinux) {
      execSync('systemctl restart systemd-resolved', { stdio: 'pipe' });
    }
  } catch {
    // best effort
  }
}

function killProcess(appName: string): void {
  const names = resolveProcessNames(appName);
  for (const name of names) {
    try {
      if (isWindows) {
        execSync(`taskkill /F /IM ${name} /T`, { stdio: 'ignore' });
      } else if (isMac) {
        execSync(`killall -9 ${name}`, { stdio: 'ignore' });
      } else if (isLinux) {
        execSync(`pkill -9 ${name}`, { stdio: 'ignore' });
      }
    } catch {
      // process may not be running
    }
  }
}

function isProcessRunning(appName: string): boolean {
  const names = resolveProcessNames(appName);
  for (const name of names) {
    try {
      if (isWindows) {
        const out = execSync(`tasklist /FI "IMAGENAME eq ${name}" /NH`, { encoding: 'utf-8', stdio: 'pipe' });
        if (out.includes(name.replace('.exe', ''))) return true;
      } else if (isMac) {
        execSync(`pgrep -x "${name}"`, { stdio: 'pipe' });
        return true;
      } else {
        execSync(`pgrep -x "${name}"`, { stdio: 'pipe' });
        return true;
      }
    } catch {
      // try next name
    }
  }
  return false;
}

function killBrowsers(): void {
  const browsers = isWindows ? BROWSERS_WIN : isMac ? BROWSERS_MAC : BROWSERS_LINUX;
  for (const browser of browsers) {
    killProcess(browser);
  }
}

export class BlockingService {
  private killInterval: ReturnType<typeof setInterval> | null = null;
  private appsToKill: string[] = [];
  private sitesToBlock: string[] = [];
  private isActive = false;

  setWindow(_win: Electron.BrowserWindow): void {
    // no-op
  }

  setAlwaysAllowedApps(_apps: string[]): void {
    // unused for now
  }

  getAlwaysAllowedApps(): string[] {
    return [];
  }

  async blockApps(apps: string[]): Promise<void> {
    if (apps.length === 0) return;
    this.appsToKill = apps;
    this.isActive = true;

    for (const app of apps) {
      killProcess(app);
    }

    if (this.killInterval) clearInterval(this.killInterval);
    this.killInterval = setInterval(() => {
      if (!this.isActive) return;
      for (const app of this.appsToKill) {
        if (isProcessRunning(app)) {
          killProcess(app);
          logger.info(`Killed blocked app: ${app}`);
        }
      }
    }, 3000);
  }

  async unblockApps(): Promise<void> {
    this.isActive = false;
    this.appsToKill = [];
    if (this.killInterval) {
      clearInterval(this.killInterval);
      this.killInterval = null;
    }
  }

  async blockSites(sites: string[]): Promise<void> {
    if (sites.length === 0) return;
    this.sitesToBlock = sites;

    const unique = [...new Set(sites.map(s => s.trim().toLowerCase()).filter(Boolean))];

    const lines: string[] = [];
    lines.push(HOSTS_START_MARKER);
    for (const site of unique) {
      lines.push(`127.0.0.1 ${site}`);
      lines.push(`127.0.0.1 www.${site}`);
      logger.info(`Blocking site: ${site}`);
    }
    lines.push(HOSTS_END_MARKER);
    const blockSection = lines.join('\n') + '\n';

    try {
      const hostsContent = fs.readFileSync(getHostsPath(), 'utf-8');
      const cleaned = removeForcaSection(hostsContent);
      const newContent = cleaned + '\n' + blockSection;
      await writeHostsFile(newContent);
      flushDns();
      logger.info(`Blocked ${unique.length} sites in hosts file`);

      killBrowsers();
      setTimeout(() => {
        try {
          if (isWindows) {
            execSync('start "" "http://localhost"', { stdio: 'pipe' });
          } else if (isMac) {
            execSync('open "http://localhost"', { stdio: 'pipe' });
          } else if (isLinux) {
            execSync('xdg-open "http://localhost"', { stdio: 'pipe' });
          }
        } catch { /* best effort */ }
      }, 2000);
    } catch (err) {
      logger.error('Failed to block sites:', err);
    }
  }

  async unblockSites(): Promise<void> {
    this.sitesToBlock = [];
    try {
      const hostsContent = fs.readFileSync(getHostsPath(), 'utf-8');
      const cleaned = removeForcaSection(hostsContent);
      await writeHostsFile(cleaned);
      flushDns();
      new Notification({
        title: 'Forca Focus',
        body: 'Focus zone ended - sites unblocked',
      }).show();
      logger.info('Unblocked all sites');
    } catch (err) {
      logger.error('Failed to unblock sites:', err);
    }
  }

  getBlockedApps(): string[] {
    return this.appsToKill;
  }

  getBlockedSites(): string[] {
    return this.sitesToBlock;
  }

  cleanup(): void {
    this.isActive = false;
    if (this.killInterval) {
      clearInterval(this.killInterval);
      this.killInterval = null;
    }
  }
}
