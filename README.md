<div align="center">
  <br />
  <img src="assets/icons/icon.png" alt="Forca Logo" width="128" height="128" />
  <h1>Forca</h1>
  <p>
    <strong>Your calendar knows when you're free.<br />Forca makes sure you actually use that time.</strong>
  </p>
  <br />

[![Build](https://img.shields.io/github/actions/workflow/status/3iiik/Forca/release.yml?label=build)](https://github.com/3iiik/Forca/actions)[![License](https://img.shields.io/github/license/3iiik/Forca)](LICENSE)
[![Release](https://img.shields.io/github/v/release/3iiik/Forca)](https://github.com/3iiik/Forca/releases)
[![Downloads](https://img.shields.io/github/downloads/3iiik/Forca/total)](https://github.com/3iiik/Forca/releases)

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

![Forca App](assets/screenshots/Forca%20AD%20(2).png)

## Installation

### 🪟 Windows

| | |
|---|---|
| 📦 **Installer** | [Download Forca-Setup-x64.exe](https://github.com/3iiik/Forca/releases/latest/download/Forca-Setup-x64.exe) |
| 💼 **Portable** | [Download Forca-Portable-x64.exe](https://github.com/3iiik/Forca/releases/latest/download/Forca-Portable-x64.exe) |

### 🍎 macOS

| | |
|---|---|
| 💻 **Intel** | [Download Forca-x64.dmg](https://github.com/3iiik/Forca/releases/latest/download/Forca-x64.dmg) |
| 🔵 **Apple Silicon** | [Download Forca-arm64.dmg](https://github.com/3iiik/Forca/releases/latest/download/Forca-arm64.dmg) |

### 🐧 Linux

| | |
|---|---|
| 📀 **AppImage** | [Download Forca-x64.AppImage](https://github.com/3iiik/Forca/releases/latest/download/Forca-x64.AppImage) |
| 🟠 **Debian** | [Download Forca-x64.deb](https://github.com/3iiik/Forca/releases/latest/download/Forca-x64.deb) |
| 🔴 **RPM** | [Download Forca-x64.rpm](https://github.com/3iiik/Forca/releases/latest/download/Forca-x64.rpm) |

> 💡 **Note:** On Windows, run Forca as Administrator for website blocking to work correctly.

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
