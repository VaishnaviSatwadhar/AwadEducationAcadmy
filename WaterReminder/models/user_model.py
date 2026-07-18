"""
models/user_model.py

Data access for the user profile and settings tables.
A single-user app: profile row id is always 1.
"""
from __future__ import annotations
import logging
from typing import Optional
from models.database import get_connection

logger = logging.getLogger(__name__)
USER_ID = 1  # single-user application


class UserModel:
    """CRUD operations for the user profile and app settings."""

    # ---------------- Profile ----------------
    def get_profile(self) -> Optional[dict]:
        conn = get_connection()
        try:
            row = conn.execute(
                "SELECT * FROM users WHERE id = ?", (USER_ID,)
            ).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def save_profile(self, data: dict) -> None:
        """Insert or update the single user profile."""
        conn = get_connection()
        try:
            exists = conn.execute(
                "SELECT 1 FROM users WHERE id = ?", (USER_ID,)
            ).fetchone()
            if exists:
                fields = [
                    "name", "age", "gender", "weight", "height",
                    "activity_level", "wake_up_time", "sleep_time",
                    "daily_goal", "auto_goal",
                ]
                set_clause = ", ".join(f"{f} = ?" for f in fields)
                values = [data.get(f) for f in fields] + [USER_ID]
                conn.execute(
                    f"UPDATE users SET {set_clause} WHERE id = ?", values
                )
            else:
                conn.execute(
                    """
                    INSERT INTO users
                        (id, name, age, gender, weight, height, activity_level,
                         wake_up_time, sleep_time, daily_goal, auto_goal)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)
                    """,
                    (
                        USER_ID, data.get("name"), data.get("age"),
                        data.get("gender"), data.get("weight"), data.get("height"),
                        data.get("activity_level"), data.get("wake_up_time"),
                        data.get("sleep_time"), data.get("daily_goal", 2500),
                        data.get("auto_goal", 1),
                    ),
                )
            conn.commit()
            logger.info("Profile saved")
        except Exception:
            conn.rollback()
            logger.exception("Failed to save profile")
            raise
        finally:
            conn.close()

    # ---------------- Water goal ----------------
    @staticmethod
    def calculate_daily_goal(weight: float, age: int, gender: str,
                             activity_level: str) -> int:
        """
        Auto-calculate daily water goal (ml).
        Base 35 ml per kg of body weight, adjusted for activity.
        """
        base = weight * 35
        activity_factor = {
            "low": 1.0,
            "moderate": 1.1,
            "high": 1.25,
            "athlete": 1.4,
        }.get(activity_level, 1.0)
        goal = base * activity_factor
        if gender and gender.lower() == "female":
            goal *= 0.95
        if age and age > 55:
            goal *= 0.9
        return int(max(1500, min(goal, 5000)))

    # ---------------- Settings ----------------
    def get_setting(self, key: str, default: Optional[str] = None) -> Optional[str]:
        conn = get_connection()
        try:
            row = conn.execute(
                "SELECT value FROM settings WHERE key = ?", (key,)
            ).fetchone()
            return row["value"] if row else default
        finally:
            conn.close()

    def set_setting(self, key: str, value: str) -> None:
        conn = get_connection()
        try:
            conn.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, str(value)),
            )
            conn.commit()
        finally:
            conn.close()

    def get_all_settings(self) -> dict:
        conn = get_connection()
        try:
            rows = conn.execute("SELECT key, value FROM settings").fetchall()
            return {r["key"]: r["value"] for r in rows}
        finally:
            conn.close()
