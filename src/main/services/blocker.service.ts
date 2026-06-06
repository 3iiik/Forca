import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BrowserWindow } from 'electron';

const isWindows = os.platform() === 'win32';
const execAsync = promisify(exec);

function getHostsPath(): string {
  if (isWindows) return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  return '/etc/hosts';
}

const HOSTS_START_MARKER = '# Forca - Start Blocked Sites';
const HOSTS_END_MARKER = '# Forca - End Blocked Sites';

interface BlockedProcess {
  name: string;
  pid: number;
}

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

async function modifyHostsFileRaw(hostsContent: string): Promise<void> {
  const hostsPath = getHostsPath();
  if (canWriteHosts()) {
    fs.writeFileSync(hostsPath, hostsContent, 'utf-8');
    return;
  }

  const tmpFile = path.join(os.tmpdir(), `forca-hosts-${Date.now()}`);
  fs.writeFileSync(tmpFile, hostsContent, 'utf-8');

  try {
    await runPowerShellElevated([
      '-ExecutionPolicy', 'Bypass',
      '-Command',
      `Copy-Item -LiteralPath '${tmpFile.replace(/'/g, "''")}' -Destination '${hostsPath.replace(/'/g, "''")}' -Force; Remove-Item -LiteralPath '${tmpFile.replace(/'/g, "''")}' -Force`,
    ]);
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch {}
    throw err;
  }

  try { fs.unlinkSync(tmpFile); } catch {}
}

async function flushDns(): Promise<void> {
  try {
    if (isWindows) {
      await execAsync('ipconfig /flushdns');
    } else if (os.platform() === 'darwin') {
      await execAsync('dscacheutil -flushcache; killall -HUP mDNSResponder');
    }
  } catch {
    // DNS flush may fail without admin rights, but hosts changes still apply
  }
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

function buildHostsContent(sites: string[]): string {
  const unique = [...new Set(sites.map(s => s.trim().toLowerCase()).filter(Boolean))];
  const entries = unique.flatMap(site => [
    `127.0.0.1 ${site}`,
    `127.0.0.1 www.${site}`,
  ]);
  return `${HOSTS_START_MARKER}\n${entries.join('\n')}\n${HOSTS_END_MARKER}`;
}

export class BlockingService {
  private blockedProcesses: BlockedProcess[] = [];
  private isBlocking = false;
  private window: BrowserWindow | null = null;
  private blockedAppsList: string[] = [];
  private blockedSitesList: string[] = [];
  private alwaysAllowedApps: string[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private hostsWriteFailed = false;

  setAlwaysAllowedApps(apps: string[]): void {
    this.alwaysAllowedApps = apps;
  }

  getAlwaysAllowedApps(): string[] {
    return this.alwaysAllowedApps;
  }

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  async blockApps(apps: string[]): Promise<void> {
    const toBlock = apps.filter(a => !this.alwaysAllowedApps.includes(a));
    this.blockedAppsList = toBlock;
    if (toBlock.length === 0) return;

    this.isBlocking = true;
    this.startProcessMonitor(toBlock);
  }

  async unblockApps(): Promise<void> {
    this.isBlocking = false;
    this.blockedAppsList = [];
    this.blockedProcesses = [];
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async blockSites(sites: string[]): Promise<void> {
    if (sites.length === 0) return;
    this.blockedSitesList = sites;
    this.hostsWriteFailed = false;

    try {
      let hostsContent = fs.readFileSync(getHostsPath(), 'utf-8');
      hostsContent = removeForcaSection(hostsContent);
      hostsContent += '\n' + buildHostsContent(sites) + '\n';

      await modifyHostsFileRaw(hostsContent);
      await flushDns();
    } catch (err: any) {
      this.hostsWriteFailed = true;
      const msg = isWindows
        ? 'Forca needs Administrator privileges to block websites. Please restart Forca as Administrator.'
        : 'Forca needs root privileges to block websites. Please restart Forca with sudo.';

      if (this.window && !this.window.isDestroyed()) {
        this.window.webContents.send('notification:show', {
          title: 'Website Blocking Failed',
          body: msg,
        });
      }
      console.error('Failed to block sites:', err.message);
    }
  }

  async unblockSites(): Promise<void> {
    this.blockedSitesList = [];
    if (this.hostsWriteFailed) return;

    try {
      let hostsContent = fs.readFileSync(getHostsPath(), 'utf-8');
      const cleaned = removeForcaSection(hostsContent);

      if (cleaned !== hostsContent + '\n') {
        await modifyHostsFileRaw(cleaned);
        await flushDns();
      }
    } catch (err: any) {
      console.error('Failed to unblock sites:', err.message);
    }
  }

  getBlockedApps(): string[] {
    return this.blockedAppsList;
  }

  private startProcessMonitor(apps: string[]): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      if (!this.isBlocking) return;

      for (const appName of apps) {
        try {
          const pids = await this.findProcessPids(appName);
          if (pids.length > 0) {
            for (const pid of pids) {
              try {
                await this.killProcess(pid);
                this.blockedProcesses.push({ name: appName, pid });
              } catch { /* process may already be dead */ }
            }
          }
        } catch { /* process may have exited */ }
      }
    }, 2000);
  }

  private async findProcessPids(processName: string): Promise<number[]> {
    if (isWindows) {
      const { stdout } = await execAsync(
        `powershell -Command "Get-Process -Name '${processName}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id"`
      );
      return stdout.trim().split('\n').filter(Boolean).map(p => parseInt(p.trim())).filter(n => !isNaN(n));
    }

    const { stdout } = await execAsync(`pgrep -f "${processName}" 2>/dev/null || true`);
    return stdout.trim().split('\n').filter(Boolean).map(p => parseInt(p.trim())).filter(n => !isNaN(n));
  }

  private async killProcess(pid: number): Promise<void> {
    if (isWindows) {
      await execAsync(`taskkill /F /PID ${pid}`);
    } else {
      await execAsync(`kill -9 ${pid}`);
    }
  }

  async ensureHostsAccess(): Promise<boolean> {
    try {
      const hostsPath = getHostsPath();
      if (canWriteHosts()) return true;

      // Trigger UAC at startup by writing and removing a test marker
      let content = fs.readFileSync(hostsPath, 'utf-8');
      const testLine = `# Forca access test ${Date.now()}\n`;
      await modifyHostsFileRaw(content + testLine);
      content = fs.readFileSync(hostsPath, 'utf-8');
      if (content.includes(testLine)) {
        await modifyHostsFileRaw(content.replace(testLine, ''));
      }
      return true;
    } catch {
      return false;
    }
  }

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
