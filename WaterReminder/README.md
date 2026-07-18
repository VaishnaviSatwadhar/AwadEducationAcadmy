# Smart Water Reminder

A professional, offline desktop application that reminds you to drink water and tracks your daily hydration. Built with Python, CustomTkinter, and SQLite. Works completely offline and auto-loads all reminders and settings on startup.

---

## Features

- Modern water-themed UI with Light / Dark mode and multiple themes
- User profile with auto-calculated daily water goal (based on weight, age, gender, activity)
- Multiple reminders (add / edit / delete / enable-disable), daily repeat and custom intervals
- Desktop notifications with sound and optional voice (Text-to-Speech) reminder
- Snooze button (5 / 10 / 15 minutes)
- Quick-log buttons (100 / 200 / 250 / 500 ml) plus custom amount
- Animated water bottle that fills as intake increases
- Dashboard with today's statistics and progress bar
- Statistics: daily history, weekly & monthly graphs, average intake, success percentage
- Streak counter, achievement badges, daily motivational quotes
- Drink history calendar with search
- Reminder sound selection
- Backup & restore database, export history to CSV, import data
- Reset today's progress
- Minimize to system tray, background reminder service, auto-save
- Optional start on Windows startup
- All data stored locally in SQLite — works fully offline

---

## Folder Structure

```
WaterReminder/
│
├── assets/
│   ├── icon.ico
│   ├── water.png
│   └── notification.wav
│
├── database/
│   └── water.db            (auto-created on first run)
│
├── ui/
│   ├── dashboard.py
│   ├── reminder.py
│   ├── statistics.py
│   └── settings.py
│
├── models/
│   ├── database.py
│   ├── reminder_model.py
│   └── user_model.py
│
├── services/
│   ├── notification_service.py
│   ├── scheduler.py
│   └── voice_service.py
│
├── main.py
├── requirements.txt
└── README.md
```

---

## Installation Guide

### 1. Prerequisites
- Python 3.9 or newer (https://www.python.org/downloads/)
- pip (comes with Python)

### 2. Install dependencies
```bash
cd WaterReminder
pip install -r requirements.txt
```

### 3. Run the application
```bash
python main.py
```

The SQLite database (`database/water.db`) is created automatically on first launch.

> **Note on assets:** Place `icon.ico`, `water.png`, and `notification.wav` inside the `assets/` folder. The app will run without them (it falls back to defaults) but notifications and the icon will be missing.

---

## Build Commands

### Create a Windows `.exe` with PyInstaller

```bash
cd WaterReminder
pyinstaller --noconfirm --onedir --windowed \
  --name "SmartWaterReminder" \
  --icon "assets/icon.ico" \
  --add-data "assets;assets" \
  --add-data "database;database" \
  main.py
```

The executable will be generated in `dist/SmartWaterReminder/`.

For a single-file build:
```bash
pyinstaller --noconfirm --onefile --windowed \
  --name "SmartWaterReminder" \
  --icon "assets/icon.ico" \
  --add-data "assets;assets" \
  main.py
```

### Create an Android APK with Kivy + Buildozer

> The desktop UI uses CustomTkinter (Tk-based) which does **not** run on Android. To build an APK you must implement a Kivy-based UI variant. A minimal `buildozer.spec` is provided below.

1. Install WSL2 (Ubuntu) on Windows or use a Linux machine — Buildozer does not run natively on Windows.
2. Install Buildozer dependencies:
```bash
sudo apt update
sudo apt install -y git zip unzip openjdk-17-jdk python3-pip autoconf libtool pkg-config zlib1g-dev libncurses5-dev libncursesw5-dev libtinfo5 cmake libffi-dev libssl-dev
pip install buildozer kivy
```
3. Create a `buildozer.spec` in the project root:
```ini
[app]
title = Smart Water Reminder
package.name = smartwaterreminder
package.domain = org.smartwater
source.dir = .
source.include_exts = py,png,ico,wav,db
version = 1.0.0
requirements = python3,kivy,plyer,sqlite3
orientation = portrait
fullscreen = 0
```
4. Build the APK:
```bash
buildozer -v android debug
```
The APK will be generated in the `bin/` folder.

---

## Database Schema

SQLite tables: `users`, `reminders`, `water_logs`, `settings`, `achievements`.

See `models/database.py` for the full schema and migrations.

---

## How It Works

- **On startup:** `main.py` initializes the database, loads the user profile, settings, and all enabled reminders, then starts the background scheduler thread.
- **Reminders:** The scheduler checks every minute whether any reminder is due. When due, it fires a desktop notification, plays a sound, optionally speaks the message, and (if snoozed) reschedules.
- **Water logging:** Each log writes to `water_logs` with a timestamp. The dashboard and bottle animation update automatically.
- **Persistence:** Everything is stored in `database/water.db`. Closing the app keeps all data; reopening restores state.

---

## License

MIT License - free to use and modify.
