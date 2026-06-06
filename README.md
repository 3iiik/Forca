<div align="center">
  <br />
  <img src="assets/icons/icon.png" alt="Forca Logo" width="128" height="128" />
  <h1>Forca</h1>
  <p>
    <strong>Your calendar knows when you're free.<br />Forca makes sure you actually use that time.</strong>
  </p>
  <br />

  [![Build](https://img.shields.io/github/actions/workflow/status/3iiik/forca/release.yml?branch=main&style=flat-square&logo=github)](https://github.com/3iiik/forca/actions)
  [![License](https://img.shields.io/github/license/3iiik/forca?style=flat-square)](LICENSE)
  [![Release](https://img.shields.io/github/v/release/3iiik/forca?sort=semver&style=flat-square&logo=github)](https://github.com/3iiik/forca/releases/latest)
  [![Downloads](https://img.shields.io/github/downloads/3iiik/forca/total?style=flat-square&logo=github)](https://github.com/3iiik/forca/releases)

  <br />
</div>

---

## Features

- **Calendar Integration** — connect Google Calendar or any iCal feed. Forca detects when meetings end.
- **Focus Zones** — named focus sessions with configurable timers, triggers, and auto-start after meetings.
- **App & Site Blocking** — block distracting apps and websites during focus sessions.
- **Smart Suggestions** — calendar pattern analysis finds optimal focus windows.
- **Zone Profiles** — save and switch between different blocking/timer/sound presets.
- **Ambient Focus Modes** — rain, white noise, lo-fi, and forest sounds powered by Web Audio.
- **Focus Score** — daily, weekly, and monthly productivity scoring with charts.
- **Break Reminders** — pomodoro-style break timer (50/10 default).
- **Do Not Disturb Sync** — automatically enable DND on macOS and Windows.
- **System Tray** — colored tray icons, quick controls, and notifications.
- **Multi-Device Sync** — Firebase-powered sync across computers.
- **Focus Streaks** — consecutive day tracking with milestone rewards.
- **Auto-Updater** — seamless updates delivered via GitHub Releases.

## Screenshots

_Screenshots coming soon._

## Installation

### Windows

| Type | Download |
|---|---|
| Installer | [Forca-Setup-x64.exe](https://github.com/3iiik/forca/releases/latest/download/Forca-Setup-x64.exe) |
| Portable | [Forca-Portable-x64.exe](https://github.com/3iiik/forca/releases/latest/download/Forca-Portable-x64.exe) |

### macOS

| Architecture | Download |
|---|---|
| Intel | [Forca-x64.dmg](https://github.com/3iiik/forca/releases/latest/download/Forca-x64.dmg) |
| Apple Silicon | [Forca-arm64.dmg](https://github.com/3iiik/forca/releases/latest/download/Forca-arm64.dmg) |

### Linux

| Format | Download |
|---|---|
| AppImage | [Forca-x64.AppImage](https://github.com/3iiik/forca/releases/latest/download/Forca-x64.AppImage) |
| Debian | [Forca-x64.deb](https://github.com/3iiik/forca/releases/latest/download/Forca-x64.deb) |
| RPM | [Forca-x64.rpm](https://github.com/3iiik/forca/releases/latest/download/Forca-x64.rpm) |

## Running from Source

```bash
# Clone the repo
git clone https://github.com/3iiik/forca.git
cd forca

# Install dependencies
npm install

# Build main + renderer
npm run build

# Start the app
npm start

# Or run in development mode
npm run dev
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
