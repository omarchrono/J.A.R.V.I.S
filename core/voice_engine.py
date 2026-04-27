"""
J.A.R.V.I.S - Voice Engine
Text-to-Speech and Speech-to-Text using pyttsx3 and SpeechRecognition
"""

import threading
import queue
from PyQt6.QtCore import QObject, pyqtSignal

try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

try:
    import speech_recognition as sr
    STT_AVAILABLE = True
except ImportError:
    STT_AVAILABLE = False


class VoiceEngine(QObject):
    # Signals
    speech_result = pyqtSignal(str)       # STT result
    speech_error = pyqtSignal(str)        # STT error
    speaking_started = pyqtSignal()
    speaking_finished = pyqtSignal()
    listening_started = pyqtSignal()
    listening_stopped = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.tts_enabled = True
        self.tts_engine = None
        self.tts_queue = queue.Queue()
        self.tts_thread = None
        self._speaking = False
        self._listening = False
        self._stop_listening = None

        if TTS_AVAILABLE:
            self._init_tts()

        if STT_AVAILABLE:
            self.recognizer = sr.Recognizer()
            self.recognizer.energy_threshold = 300
            self.recognizer.dynamic_energy_threshold = True
        else:
            self.recognizer = None

    def _init_tts(self):
        try:
            self.tts_engine = pyttsx3.init()
            # Set voice properties - deeper, more robotic for JARVIS feel
            self.tts_engine.setProperty("rate", 175)
            self.tts_engine.setProperty("volume", 0.9)
            # Try to find a male English voice
            voices = self.tts_engine.getProperty("voices")
            for v in voices:
                if "male" in v.name.lower() or "en" in v.id.lower():
                    self.tts_engine.setProperty("voice", v.id)
                    break
        except Exception as e:
            print(f"TTS init error: {e}")
            self.tts_engine = None

    def speak(self, text: str):
        """Speak text asynchronously."""
        if not self.tts_enabled or not self.tts_engine:
            return
        # Clean up text for speech
        clean = text.replace("*", "").replace("#", "").replace("`", "").replace("_", " ")
        clean = clean[:500]  # Limit length
        thread = threading.Thread(target=self._speak_worker, args=(clean,), daemon=True)
        thread.start()

    def _speak_worker(self, text: str):
        try:
            self._speaking = True
            self.speaking_started.emit()
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        except Exception as e:
            print(f"TTS error: {e}")
        finally:
            self._speaking = False
            self.speaking_finished.emit()

    def stop_speaking(self):
        if self.tts_engine and self._speaking:
            try:
                self.tts_engine.stop()
            except:
                pass

    def start_listening(self):
        """Start listening for voice input in background."""
        if not STT_AVAILABLE or self._listening:
            if not STT_AVAILABLE:
                self.speech_error.emit("SpeechRecognition not installed. Run: pip install SpeechRecognition pyaudio")
            return
        self._listening = True
        thread = threading.Thread(target=self._listen_worker, daemon=True)
        thread.start()

    def _listen_worker(self):
        self.listening_started.emit()
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=8, phrase_time_limit=10)

            text = self.recognizer.recognize_google(audio, language="en-US")
            self.speech_result.emit(text)
        except sr.WaitTimeoutError:
            self.speech_error.emit("No speech detected. Try again.")
        except sr.UnknownValueError:
            self.speech_error.emit("Could not understand audio. Speak clearly.")
        except sr.RequestError as e:
            self.speech_error.emit(f"Speech service error: {e}")
        except OSError as e:
            self.speech_error.emit(f"Microphone error: {e}. Check mic connection.")
        except Exception as e:
            self.speech_error.emit(f"Voice error: {e}")
        finally:
            self._listening = False
            self.listening_stopped.emit()

    @property
    def tts_available(self):
        return TTS_AVAILABLE and self.tts_engine is not None

    @property
    def stt_available(self):
        return STT_AVAILABLE and self.recognizer is not None

    @property
    def is_speaking(self):
        return self._speaking

    @property
    def is_listening(self):
        return self._listening
