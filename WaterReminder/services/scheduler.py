"""
services/scheduler.py

Background reminder scheduler running in a daemon thread.
Checks every minute whether any reminder is due and fires notifications.
Supports snooze and custom intervals.
"""
from __future__ import annotations
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Callable, Optional, List

from models.reminder_model import ReminderModel

logger = logging.getLogger(__name__)


class SchedulerService:
    """Polls enabled reminders every minute and triggers notifications."""

    POLL_INTERVAL = 30  # seconds

    def __init__(self, reminder_model: ReminderModel,
                 on_reminder: Callable[[dict], None]):
        self.reminder_model = reminder_model
        self.on_reminder = on_reminder
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._snoozed: List[dict] = []  # {fire_at: datetime, reminder: dict}

    # ---------------- Lifecycle ----------------
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info("Scheduler started")

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2)
        logger.info("Scheduler stopped")

    # ---------------- Snooze ----------------
    def snooze(self, reminder: dict, minutes: int) -> None:
        fire_at = datetime.now() + timedelta(minutes=minutes)
        self._snoozed.append({"fire_at": fire_at, "reminder": reminder})
        logger.info("Snoozed reminder for %s minutes", minutes)

    # ---------------- Main loop ----------------
    def _run(self) -> None:
        last_fired = {}  # reminder_id -> datetime
        while not self._stop_event.is_set():
            now = datetime.now()
            current_time = now.strftime("%H:%M")

            # Check scheduled reminders
            try:
                reminders = self.reminder_model.get_enabled_reminders()
            except Exception:
                logger.exception("Failed to fetch reminders")
                reminders = []

            for r in reminders:
                rid = r["id"]
                # Time-based reminder (HH:MM)
                if r.get("time") and r["time"] == current_time:
                    last = last_fired.get(rid)
                    if last is None or (now - last).total_seconds() > 60:
                        self.on_reminder(r)
                        last_fired[rid] = now

                # Interval-based reminder
                interval = r.get("interval_minutes")
                if interval:
                    last = last_fired.get(rid)
                    if last is None or (now - last).total_seconds() >= interval * 60:
                        self.on_reminder(r)
                        last_fired[rid] = now

            # Check snoozed reminders
            still_snoozed = []
            for s in self._snoozed:
                if now >= s["fire_at"]:
                    self.on_reminder(s["reminder"])
                else:
                    still_snoozed.append(s)
            self._snoozed = still_snoozed

            self._stop_event.wait(self.POLL_INTERVAL)
