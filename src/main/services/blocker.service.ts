import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BrowserWindow, Notification } from 'electron';

const isWindows = os.platform() === 'win32';

const execAsync = promisify(exec);

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
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  async blockApps(apps: string[]): Promise<void> {
    this.blockedAppsList = apps;
    if (apps.length === 0) return;

    this.isBlocking = true;

    // Start monitoring for blocked processes (Windows only for now)
    if (isWindows) {
      this.startProcessMonitor(apps);
    }
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
    if (sites.length === 0 || os.platform() !== 'win32') return;

    const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

    try {
      // Backup hosts file
      this.hostsBackupPath = path.join(os.tmpdir(), `hosts-backup-${Date.now()}`);
      fs.copyFileSync(hostsPath, this.hostsBackupPath);

      let hostsContent = fs.readFileSync(hostsPath, 'utf-8');

      // Add blocked sites
      const blockEntries = sites.map(site => `\n127.0.0.1 ${site}\n127.0.0.1 www.${site}`);
      hostsContent += '\n# Forca - Blocked Sites\n' + blockEntries.join('\n');

      fs.writeFileSync(hostsPath, hostsContent);
    } catch (err) {
      console.error('Failed to block sites:', err);
    }
  }

  async unblockSites(): Promise<void> {
    if (os.platform() !== 'win32') return;

    const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

    try {
      if (this.hostsBackupPath && fs.existsSync(this.hostsBackupPath)) {
        fs.copyFileSync(this.hostsBackupPath, hostsPath);
        fs.unlinkSync(this.hostsBackupPath);
        this.hostsBackupPath = '';
      } else {
        // Remove Forca block entries
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

    // Check every 2 seconds for blocked processes
    this.checkInterval = setInterval(async () => {
      if (!this.isBlocking) return;

      for (const appName of apps) {
        try {
          const { stdout } = await execAsync(
            `powershell -Command "Get-Process -Name '${appName}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id"`
          );
          const pids = stdout.trim().split('\n').filter(Boolean);
          if (pids.length > 0) {
            // Kill the processes
            for (const pid of pids) {
              try {
                await execAsync(`taskkill /F /PID ${pid.trim()}`);
                this.blockedProcesses.push({ name: appName, pid: parseInt(pid.trim()) });
              } catch { /* process may already be dead */ }
            }

            // Show overlay notification
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

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
