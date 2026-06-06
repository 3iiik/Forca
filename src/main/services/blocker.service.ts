import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BrowserWindow, Notification } from 'electron';

const isWindows = os.platform() === 'win32';

const execAsync = promisify(exec);

function getHostsPath(): string {
  if (isWindows) return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  return '/etc/hosts';
}

interface BlockedProcess {
  name: string;
  pid: number;
}

export class BlockingService {
  private blockedProcesses: BlockedProcess[] = [];
  private hostsBackupPath: string = '';
  private isBlocking = false;
  private window: BrowserWindow | null = null;
  private blockedAppsList: string[] = [];
  private alwaysAllowedApps: string[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;

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

    const hostsPath = getHostsPath();

    try {
      this.hostsBackupPath = path.join(os.tmpdir(), `hosts-backup-${Date.now()}`);
      fs.copyFileSync(hostsPath, this.hostsBackupPath);

      let hostsContent = fs.readFileSync(hostsPath, 'utf-8');
      const blockEntries = sites.map(site => `\n127.0.0.1 ${site}\n127.0.0.1 www.${site}`);
      hostsContent += '\n# Forca - Blocked Sites\n' + blockEntries.join('\n');

      fs.writeFileSync(hostsPath, hostsContent);
    } catch (err) {
      console.error('Failed to block sites:', err);
    }
  }

  async unblockSites(): Promise<void> {
    const hostsPath = getHostsPath();

    try {
      if (this.hostsBackupPath && fs.existsSync(this.hostsBackupPath)) {
        fs.copyFileSync(this.hostsBackupPath, hostsPath);
        fs.unlinkSync(this.hostsBackupPath);
        this.hostsBackupPath = '';
      } else {
        let hostsContent = fs.readFileSync(hostsPath, 'utf-8');
        const lines = hostsContent.split('\n');
        const filtered = lines.filter(line => !line.includes('# Forca - Blocked Sites'));
        hostsContent = filtered.join('\n');
        fs.writeFileSync(hostsPath, hostsContent);
      }
    } catch (err) {
      console.error('Failed to unblock sites:', err);
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

            if (this.window && !this.window.isDestroyed()) {
              this.window.webContents.send('blocker:app-blocked', appName);
              new Notification({
                title: 'App Blocked',
                body: `${appName} was blocked during focus mode.`,
              }).show();
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

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
