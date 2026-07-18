"""
ui/reminder.py

Reminder tab: list, add, edit, delete, enable/disable reminders.
"""
from __future__ import annotations
import logging
import tkinter as tk
from tkinter import ttk, messagebox
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from main import App

logger = logging.getLogger(__name__)

INTERVAL_OPTIONS = {
    "One time": None,
    "Every 30 min": 30,
    "Every 1 hour": 60,
    "Every 2 hours": 120,
    "Every 3 hours": 180,
}


class ReminderTab:
    """Manage multiple reminders."""

    def __init__(self, parent: tk.Widget, app: "App"):
        self.parent = parent
        self.app = app
        self.frame = tk.Frame(parent, bg=self.app.colors["bg"])
        self._build()

    def _build(self) -> None:
        c = self.app.colors

        header = tk.Frame(self.frame, bg=c["bg"])
        header.pack(fill="x", padx=20, pady=(20, 10))
        tk.Label(header, text="Reminders", font=("Segoe UI", 22, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(side="left")
        tk.Button(header, text="+ Add Reminder", font=("Segoe UI", 11, "bold"),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=6,
                  cursor="hand2", command=self._add_dialog).pack(side="right")

        # Treeview of reminders
        cols = ("id", "time", "interval", "enabled", "label")
        self.tree = ttk.Treeview(self.frame, columns=cols, show="headings", height=12)
        for col, label, width in [
            ("id", "ID", 40),
            ("time", "Time", 80),
            ("interval", "Interval", 120),
            ("enabled", "Enabled", 80),
            ("label", "Label", 200),
        ]:
            self.tree.heading(col, text=label)
            self.tree.column(col, width=width, anchor="center")
        self.tree.pack(fill="both", expand=True, padx=20, pady=10)

        # Action buttons
        actions = tk.Frame(self.frame, bg=c["bg"])
        actions.pack(fill="x", padx=20, pady=(5, 20))
        for text, cmd, color in [
            ("Edit", self._edit_dialog, c["accent"]),
            ("Delete", self._delete, c["danger"]),
            ("Enable/Disable", self._toggle, c["success"]),
        ]:
            tk.Button(actions, text=text, font=("Segoe UI", 11, "bold"),
                      bg=color, fg="white", relief="flat", bd=0, padx=12, pady=8,
                      cursor="hand2", command=cmd).pack(side="left", padx=5, expand=True, fill="x")

        self.refresh()

    # ---------------- CRUD dialogs ----------------
    def _add_dialog(self) -> None:
        self._edit_dialog(reminder_id=None)

    def _edit_dialog(self, reminder_id: int | None = None) -> None:
        c = self.app.colors
        dialog = tk.Toplevel(self.frame)
        dialog.title("Add Reminder" if reminder_id is None else "Edit Reminder")
        dialog.geometry("340x360")
        dialog.configure(bg=c["bg"])
        dialog.transient(self.frame)
        dialog.grab_set()

        tk.Label(dialog, text="Time (HH:MM):", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).pack(pady=(15, 2), anchor="w", padx=20)
        time_entry = tk.Entry(dialog, font=("Segoe UI", 12))
        time_entry.pack(fill="x", padx=20, pady=2)

        tk.Label(dialog, text="Interval:", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).pack(pady=(10, 2), anchor="w", padx=20)
        interval_var = tk.StringVar(value="One time")
        interval_menu = ttk.Combobox(dialog, textvariable=interval_var,
                                     values=list(INTERVAL_OPTIONS.keys()),
                                     state="readonly", font=("Segoe UI", 11))
        interval_menu.pack(fill="x", padx=20, pady=2)

        tk.Label(dialog, text="Label:", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).pack(pady=(10, 2), anchor="w", padx=20)
        label_entry = tk.Entry(dialog, font=("Segoe UI", 12))
        label_entry.pack(fill="x", padx=20, pady=2)

        sound_var = tk.IntVar(value=1)
        voice_var = tk.IntVar(value=0)
        tk.Checkbutton(dialog, text="Play sound", variable=sound_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=20, pady=5)
        tk.Checkbutton(dialog, text="Voice reminder", variable=voice_var,
                       bg=c["bg"], fg=c["text"], activebackground=c["bg"],
                       selectcolor=c["card"], font=("Segoe UI", 11)).pack(anchor="w", padx=20)

        # Pre-fill if editing
        if reminder_id is not None:
            reminders = self.app.reminders.get_all_reminders()
            r = next((x for x in reminders if x["id"] == reminder_id), None)
            if r:
                time_entry.insert(0, r["time"])
                label_entry.insert(0, r.get("label") or "")
                inv = r.get("interval_minutes")
                for k, v in INTERVAL_OPTIONS.items():
                    if v == inv:
                        interval_var.set(k)
                        break
                sound_var.set(r.get("sound_enabled", 1))
                voice_var.set(r.get("voice_enabled", 0))

        def save():
            time_str = time_entry.get().strip()
            try:
                hh, mm = time_str.split(":")
                int(hh); int(mm)
            except Exception:
                messagebox.showerror("Invalid", "Time must be HH:MM")
                return
            interval = INTERVAL_OPTIONS[interval_var.get()]
            data = {
                "time": time_str,
                "interval_minutes": interval,
                "label": label_entry.get().strip(),
                "sound_enabled": bool(sound_var.get()),
                "voice_enabled": bool(voice_var.get()),
            }
            try:
                if reminder_id is None:
                    self.app.reminders.add_reminder(**data)
                else:
                    self.app.reminders.update_reminder(reminder_id, **data)
                self.refresh()
                self.app.reload_scheduler()
                dialog.destroy()
            except Exception:
                logger.exception("Save reminder failed")
                messagebox.showerror("Error", "Could not save reminder.")

        tk.Button(dialog, text="Save", font=("Segoe UI", 12, "bold"),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=save).pack(pady=20, padx=20, fill="x")

    def _delete(self) -> None:
        sel = self.tree.selection()
        if not sel:
            return
        rid = int(self.tree.item(sel[0])["values"][0])
        if messagebox.askyesno("Delete", "Delete this reminder?"):
            self.app.reminders.delete_reminder(rid)
            self.refresh()
            self.app.reload_scheduler()

    def _toggle(self) -> None:
        sel = self.tree.selection()
        if not sel:
            return
        rid = int(self.tree.item(sel[0])["values"][0])
        current = str(self.tree.item(sel[0])["values"][3])
        enabled = current.lower() in ("1", "true", "yes")
        self.app.reminders.toggle_reminder(rid, not enabled)
        self.refresh()
        self.app.reload_scheduler()

    # ---------------- Refresh ----------------
    def refresh(self) -> None:
        for item in self.tree.get_children():
            self.tree.delete(item)
        for r in self.app.reminders.get_all_reminders():
            inv = r.get("interval_minutes")
            inv_text = "One time" if not inv else f"Every {inv} min"
            self.tree.insert("", tk.END, values=(
                r["id"], r["time"], inv_text,
                "Yes" if r["enabled"] else "No",
                r.get("label") or "",
            ))
