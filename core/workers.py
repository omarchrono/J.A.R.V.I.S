"""
J.A.R.V.I.S - Background Workers
System stats monitor and weather fetcher using Qt threads
"""

import requests
from PyQt6.QtCore import QThread, pyqtSignal, QTimer
from core.system_controller import SystemController


class StatsWorker(QThread):
    """Polls system stats every N seconds."""
    stats_ready = pyqtSignal(dict)

    def __init__(self, interval_ms=3000):
        super().__init__()
        self.interval = interval_ms
        self.controller = SystemController()
        self._running = True

    def run(self):
        while self._running:
            try:
                stats = self.controller.get_system_stats()
                self.stats_ready.emit(stats)
            except Exception as e:
                print(f"Stats error: {e}")
            self.msleep(self.interval)

    def stop(self):
        self._running = False
        self.quit()


class WeatherWorker(QThread):
    """Fetches weather data."""
    weather_ready = pyqtSignal(dict)
    weather_error = pyqtSignal(str)

    def __init__(self, city="Casablanca", interval_min=10):
        super().__init__()
        self.city = city
        self.interval_ms = interval_min * 60 * 1000
        self._running = True

    def run(self):
        while self._running:
            self._fetch()
            self.msleep(self.interval_ms)

    def _fetch(self):
        try:
            resp = requests.get(
                f"https://wttr.in/{self.city}?format=j1",
                timeout=8
            )
            data = resp.json()
            c = data["current_condition"][0]
            weather = {
                "temp_c": c["temp_C"],
                "feels_like": c["FeelsLikeC"],
                "desc": c["weatherDesc"][0]["value"],
                "humidity": c["humidity"],
                "wind_kmph": c["windspeedKmph"],
                "city": self.city,
                "hourly": [
                    {"time": h["time"], "temp": h["tempC"]}
                    for h in data["weather"][0]["hourly"][:6]
                ]
            }
            self.weather_ready.emit(weather)
        except requests.Timeout:
            self.weather_error.emit("Weather request timed out.")
        except Exception as e:
            self.weather_error.emit(f"Weather error: {e}")

    def stop(self):
        self._running = False
        self.quit()


class AIWorker(QThread):
    """Runs AI inference in background thread so UI doesn't freeze."""
    response_ready = pyqtSignal(str, int)   # (text, tokens)
    error_signal = pyqtSignal(str)

    def __init__(self, brain, message):
        super().__init__()
        self.brain = brain
        self.message = message

    def run(self):
        try:
            reply, tokens = self.brain.chat(self.message)
            self.response_ready.emit(reply, tokens)
        except Exception as e:
            self.error_signal.emit(str(e))
