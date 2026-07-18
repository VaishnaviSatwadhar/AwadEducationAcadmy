"""
services/voice_service.py

Optional Text-to-Speech voice reminders using pyttsx3.
"""
from __future__ import annotations
import logging
import threading

logger = logging.getLogger(__name__)

DEFAULT_PHRASE = "Time to drink water. Stay hydrated! Drink a glass of water."


class VoiceService:
    """Speaks reminders aloud using pyttsx3 (runs off the main thread)."""

    def __init__(self, enabled: bool = False, rate: int = 150):
        self.enabled = enabled
        self.rate = rate
        self._engine = None

    def _ensure_engine(self):
        if self._engine is None:
            import pyttsx3
            self._engine = pyttsx3.init()
            self._engine.setProperty("rate", self.rate)
        return self._engine

    def speak(self, phrase: str = DEFAULT_PHRASE) -> None:
        if not self.enabled:
            return
        # pyttsx3 must run in its own thread to avoid blocking the UI.
        threading.Thread(target=self._speak_sync, args=(phrase,), daemon=True).start()

    def _speak_sync(self, phrase: str) -> None:
        try:
            engine = self._ensure_engine()
            engine.say(phrase)
            engine.runAndWait()
            logger.info("Voice reminder spoken")
        except Exception:
            logger.warning("Voice reminder failed", exc_info=True)

    def set_enabled(self, enabled: bool) -> None:
        self.enabled = enabled
