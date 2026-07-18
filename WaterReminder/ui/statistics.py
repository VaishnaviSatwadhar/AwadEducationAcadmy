"""
ui/statistics.py

Statistics tab: weekly/monthly graphs, average intake, success percentage,
drink history calendar, export to CSV, search history.
"""
from __future__ import annotations
import logging
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import date, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from main import App

logger = logging.getLogger(__name__)


class StatisticsTab:
    """Charts and history for water intake."""

    def __init__(self, parent: tk.Widget, app: "App"):
        self.parent = parent
        self.app = app
        self.frame = tk.Frame(parent, bg=self.app.colors["bg"])
        self._build()

    def _build(self) -> None:
        c = self.app.colors

        header = tk.Frame(self.frame, bg=c["bg"])
        header.pack(fill="x", padx=20, pady=(20, 10))
        tk.Label(header, text="Statistics", font=("Segoe UI", 22, "bold"),
                 bg=c["bg"], fg=c["text"]).pack(side="left")

        # Summary cards
        summary = tk.Frame(self.frame, bg=c["bg"])
        summary.pack(fill="x", padx=20, pady=(0, 15))
        self.avg_label = self._stat_card(summary, "Avg Daily", "0 ml", c["primary"])
        self.avg_label.pack(side="left", padx=5, expand=True, fill="x")
        self.success_card = self._stat_card(summary, "Success Rate", "0%", c["success"])
        self.success_card.pack(side="left", padx=5, expand=True, fill="x")
        self.streak_card = self._stat_card(summary, "Streak", "0 days", c["accent"])
        self.streak_card.pack(side="left", padx=5, expand=True, fill="x")

        # Chart buttons
        chart_frame = tk.Frame(self.frame, bg=c["bg"])
        chart_frame.pack(fill="x", padx=20, pady=(0, 10))
        for text, fn in [("Weekly Graph", self._show_weekly),
                         ("Monthly Graph", self._show_monthly)]:
            tk.Button(chart_frame, text=text, font=("Segoe UI", 11, "bold"),
                      bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                      cursor="hand2", command=fn).pack(side="left", padx=5, expand=True, fill="x")

        # Export / search
        tools = tk.Frame(self.frame, bg=c["bg"])
        tools.pack(fill="x", padx=20, pady=(0, 15))
        tk.Button(tools, text="Export CSV", font=("Segoe UI", 11),
                  bg=c["accent"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._export_csv).pack(side="left", padx=5, expand=True, fill="x")
        tk.Button(tools, text="Import CSV", font=("Segoe UI", 11),
                  bg=c["success"], fg="white", relief="flat", bd=0, padx=12, pady=8,
                  cursor="hand2", command=self._import_csv).pack(side="left", padx=5, expand=True, fill="x")

        # Search
        search_frame = tk.Frame(self.frame, bg=c["bg"])
        search_frame.pack(fill="x", padx=20, pady=(0, 10))
        tk.Label(search_frame, text="Search history (date):", font=("Segoe UI", 11),
                 bg=c["bg"], fg=c["text"]).pack(side="left")
        self.search_entry = tk.Entry(search_frame, font=("Segoe UI", 11))
        self.search_entry.pack(side="left", fill="x", expand=True, padx=10)
        tk.Button(search_frame, text="Search", font=("Segoe UI", 11),
                  bg=c["primary"], fg="white", relief="flat", bd=0, padx=12, pady=6,
                  cursor="hand2", command=self._search).pack(side="left")

        # History tree
        cols = ("date", "time", "amount")
        self.tree = ttk.Treeview(self.frame, columns=cols, show="headings", height=10)
        for col, label, width in [("date", "Date", 120), ("time", "Time", 120), ("amount", "Amount (ml)", 150)]:
            self.tree.heading(col, text=label)
            self.tree.column(col, width=width, anchor="center")
        self.tree.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        self.refresh()

    def _stat_card(self, parent, label, value, color):
        c = self.app.colors
        card = tk.Frame(parent, bg=c["card"], bd=0, highlightthickness=1,
                        highlightbackground=c["border"])
        tk.Label(card, text=label, font=("Segoe UI", 10), bg=c["card"], fg=c["muted"]).pack(pady=(8, 2))
        tk.Label(card, text=value, font=("Segoe UI", 16, "bold"), bg=c["card"], fg=color).pack(pady=(0, 8))
        return card

    # ---------------- Charts ----------------
    def _show_weekly(self) -> None:
        self._show_chart(days=7, title="Weekly Water Intake")

    def _show_monthly(self) -> None:
        self._show_chart(days=30, title="Monthly Water Intake")

    def _show_chart(self, days: int, title: str) -> None:
        try:
            import matplotlib
            matplotlib.use("TkAgg")
            import matplotlib.pyplot as plt
            from matplotlib.dates import DateFormatter

            history = self.app.water_log.get_history(days=days)
            if not history:
                messagebox.showinfo("No data", "No water logs for this period.")
                return
            dates = [h["log_date"] for h in history]
            amounts = [h["total"] for h in history]

            fig, ax = plt.subplots(figsize=(8, 4))
            ax.bar(dates, amounts, color="#0ea5e9")
            ax.set_title(title)
            ax.set_ylabel("Water (ml)")
            ax.tick_params(axis="x", rotation=45)
            fig.tight_layout()
            plt.show()
        except Exception:
            logger.exception("Chart failed")
            messagebox.showerror("Error", "Could not render chart.")

    # ---------------- Export / Import ----------------
    def _export_csv(self) -> None:
        path = filedialog.asksaveasfilename(defaultextension=".csv",
                                             filetypes=[("CSV", "*.csv")],
                                             initialfile="water_history.csv")
        if not path:
            return
        try:
            import pandas as pd
            history = self.app.water_log.get_history(days=365)
            df = pd.DataFrame(history)
            df.to_csv(path, index=False)
            messagebox.showinfo("Exported", f"Saved to {path}")
        except Exception:
            logger.exception("Export failed")
            messagebox.showerror("Error", "Export failed.")

    def _import_csv(self) -> None:
        path = filedialog.askopenfilename(filetypes=[("CSV", "*.csv")])
        if not path:
            return
        try:
            import pandas as pd
            from models.database import get_connection
            df = pd.read_csv(path)
            conn = get_connection()
            for _, row in df.iterrows():
                conn.execute(
                    "INSERT INTO water_logs (amount_ml, log_date, log_time) VALUES (?, ?, ?)",
                    (int(row.get("total", row.get("amount_ml", 0))),
                     str(row.get("log_date")), "00:00:00"),
                )
            conn.commit()
            conn.close()
            messagebox.showinfo("Imported", f"Imported {len(df)} rows.")
            self.refresh()
        except Exception:
            logger.exception("Import failed")
            messagebox.showerror("Error", "Import failed.")

    # ---------------- Search ----------------
    def _search(self) -> None:
        q = self.search_entry.get().strip()
        if not q:
            self.refresh()
            return
        for item in self.tree.get_children():
            self.tree.delete(item)
        for log in self.app.water_log.search_logs(q):
            self.tree.insert("", tk.END, values=(log["log_date"], log["log_time"], log["amount_ml"]))

    # ---------------- Refresh ----------------
    def refresh(self) -> None:
        try:
            history = self.app.water_log.get_history(days=30)
            if history:
                avg = sum(h["total"] for h in history) / len(history)
                self.avg_label.config(text=f"{int(avg)} ml")
            self.success_card.config(text=f"{self.app.success_pct}%")
            self.streak_card.config(text=f"{self.app.streak} days")

            for item in self.tree.get_children():
                self.tree.delete(item)
            # Show last 30 days of logs
            conn = None
            try:
                from models.database import get_connection
                conn = get_connection()
                rows = conn.execute(
                    "SELECT * FROM water_logs ORDER BY log_date DESC, log_time DESC LIMIT 100"
                ).fetchall()
                for r in rows:
                    self.tree.insert("", tk.END, values=(r["log_date"], r["log_time"], r["amount_ml"]))
            finally:
                if conn:
                    conn.close()
        except Exception:
            logger.exception("Statistics refresh failed")
