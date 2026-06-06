import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'path';
import { TrayState } from '../../shared/types';

export class TrayService {
  private tray: Tray | null = null;
  private state: TrayState = { status: 'idle' };
  private window: BrowserWindow | null = null;
  private callbacks: {
    onStartFocus?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onSkip?: () => void;
    onShowSchedule?: () => void;
    onOpenSettings?: () => void;
    onQuit?: () => void;
  } = {};

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  setCallbacks(cbs: typeof this.callbacks) {
    this.callbacks = cbs;
  }

  init() {
    if (this.tray) return;

    const icon = this.loadIcon('gray');

    this.tray = new Tray(icon);
    this.tray.setToolTip('Forca');
    this.updateMenu();

    this.tray.on('double-click', () => {
      if (this.window) {
        if (this.window.isVisible()) {
          this.window.focus();
        } else {
          this.window.show();
        }
      }
    });
  }

  updateState(state: TrayState) {
    this.state = state;
    this.updateIcon();
    this.updateMenu();
  }

  private updateIcon() {
    if (!this.tray) return;
    let color: string;
    switch (this.state.status) {
      case 'active':
        color = 'green';
        break;
      case 'paused':
      case 'meeting-soon':
        color = 'yellow';
        break;
      default:
        color = 'gray';
    }
    this.tray.setImage(this.loadIcon(color));
  }

  private loadIcon(color: string): Electron.NativeImage {
    const assetsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'icons')
      : path.join(__dirname, '..', '..', '..', 'assets', 'icons');

    const iconPath = path.join(assetsPath, `icon-${color}.png`);

    try {
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) return img;
    } catch { /* ignore */ }

    // Fallback: create a colored circle via nativeImage
    return this.createFallbackIcon(color);
  }

  private createFallbackIcon(color: string): Electron.NativeImage {
    // Create a 16x16 colored PNG
    const size = 16;
    const canvas = Buffer.alloc(size * size * 4);

    const colors: Record<string, [number, number, number]> = {
      green: [34, 197, 94],
      yellow: [234, 179, 8],
      gray: [107, 114, 128],
    };

    const [r, g, b] = colors[color] || colors.gray;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 1;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist <= radius) {
          canvas[idx] = r;
          canvas[idx + 1] = g;
          canvas[idx + 2] = b;
          canvas[idx + 3] = 255;
        } else {
          canvas[idx] = 0;
          canvas[idx + 1] = 0;
          canvas[idx + 2] = 0;
          canvas[idx + 3] = 0;
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, {
      width: size,
      height: size,
    });
  }

  private updateMenu() {
    if (!this.tray) return;

    const remainingStr = this.state.remaining
      ? `${Math.floor(this.state.remaining / 60)}m ${this.state.remaining % 60}s`
      : '';

    const template: Electron.MenuItemConstructorOptions[] = [];

    if (this.state.status === 'active' || this.state.status === 'paused') {
      const isPaused = this.state.status === 'paused';
      template.push(
        {
          label: `● ${this.state.activeZoneName || 'Focus Active'}`,
          enabled: false,
        },
        { label: `⏱ ${remainingStr}`, enabled: false },
        { type: 'separator' },
        ...(isPaused
          ? [{
              label: '▶ Resume',
              click: () => this.callbacks.onResume?.(),
            }]
          : [{
              label: '⏸ Pause',
              click: () => this.callbacks.onPause?.(),
            }]
        ),
        {
          label: '⏹ Skip',
          click: () => this.callbacks.onSkip?.(),
        }
      );
    } else {
      template.push(
        {
          label: '▶ Start Focus',
          click: () => this.callbacks.onStartFocus?.(),
        }
      );
    }

    template.push(
      { type: 'separator' },
      {
        label: '📅 View Schedule',
        click: () => this.callbacks.onShowSchedule?.(),
      },
      {
        label: '⚙ Settings',
        click: () => this.callbacks.onOpenSettings?.(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.callbacks.onQuit?.(),
      }
    );

    const contextMenu = Menu.buildFromTemplate(template);
    this.tray.setContextMenu(contextMenu);
  }

  getState(): TrayState {
    return this.state;
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
