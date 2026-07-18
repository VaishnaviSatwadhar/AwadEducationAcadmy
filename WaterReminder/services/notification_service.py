"""
services/notification_service.py

Desktop notifications + sound playback for Smart Water Reminder.
Uses plyer for cross-platform notifications and pygame for sound.
"""
from __future__ import annotations
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"

NOTIFICATION_TITLE = "Time to Drink Water"
NOTIFICATION_MESSAGE = "Stay hydrated! Drink a glass of water."


class NotificationService:
    """Sends desktop notifications and plays sounds."""

    def __init__(self, sound_file: str = "notification.wav",
                 sound_enabled: bool = True):
        self.sound_file = sound_file
        self.sound_enabled = sound_enabled
        self._mixer_inited = False

    # ---------------- Notifications ----------------
    def notify(self, title: str = NOTIFICATION_TITLE,
               message: str = NOTIFICATION_MESSAGE,
               on_snooze=None) -> None:
        """Fire a desktop notification. Snooze handling is done by the scheduler."""
        try:
            from plyer import notification
            notification.notify(
                title=title,
                message=message,
                app_name="Smart Water Reminder",
                app_icon=self._icon_path(),
                timeout=10,
            )
            logger.info("Notification sent: %s", title)
        except Exception:
            # plyer can fail on some Linux setups without libnotify; not fatal.
            logger.warning("Desktop notification failed", exc_info=True)

    def _icon_path(self) -> str:
        icon = ASSETS_DIR / "icon.ico"
        return str(icon) if icon.exists() else ""

    # ---------------- Sound ----------------
    def play_sound(self) -> None:
        if not self.sound_enabled:
            return
        try:
            import pygame
            if not self._mixer_inited:
                pygame.mixer.init()
                self._mixer_inited = True
            sound_path = ASSETS_DIR / self.sound_file
            if sound_path.exists():
                pygame.mixer.Sound(str(sound_path)).play()
                logger.info("Played sound %s", self.sound_file)
            else:
                logger.warning("Sound file not found: %s", sound_path)
        except Exception:
            logger.warning("Sound playback failed", exc_info=True)

    def set_sound_file(self, filename: str) -> None:
        self.sound_file = filename

    def set_sound_enabled(self, enabled: bool) -> None:
        self.sound_enabled = enabled
