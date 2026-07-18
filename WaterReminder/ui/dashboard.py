"""
ui/dashboard.py

Dashboard tab: animated water bottle, progress bar, today's stats, quick-log buttons.
"""
from __future__ import annotations
import logging
import tkinter as tk
from tkinter import messagebox
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from main import App

logger = logging.getLogger(__name__)

QUICK_AMOUNTS = [100, 200, 250, 500]

QUOTES = [
    "Water is the driving force of all nature. - Leonardo da Vinci",
    "Thousands have lived without love, not one without water. - W.H. Auden",
    "Stay hydrated, stay healthy!",
    "Pure water is the world's first and foremost medicine. - Slovakian proverb",
    "Hydration is the key to a sharp mind and a healthy body.",
    "Drink water: your brain is 73% water, keep it that way!",
]


class DashboardTab:
    """Main dashboard with water bottle animation and quick logging."""

    def __init__(self, parent: tk.Widget, app: "App"):
        self.parent = parent
        self.app = app

        self.frame = tk.Frame(parent, bg=self.app.colors["bg"])
        self._build()

    # ---------------- Build UI ----------------
    def _build(self) -> None:
        c = self.app.colors

        # Top header
        header = tk.Frame(self.frame, bg=c["bg"])
        header.pack(fill="x", padx=20, pady=(20, 10))
        tk.Label(header, text="Today's Dashboard", font=("Segoe UI", 22, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(side="left")

        # Quote
        import random
        self.quote_label = tk.Label(
            self.frame, text=random.choice(QUOTES),
            font=("Segoe UI", 11, "italic"), bg=c["bg"], fg=c["muted"]
        )
        self.quote_label.pack(pady=(0, 15))

        # Center: bottle + stats
        center = tk.Frame(self.frame, bg=c["bg"])
        center.pack(fill="x", padx=20, pady=10)

        # Animated water bottle (canvas)
        self.bottle_canvas = tk.Canvas(center, width=160, height=280,
                                       bg=c["bg"], highlightthickness=0)
        self.bottle_canvas.pack(side="left", padx=20)
        self._draw_bottle(0.0)

        # Stats panel
        stats = tk.Frame(center, bg=c["card"], bd=0, highlightthickness=1,
                         highlightbackground=c["border"])
        stats.pack(side="left", fill="both", expand=True, padx=20, ipadx=15, ipady=15)

        self.goal_label = tk.Label(stats, text="Goal: -- ml", font=("Segoe UI", 14, "bold"),
                                   bg=c["card"], fg=c["text"])
        self.goal_label.pack(anchor="w", pady=(5, 5))

        self.intake_label = tk.Label(stats, text="Intake: 0 ml", font=("Segoe UI", 13),
                                     bg=c["card"], fg=c["primary"])
        self.intake_label.pack(anchor="w", pady=2)

        self.remaining_label = tk.Label(stats, text="Remaining: -- ml", font=("Segoe UI", 13),
                                        bg=c["card"], fg=c["muted"])
        self.remaining_label.pack(anchor="w", pady=2)

        self.streak_label = tk.Label(stats, text="Streak: 0 days", font=("Segoe UI", 13),
                                     bg=c["card"], fg=c["accent"])
        self.streak_label.pack(anchor="w", pady=2)

        self.success_label = tk.Label(stats, text="Success: 0%", font=("Segoe UI", 13),
                                      bg=c["card"], fg=c["success"])
        self.success_label.pack(anchor="w", pady=(2, 10))

        # Progress bar (canvas)
        self.bar_canvas = tk.Canvas(stats, height=24, bg=c["card"],
                                    highlightthickness=0)
        self.bar_canvas.pack(fill="x", pady=(5, 10))
        self._draw_progress_bar(0.0)

        # Quick log buttons
        log_frame = tk.Frame(self.frame, bg=c["bg"])
        log_frame.pack(fill="x", padx=20, pady=(15, 5))
        tk.Label(log_frame, text="Quick Add Water:", font=("Segoe UI", 12, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(anchor="w", pady=(0, 8))

        btn_frame = tk.Frame(log_frame, bg=c["bg"])
        btn_frame.pack(fill="x")
        for amt in QUICK_AMOUNTS:
            b = tk.Button(btn_frame, text=f"+{amt} ml",
                          font=("Segoe UI", 11, "bold"),
                          bg=c["primary"], fg="white", relief="flat", bd=0,
                          padx=12, pady=8, cursor="hand2",
                          command=lambda a=amt: self._log_water(a))
            b.pack(side="left", padx=5, expand=True, fill="x")

        # Custom + reset
        extra = tk.Frame(self.frame, bg=c["bg"])
        extra.pack(fill="x", padx=20, pady=(5, 20))
        tk.Button(extra, text="Custom Amount", font=("Segoe UI", 11),
                  bg=c["accent"], fg="white", relief="flat", bd=0,
                  padx=12, pady=8, cursor="hand2",
                  command=self._custom_amount).pack(side="left", padx=5, expand=True, fill="x")
        tk.Button(extra, text="Reset Today", font=("Segoe UI", 11),
                  bg=c["danger"], fg="white", relief="flat", bd=0,
                  padx=12, pady=8, cursor="hand2",
                  command=self._reset_today).pack(side="left", padx=5, expand=True, fill="x")

        # Today's log list
        tk.Label(self.frame, text="Today's Drinks:", font=("Segoe UI", 12, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(anchor="w", padx=20, pady=(10, 5))
        self.log_listbox = tk.Listbox(self.frame, height=6, font=("Segoe UI", 11),
                                      bg=c["card"], fg=c["text"], bd=0,
                                      highlightthickness=1,
                                      highlightbackground=c["border"])
        self.log_listbox.pack(fill="x", padx=20, pady=(0, 20))

        self.refresh()

    # ---------------- Bottle animation ----------------
    def _draw_bottle(self, fraction: float) -> None:
        """Draw a bottle filled to `fraction` (0..1)."""
        c = self.app.colors
        self.bottle_canvas.delete("all")
        w, h = 160, 280
        bw, bh = 100, 220
        bx = (w - bw) // 2
        by = 40
        # Bottle outline
        self.bottle_canvas.create_rectangle(bx, by, bx + bw, by + bh,
                                            outline=c["border"], width=2)
        # Neck
        self.bottle_canvas.create_rectangle(bx + 30, by - 20, bx + 70, by + 5,
                                             outline=c["border"], width=2)
        # Cap
        self.bottle_canvas.create_rectangle(bx + 30, by - 30, bx + 70, by - 20,
                                             fill=c["primary"], outline="")
        # Water fill
        fill_h = int(bh * max(0.0, min(fraction, 1.0)))
        if fill_h > 0:
            self.bottle_canvas.create_rectangle(
                bx + 2, by + bh - fill_h, bx + bw - 2, by + bh - 2,
                fill=c["primary"], outline="", stipple="gray50"
            )
        # Label
        pct = int(fraction * 100)
        self.bottle_canvas.create_text(w // 2, by + bh + 18,
                                        text=f"{pct}%",
                                        font=("Segoe UI", 12, "bold"),
                                        fill=c["text"])

    def _draw_progress_bar(self, fraction: float) -> None:
        c = self.app.colors
        self.bar_canvas.delete("all")
        self.bar_canvas.update_idletasks()
        w = max(self.bar_canvas.winfo_width(), 200)
        h = 24
        self.bar_canvas.create_rectangle(2, 2, w - 2, h - 2, outline=c["border"])
        fill_w = int((w - 6) * max(0.0, min(fraction, 1.0)))
        if fill_w > 0:
            self.bar_canvas.create_rectangle(3, 3, 3 + fill_w, h - 3,
                                              fill=c["primary"], outline="")
        self.bar_canvas.create_text(w // 2, h // 2,
                                    text=f"{int(fraction * 100)}%",
                                    font=("Segoe UI", 10, "bold"),
                                    fill=c["text"])

    # ---------------- Actions ----------------
    def _log_water(self, amount: int) -> None:
        try:
            self.app.water_log.add_log(amount)
            self.refresh()
            self.app.check_achievements()
        except Exception:
            logger.exception("Failed to log water")
            messagebox.showerror("Error", "Could not save water log.")

    def _custom_amount(self) -> None:
        dialog = tk.Toplevel(self.frame)
        dialog.title("Custom Amount")
        dialog.geometry("280x140")
        dialog.configure(bg=self.app.colors["bg"])
        dialog.transient(self.frame)
        dialog.grab_set()
        tk.Label(dialog, text="Enter amount (ml):", font=("Segoe UI", 12),
                 bg=self.app.colors["bg"], fg=self.app.colors["text"]).pack(pady=15)
        entry = tk.Entry(dialog, font=("Segoe UI", 14), width=10, justify="center")
        entry.pack(pady=5)
        entry.focus_set()

        def save():
            try:
                amt = int(entry.get())
                if amt <= 0:
                    raise ValueError
                self._log_water(amt)
                dialog.destroy()
            except ValueError:
                messagebox.showerror("Invalid", "Please enter a positive number.")

        tk.Button(dialog, text="Add", font=("Segoe UI", 11, "bold"),
                  bg=self.app.colors["primary"], fg="white", relief="flat",
                  command=save).pack(pady=10)

    def _reset_today(self) -> None:
        if messagebox.askyesno("Reset", "Reset all of today's water logs?"):
            self.app.water_log.reset_today()
            self.refresh()

    # ---------------- Refresh ----------------
    def refresh(self) -> None:
        """Update all dashboard numbers from the database."""
        try:
            total = self.app.water_log.get_today_total()
            goal = self.app.user.get_profile().get("daily_goal", 2500) if self.app.user.get_profile() else 2500
            remaining = max(0, goal - total)
            fraction = total / goal if goal > 0 else 0

            self.goal_label.config(text=f"Goal: {goal} ml")
            self.intake_label.config(text=f"Intake: {total} ml")
            self.remaining_label.config(text=f"Remaining: {remaining} ml")
            self.streak_label.config(text=f"Streak: {self.app.streak} days")
            self.success_label.config(text=f"Success: {self.app.success_pct}%")

            self._draw_bottle(fraction)
            self._draw_progress_bar(fraction)

            # Log list
            self.log_listbox.delete(0, tk.END)
            for log in self.app.water_log.get_today_logs():
                self.log_listbox.insert(tk.END,
                                        f"{log['log_time']}  -  {log['amount_ml']} ml")
        except Exception:
            logger.exception("Dashboard refresh failed")
