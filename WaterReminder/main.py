"""
main.py

Entry point for Smart Water Reminder.
Initializes database, models, services, and the main window with tabs.
Handles theming, system tray, Windows startup, achievements and streaks.
"""
from __future__ import annotations
import logging
import os
import sys
import platform
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import date, timedelta

from models.database import init_db, DB_PATH
from models.user_model import UserModel
from models.reminder_model import ReminderModel, WaterLogModel
from services.notification_service import NotificationService
from services.voice_service import VoiceService
from services.scheduler import SchedulerService

from ui.dashboard import DashboardTab
from ui.reminder import ReminderTab
from ui.statistics import StatisticsTab
from ui.settings import SettingsTab

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("smart_water")


# Theme palettes
THEMES = {
    "light": {
        "bg": "#f0f9ff", "card": "#ffffff", "text": "#0f172a",
        "muted": "#64748b", "primary": "#0ea5e9", "accent": "#06b6d4",
        "success": "#10b981", "danger": "#ef4444", "border": "#cbd5e1",
    },
    "dark": {
        "bg": "#0f172a", "card": "#1e293b", "text": "#e2e8f0",
        "muted": "#94a3b8", "primary": "#38bdf8", "accent": "#22d3ee",
        "success": "#34d399", "danger": "#f87171", "border": "#334155",
    },
    "ocean": {
        "bg": "#042f2e", "card": "#0f3a3a", "text": "#ccfbf1",
        "muted": "#5eead4", "primary": "#2dd4bf", "accent": "#14b8a6",
        "success": "#10b981", "danger": "#ef4444", "border": "#134e4a",
    },
    "forest": {
        "bg": "#14241a", "card": "#1c3025", "text": "#d1fae5",
        "muted": "#86efac", "primary": "#22c55e", "accent": "#16a34a",
        "success": "#10b981", "danger": "#ef4444", "border": "#166534",
    },
}

ACHIEVEMENTS = [
    ("First Glass", "Log your first glass of water"),
    ("1L Day", "Drink 1 liter in a day"),
    ("2L Day", "Drink 2 liters in a day"),
    ("Goal Met", "Meet your daily goal"),
    ("3-Day Streak", "3 days in a row"),
    ("7-Day Streak", "7 days in a row"),
]


class App:
    """Main application controller."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.colors = THEMES["dark"]

        # Database / models
        init_db()
        self.user = UserModel()
        self.reminders = ReminderModel()
        self.water_log = WaterLogModel()

        # Services
        self.notification = NotificationService(
            sound_file=self.user.get_setting("sound_file", "notification.wav"),
            sound_enabled=bool(int(self.user.get_setting("sound_enabled", "1"))),
        )
        self.voice = VoiceService(
            enabled=bool(int(self.user.get_setting("voice_enabled", "0"))),
        )
        self.scheduler = SchedulerService(self.reminders, on_reminder=self._on_reminder)

        # State
        self.streak = self._calc_streak()
        self.success_pct = self._calc_success()

        # Window
        self.root.title("Smart Water Reminder")
        self.root.geometry("900x680")
        self.root.minsize(700, 560)
        self._set_icon()

        # Apply saved theme
        theme = self.user.get_setting("theme", "dark")
        self.apply_theme(theme)

        # Build UI
        self._build_tabs()

        # Start scheduler
        self.scheduler.start()

        # Window close behavior
        minimize_tray = bool(int(self.user.get_setting("minimize_to_tray", "1")))
        if minimize_tray:
            self.root.protocol("WM_DELETE_WINDOW", self._minimize_to_tray)
        else:
            self.root.protocol("WM_DELETE_WINDOW", self._on_close)

        self.root.mainloop()

    # ---------------- UI ----------------
    def _build_tabs(self) -> None:
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)

        self.dashboard_tab = DashboardTab(self.notebook, self)
        self.reminder_tab = ReminderTab(self.notebook, self)
        self.statistics_tab = StatisticsTab(self.notebook, self)
        self.settings_tab = SettingsTab(self.notebook, self)

        self.notebook.add(self.dashboard_tab.frame, text="  Dashboard  ")
        self.notebook.add(self.reminder_tab.frame, text="  Reminders  ")
        self.notebook.add(self.statistics_tab.frame, text="  Statistics  ")
        self.notebook.add(self.settings_tab.frame, text="  Settings  ")

        self.notebook.bind("<<NotebookTabChanged>>", self._on_tab_change)

    def _on_tab_change(self, _event) -> None:
        tab = self.notebook.index(self.notebook.select())
        if tab == 0:
            self.dashboard_tab.refresh()
        elif tab == 2:
            self.statistics_tab.refresh()

    def _set_icon(self) -> None:
        try:
            from pathlib import Path
            icon = Path(__file__).parent / "assets" / "icon.ico"
            if icon.exists():
                self.root.iconbitmap(str(icon))
        except Exception:
            logger.debug("Icon not set", exc_info=True)

    # ---------------- Theme ----------------
    def apply_theme(self, name: str) -> None:
        if name not in THEMES:
            name = "dark"
        self.colors = THEMES[name]
        c = self.colors
        self.root.configure(bg=c["bg"])
        # Style ttk widgets
        style = ttk.Style()
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass
        style.configure("TNotebook", background=c["bg"], borderwidth=0)
        style.configure("TNotebook.Tab", background=c["card"], foreground=c["muted"],
                         padding=(16, 8), font=("Segoe UI", 11))
        style.map("TNotebook.Tab",
                  background=[("selected", c["primary"])],
                  foreground=[("selected", "white")])
        style.configure("Treeview", background=c["card"], fieldbackground=c["card"],
                        foreground=c["text"], rowheight=26, font=("Segoe UI", 10))
        style.configure("Treeview.Heading", background=c["card"], foreground=c["text"],
                        font=("Segoe UI", 10, "bold"))
        style.map("Treeview", background=[("selected", c["primary"])],
                  foreground=[("selected", "white")])
        style.configure("TCombobox", fieldbackground=c["card"], background=c["card"],
                        foreground=c["text"])
        self.root.set_colors = c

    # ---------------- Reminder callback ----------------
    def _on_reminder(self, reminder: dict) -> None:
        logger.info("Reminder fired: %s", reminder)
        self.notification.notify()
        if self.notification.sound_enabled:
            self.notification.play_sound()
        if reminder.get("voice_enabled") or self.voice.enabled:
            self.voice.speak()
        # Offer snooze via a dialog on the main thread
        self.root.after(0, lambda: self._show_snooze(reminder))

    def _show_snooze(self, reminder: dict) -> None:
        result = messagebox.askyesnocancel(
            "Water Reminder",
            "Time to Drink Water! Stay hydrated.\n\nSnooze?",
            icon="info",
        )
        if result is None:
            return
        if result:
            mins = int(self.user.get_setting("snooze_minutes", "5"))
            self.scheduler.snooze(reminder, mins)

    # ---------------- Streak / success ----------------
    def _calc_streak(self) -> int:
        """Count consecutive days (ending today or yesterday) meeting the goal."""
        try:
            goal = (self.user.get_profile() or {}).get("daily_goal", 2500)
            history = {h["log_date"]: h["total"] for h in self.water_log.get_history(days=60)}
            streak = 0
            day = date.today()
            # Allow today to be in-progress without breaking streak
            if history.get(day.isoformat(), 0) < goal:
                day -= timedelta(days=1)
            while history.get(day.isoformat(), 0) >= goal:
                streak += 1
                day -= timedelta(days=1)
            return streak
        except Exception:
            logger.exception("Streak calc failed")
            return 0

    def _calc_success(self) -> int:
        """Percentage of last 30 days meeting the goal."""
        try:
            goal = (self.user.get_profile() or {}).get("daily_goal", 2500)
            history = self.water_log.get_history(days=30)
            if not history:
                return 0
            met = sum(1 for h in history if h["total"] >= goal)
            return int((met / len(history)) * 100)
        except Exception:
            return 0

    # ---------------- Achievements ----------------
    def check_achievements(self) -> None:
        try:
            total = self.water_log.get_today_total()
            goal = (self.user.get_profile() or {}).get("daily_goal", 2500)
            streak = self._calc_streak()
            unlocked = []
            if total > 0:
                unlocked.append("First Glass")
            if total >= 1000:
                unlocked.append("1L Day")
            if total >= 2000:
                unlocked.append("2L Day")
            if total >= goal:
                unlocked.append("Goal Met")
            if streak >= 3:
                unlocked.append("3-Day Streak")
            if streak >= 7:
                unlocked.append("7-Day Streak")

            from models.database import get_connection
            conn = get_connection()
            for name in unlocked:
                exists = conn.execute(
                    "SELECT 1 FROM achievements WHERE name = ?", (name,)
                ).fetchone()
                if not exists:
                    conn.execute(
                        "INSERT INTO achievements (name, unlocked_at) VALUES (?, datetime('now','localtime'))",
                        (name,),
                    )
                    self.root.after(0, lambda n=name: messagebox.showinfo(
                        "Achievement Unlocked!", f"You unlocked: {n}"))
            conn.commit()
            conn.close()
        except Exception:
            logger.exception("Achievement check failed")

    # ---------------- Scheduler reload ----------------
    def reload_scheduler(self) -> None:
        self.scheduler.stop()
        self.scheduler.start()

    def refresh_dashboard(self) -> None:
        self.streak = self._calc_streak()
        self.success_pct = self._calc_success()
        self.dashboard_tab.refresh()

    # ---------------- System tray ----------------
    def _minimize_to_tray(self) -> None:
        try:
            import pystray
            from PIL import Image
            icon_path = os.path.join(os.path.dirname(__file__), "assets", "icon.ico")
            image = Image.open(icon_path) if os.path.exists(icon_path) else Image.new("RGB", (64, 64), "#0ea5e9")
            menu = pystray.Menu(
                pystray.MenuItem("Open", self._restore_from_tray, default=True),
                pystray.MenuItem("Exit", self._exit_app),
            )
            self.tray_icon = pystray.Icon("SmartWater", image, "Smart Water Reminder", menu)
            self.root.withdraw()
            self.tray_icon.run()
        except Exception:
            logger.warning("Tray not available, hiding window", exc_info=True)
            self.root.withdraw()

    def _restore_from_tray(self, *_args) -> None:
        try:
            self.tray_icon.stop()
        except Exception:
            pass
        self.root.after(0, lambda: self.root.deiconify())

    def _exit_app(self, *_args) -> None:
        try:
            self.tray_icon.stop()
        except Exception:
            pass
        self._on_close()

    # ---------------- Startup ----------------
    def configure_startup(self, enable: bool) -> None:
        if platform.system() != "Windows":
            return
        try:
            import winreg
            key = winreg.HKEY_CURRENT_USER
            sub = r"Software\Microsoft\Windows\CurrentVersion\Run"
            with winreg.OpenKey(key, sub, 0, winreg.KEY_SET_VALUE) as k:
                if enable:
                    exe = sys.executable
                    winreg.SetValueEx(k, "SmartWaterReminder", 0, winreg.REG_SZ, f'"{exe}"')
                else:
                    try:
                        winreg.DeleteValue(k, "SmartWaterReminder")
                    except FileNotFoundError:
                        pass
        except Exception:
            logger.warning("Could not configure startup", exc_info=True)

    # ---------------- Close ----------------
    def _on_close(self) -> None:
        try:
            self.scheduler.stop()
        except Exception:
            pass
        self.root.destroy()


def main() -> None:
    root = tk.Tk()
    App(root)


if __name__ == "__main__":
    main()
