"""
ui/settings.py

Settings tab: user profile, theme, sound, voice, startup, backup/restore.
"""
from __future__ import annotations
import logging
import shutil
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from main import App

logger = logging.getLogger(__name__)

ACTIVITY_LEVELS = ["low", "moderate", "high", "athlete"]
GENDERS = ["male", "female", "other"]


class SettingsTab:
    """User profile and application settings."""

    def __init__(self, parent: tk.Widget, app: "App"):
        self.parent = parent
        self.app = app
        self.frame = tk.Frame(parent, bg=self.app.colors["bg"])
        self._build()

    def _build(self) -> None:
        c = self.app.colors
        self.frame.bind_all("<<NotebookTabChanged>>", lambda e: None)

        header = tk.Frame(self.frame, bg=c["bg"])
        header.pack(fill="x", padx=20, pady=(20, 10))
        tk.Label(header, text="Settings", font=("Segoe UI", 22, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(side="left")

        # ---------------- Profile ----------------
        prof = tk.LabelFrame(self.frame, text="User Profile", font=("Segoe UI", 13, "bold"),
                             bg=c["bg"], fg=c["text"], bd=1, relief="solid")
        prof.pack(fill="x", padx=20, pady=10)

        profile = self.app.user.get_profile() or {}
        self.entries = {}
        fields = [
            ("name", "Name:", "entry"),
            ("age", "Age:", "entry"),
            ("gender", "Gender:", "combo"),
            ("weight", "Weight (kg):", "entry"),
            ("height", "Height (cm):", "entry"),
            ("activity_level", "Activity Level:", "combo"),
            ("wake_up_time", "Wake-up (HH:MM):", "entry"),
            ("sleep_time", "Sleep (HH:MM):", "entry"),
        ]
        for i, (key, label, kind) in enumerate(fields):
            row = i // 2
            col = (i % 2) * 2
            tk.Label(prof, text=label, font=("Segoe UI", 11),
                     bg=c["bg"], fg=c["text"]).grid(row=row, column=col, sticky="w", padx=10, pady=8)
            if kind == "entry":
                e = tk.Entry(prof, font=("Segoe UI", 11), width=18)
                e.insert(0, str(profile.get(key, "") or ""))
                e.grid(row=row, column=col + 1, padx=10, pady=8)
                self.entries[key] = e
            else:
                var = tk.StringVar(value=profile.get(key, "moderate") if key == "activity_level" else "male")
                cb = ttk.Combobox(prof, textvariable=var, values=GENDERS if key == "gender" else ACTIVITY_LEVELS,
                                  state="readonly", font=("Segoe UI", 11), width=16)
                cb.grid(row=row, column=col + 1, padx=10, pady=8)
                self.entries[key] = cb

        # Auto goal
        self.auto_goal_var = tk.IntVar(value=profile.get("auto_goal", 1))
        tk.Checkbutton(prof, text="Auto-calculate daily goal", variable=self.auto_goal_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11),
                       command=self._toggle_auto_goal).grid(row=len(fields) // 2 + 1, column=0, columnspan=2, sticky="w", padx=10, pady=8)
        tk.Label(prof, text="Daily Goal (ml):", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).grid(row=len(fields) // 2 + 1, column=2, sticky="w", padx=10, pady=8)
        self.goal_entry = tk.Entry(prof, font=("Segoe UI", 11), width=18)
        self.goal_entry.insert(0, str(profile.get("daily_goal", 2500)))
        self.goal_entry.grid(row=len(fields) // 2 + 1, column=3, padx=10, pady=8)
        self._toggle_auto_goal()

        tk.Button(prof, text="Save Profile", font=("Segoe UI", 11, "bold"),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._save_profile).grid(
            row=len(fields) // 2 + 2, column=0, columnspan=4, pady=10, padx=10, sticky="ew")

        # ---------------- Appearance ----------------
        appear = tk.LabelFrame(self.frame, text="Appearance", font=("Segoe UI", 13, "bold"),
                               bg=c["bg"], fg=c["text"], bd=1, relief="solid")
        appear.pack(fill="x", padx=20, pady=10)
        tk.Label(appear, text="Theme:", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).pack(side="left", padx=10, pady=10)
        self.theme_var = tk.StringVar(value=self.app.user.get_setting("theme", "dark"))
        ttk.Combobox(appear, textvariable=self.theme_var,
                     values=["light", "dark", "ocean", "forest"], state="readonly",
                     font=("Segoe UI", 11)).pack(side="left", padx=10, pady=10)
        tk.Button(appear, text="Apply", font=("Segoe UI", 11, "bold"),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=6,
                  cursor="hand2", command=self._apply_theme).pack(side="left", padx=10, pady=10)

        # ---------------- Sound & Voice ----------------
        sv = tk.LabelFrame(self.frame, text="Sound & Voice", font=("Segoe UI", 13, "bold"),
                           bg=c["bg"], fg=c["text"], bd=1, relief="solid")
        sv.pack(fill="x", padx=20, pady=10)
        self.sound_var = tk.IntVar(value=int(self.app.user.get_setting("sound_enabled", "1")))
        self.voice_var = tk.IntVar(value=int(self.app.user.get_setting("voice_enabled", "0")))
        tk.Checkbutton(sv, text="Enable notification sound", variable=self.sound_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=10, pady=5)
        tk.Checkbutton(sv, text="Enable voice reminder", variable=self.voice_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=10, pady=5)
        tk.Button(sv, text="Save Sound Settings", font=("Segoe UI", 11, "bold"),
                  bg=c["accent"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._save_sound).pack(pady=10, padx=10, anchor="w")

        # ---------------- System ----------------
        sys_frame = tk.LabelFrame(self.frame, text="System", font=("Segoe UI", 13, "bold"),
                                  bg=c["bg"], fg=c["text"], bd=1, relief="solid")
        sys_frame.pack(fill="x", padx=20, pady=10)
        self.startup_var = tk.IntVar(value=int(self.app.user.get_setting("start_on_startup", "0")))
        self.tray_var = tk.IntVar(value=int(self.app.user.get_setting("minimize_to_tray", "1")))
        tk.Checkbutton(sys_frame, text="Start on Windows startup", variable=self.startup_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=10, pady=5)
        tk.Checkbutton(sys_frame, text="Minimize to system tray", variable=self.tray_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=10, pady=5)
        tk.Button(sys_frame, text="Save System Settings", font=("Segoe UI", 11, "bold"),
                  bg=c["success"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._save_system).pack(pady=10, padx=10, anchor="w")

        # ---------------- Backup ----------------
        bk = tk.LabelFrame(self.frame, text="Backup & Restore", font=("Segoe UI", 13, "bold"),
                           bg=c["bg"], fg=c["text"], bd=1, relief="solid")
        bk.pack(fill="x", padx=20, pady=(10, 20))
        tk.Button(bk, text="Backup Database", font=("Segoe UI", 11, "bold"),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._backup).pack(side="left", padx=10, pady=10, expand=True, fill="x")
        tk.Button(bk, text="Restore Database", font=("Segoe UI", 11, "bold"),
                  bg=c["accent"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._restore).pack(side="left", padx=10, pady=10, expand=True, fill="x")

    # ---------------- Handlers ----------------
    def _toggle_auto_goal(self) -> None:
        if self.auto_goal_var.get():
            self.goal_entry.config(state="disabled")
        else:
            self.goal_entry.config(state="normal")

    def _save_profile(self) -> None:
        try:
            data = {k: (v.get() if hasattr(v, "get") else v) for k, v in self.entries.items()}
            # Cast numerics
            for n in ("age", "weight", "height"):
                if data.get(n):
                    data[n] = float(data[n]) if n != "age" else int(float(data[n]))
            if self.auto_goal_var.get():
                goal = self.app.user.calculate_daily_goal(
                    float(data.get("weight", 70)), int(data.get("age", 25)),
                    data.get("gender", "male"), data.get("activity_level", "moderate"))
                data["daily_goal"] = goal
            else:
                data["daily_goal"] = int(self.goal_entry.get() or 2500)
            data["auto_goal"] = int(self.auto_goal_var.get())
            self.app.user.save_profile(data)
            messagebox.showinfo("Saved", "Profile saved.")
            self.app.refresh_dashboard()
        except Exception:
            logger.exception("Save profile failed")
            messagebox.showerror("Error", "Could not save profile.")

    def _apply_theme(self) -> None:
        self.app.user.set_setting("theme", self.theme_var.get())
        self.app.apply_theme(self.theme_var.get())

    def _save_sound(self) -> None:
        self.app.user.set_setting("sound_enabled", str(self.sound_var.get()))
        self.app.user.set_setting("voice_enabled", str(self.voice_var.get()))
        self.app.notification.set_sound_enabled(bool(self.sound_var.get()))
        self.app.voice.set_enabled(bool(self.voice_var.get()))
        messagebox.showinfo("Saved", "Sound settings saved.")

    def _save_system(self) -> None:
        self.app.user.set_setting("start_on_startup", str(self.startup_var.get()))
        self.app.user.set_setting("minimize_to_tray", str(self.tray_var.get()))
        self.app.configure_startup(bool(self.startup_var.get()))
        messagebox.showinfo("Saved", "System settings saved.")

    def _backup(self) -> None:
        path = filedialog.asksaveasfilename(defaultextension=".db",
                                            filetypes=[("SQLite DB", "*.db")],
                                            initialfile="water_backup.db")
        if not path:
            return
        try:
            from models.database import DB_PATH
            shutil.copy(str(DB_PATH), path)
            messagebox.showinfo("Backup", f"Backed up to {path}")
        except Exception:
            logger.exception("Backup failed")
            messagebox.showerror("Error", "Backup failed.")

    def _restore(self) -> None:
        path = filedialog.askopenfilename(filetypes=[("SQLite DB", "*.db")])
        if not path:
            return
        try:
            from models.database import DB_PATH
            shutil.copy(path, str(DB_PATH))
            messagebox.showinfo("Restored", "Restart the app to apply restored data.")
        except Exception:
            logger.exception("Restore failed")
            messagebox.showerror("Error", "Restore failed.")

    def refresh(self) -> None:
        pass
