"""
models/reminder_model.py

Data access for reminders and water logs.
"""
from __future__ import annotations
import logging
from datetime import date
from typing import List, Optional
from models.database import get_connection

logger = logging.getLogger(__name__)


class ReminderModel:
    """CRUD operations for the reminders table."""

    def add_reminder(self, time_str: str, interval_minutes: Optional[int] = None,
                     label: str = "", sound_enabled: bool = True,
                     voice_enabled: bool = False) -> int:
        conn = get_connection()
        try:
            cur = conn.execute(
                """
                INSERT INTO reminders
                    (time, interval_minutes, enabled, repeat_daily,
                     label, sound_enabled, voice_enabled)
                VALUES (?, ?, 1, 1, ?, ?, ?)
                """,
                (time_str, interval_minutes, label,
                 int(sound_enabled), int(voice_enabled)),
            )
            conn.commit()
            logger.info("Added reminder at %s", time_str)
            return cur.lastrowid
        finally:
            conn.close()

    def update_reminder(self, reminder_id: int, **fields) -> None:
        if not fields:
            return
        allowed = {"time", "interval_minutes", "enabled", "repeat_daily",
                   "label", "sound_enabled", "voice_enabled"}
        clean = {k: v for k, v in fields.items() if k in allowed}
        if not clean:
            return
        set_clause = ", ".join(f"{k} = ?" for k in clean)
        conn = get_connection()
        try:
            conn.execute(
                f"UPDATE reminders SET {set_clause} WHERE id = ?",
                tuple(clean.values()) + (reminder_id,),
            )
            conn.commit()
        finally:
            conn.close()

    def delete_reminder(self, reminder_id: int) -> None:
        conn = get_connection()
        try:
            conn.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
            conn.commit()
            logger.info("Deleted reminder %s", reminder_id)
        finally:
            conn.close()

    def toggle_reminder(self, reminder_id: int, enabled: bool) -> None:
        conn = get_connection()
        try:
            conn.execute(
                "UPDATE reminders SET enabled = ? WHERE id = ?",
                (int(enabled), reminder_id),
            )
            conn.commit()
        finally:
            conn.close()

    def get_all_reminders(self) -> List[dict]:
        conn = get_connection()
        try:
            rows = conn.execute(
                "SELECT * FROM reminders ORDER BY time"
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_enabled_reminders(self) -> List[dict]:
        conn = get_connection()
        try:
            rows = conn.execute(
                "SELECT * FROM reminders WHERE enabled = 1 ORDER BY time"
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()


class WaterLogModel:
    """CRUD operations for the water_logs table."""

    def add_log(self, amount_ml: int) -> int:
        today = date.today().isoformat()
        import time
        now = time.strftime("%H:%M:%S")
        conn = get_connection()
        try:
            cur = conn.execute(
                "INSERT INTO water_logs (amount_ml, log_date, log_time) VALUES (?, ?, ?)",
                (amount_ml, today, now),
            )
            conn.commit()
            return cur.lastrowid
        finally:
            conn.close()

    def get_today_total(self) -> int:
        today = date.today().isoformat()
        conn = get_connection()
        try:
            row = conn.execute(
                "SELECT COALESCE(SUM(amount_ml), 0) AS total FROM water_logs WHERE log_date = ?",
                (today,),
            ).fetchone()
            return int(row["total"])
        finally:
            conn.close()

    def get_today_logs(self) -> List[dict]:
        today = date.today().isoformat()
        conn = get_connection()
        try:
            rows = conn.execute(
                "SELECT * FROM water_logs WHERE log_date = ? ORDER BY log_time DESC",
                (today,),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_history(self, days: int = 30) -> List[dict]:
        conn = get_connection()
        try:
            rows = conn.execute(
                """
                SELECT log_date, SUM(amount_ml) AS total
                FROM water_logs
                WHERE log_date >= date('now', ?)
                GROUP BY log_date
                ORDER BY log_date
                """,
                (f"-{days} days",),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def reset_today(self) -> None:
        today = date.today().isoformat()
        conn = get_connection()
        try:
            conn.execute("DELETE FROM water_logs WHERE log_date = ?", (today,))
            conn.commit()
            logger.info("Today's progress reset")
        finally:
            conn.close()

    def delete_log(self, log_id: int) -> None:
        conn = get_connection()
        try:
            conn.execute("DELETE FROM water_logs WHERE id = ?", (log_id,))
            conn.commit()
        finally:
            conn.close()

    def search_logs(self, query: str) -> List[dict]:
        conn = get_connection()
        try:
            rows = conn.execute(
                "SELECT * FROM water_logs WHERE log_date LIKE ? ORDER BY log_date DESC",
                (f"%{query}%",),
            ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()
