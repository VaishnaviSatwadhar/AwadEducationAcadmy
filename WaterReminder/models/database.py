"""
models/database.py

SQLite database connection and schema management for Smart Water Reminder.
Creates all required tables on first run and provides a thin connection helper.
"""
import os
import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Resolve the database path relative to the project root.
# Works both in dev and in a PyInstaller bundle (via _MEIPASS fallback).
BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BASE_DIR / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "water.db"


def get_connection() -> sqlite3.Connection:
    """Return a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    """Create all tables if they do not already exist."""
    conn = get_connection()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                name            TEXT,
                age             INTEGER,
                gender          TEXT,
                weight          REAL,
                height          REAL,
                activity_level  TEXT,
                wake_up_time    TEXT,
                sleep_time      TEXT,
                daily_goal      INTEGER DEFAULT 2500,
                auto_goal       INTEGER DEFAULT 1,
                created_at      TEXT DEFAULT (datetime('now','localtime'))
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS reminders (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                time            TEXT NOT NULL,          -- HH:MM
                interval_minutes INTEGER,               -- NULL for one-shot, else custom interval
                enabled         INTEGER DEFAULT 1,
                repeat_daily    INTEGER DEFAULT 1,
                label           TEXT,
                sound_enabled   INTEGER DEFAULT 1,
                voice_enabled   INTEGER DEFAULT 0,
                created_at      TEXT DEFAULT (datetime('now','localtime'))
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS water_logs (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                amount_ml   INTEGER NOT NULL,
                log_date    TEXT NOT NULL,             -- YYYY-MM-DD
                log_time    TEXT NOT NULL,             -- HH:MM:SS
                created_at  TEXT DEFAULT (datetime('now','localtime'))
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key   TEXT PRIMARY KEY,
                value TEXT
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS achievements (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT UNIQUE,
                description TEXT,
                unlocked_at TEXT
            );
            """
        )

        # Seed default settings
        defaults = {
            "theme": "dark",
            "accent": "blue",
            "sound_file": "notification.wav",
            "sound_enabled": "1",
            "voice_enabled": "0",
            "start_on_startup": "0",
            "minimize_to_tray": "1",
            "snooze_minutes": "5",
        }
        for k, v in defaults.items():
            cur.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (k, v),
            )

        conn.commit()
        logger.info("Database initialized at %s", DB_PATH)
    except Exception:
        conn.rollback()
        logger.exception("Failed to initialize database")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
    print(f"Database ready at {DB_PATH}")
