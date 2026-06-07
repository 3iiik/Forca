import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export class DndService {
  private wasEnabled = false;

  async enable(): Promise<void> {
    try {
      if (os.platform() === 'win32') {
        // Enable Focus Assist (Windows 10/11 Do Not Disturb)
        await execAsync(
          'powershell -Command "New-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings -Name QuietHours -PropertyType DWord -Value 1 -Force"'
        );
        this.wasEnabled = true;
      } else if (os.platform() === 'darwin') {
        // macOS: Use AppleScript to enable DND
        await execAsync(
          `osascript -e 'tell application "System Events" to tell expose preferences to set dontDisturb to true'`
        );
        this.wasEnabled = true;
      }
    } catch (err) {
      logger.error('Failed to enable DND:', err);
    }
  }

  async disable(): Promise<void> {
    if (!this.wasEnabled) return;
    try {
      if (os.platform() === 'win32') {
        await execAsync(
          'powershell -Command "Remove-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings -Name QuietHours -Force"'
        );
      } else if (os.platform() === 'darwin') {
        await execAsync(
          `osascript -e 'tell application "System Events" to tell expose preferences to set dontDisturb to false'`
        );
      }
      this.wasEnabled = false;
    } catch (err) {
      logger.error('Failed to disable DND:', err);
    }
  }
}
