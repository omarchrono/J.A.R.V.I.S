"""
J.A.R.V.I.S - Main Window
Complete PyQt6 JARVIS interface with all panels
"""

import os
import subprocess
from datetime import datetime
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QLineEdit, QTextEdit, QFrame,
    QScrollArea, QSplitter, QComboBox, QTabWidget,
    QFileDialog, QMessageBox, QSizePolicy, QSlider,
    QApplication, QGridLayout
)
from PyQt6.QtCore import (
    Qt, QTimer, QThread, pyqtSignal, QSize
)
from PyQt6.QtGui import (
    QFont, QColor, QPalette, QIcon, QKeyEvent
)

from gui.widgets import OrbWidget, StatBar, ChatBubble, TypingIndicator
from core.ai_brain import AIBrain
from core.system_controller import SystemController
from core.voice_engine import VoiceEngine
from core.workers import StatsWorker, WeatherWorker, AIWorker


# ── Stylesheet ────────────────────────────────────────────────────────────────

STYLESHEET = """
QMainWindow, QWidget {
    background-color: #020b14;
    color: #c8e8f8;
    font-family: 'Courier New', monospace;
}

QLabel {
    color: #c8e8f8;
    background: transparent;
}

QLineEdit, QTextEdit {
    background: rgba(0, 212, 255, 10);
    border: 1px solid rgba(0, 212, 255, 60);
    border-radius: 3px;
    color: #c8e8f8;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    padding: 5px 8px;
    selection-background-color: rgba(0, 212, 255, 80);
}

QLineEdit:focus, QTextEdit:focus {
    border: 1px solid rgba(0, 212, 255, 150);
    background: rgba(0, 212, 255, 18);
}

QPushButton {
    background: rgba(0, 212, 255, 12);
    border: 1px solid rgba(0, 212, 255, 80);
    border-radius: 3px;
    color: #00d4ff;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 6px 14px;
}

QPushButton:hover {
    background: rgba(0, 212, 255, 28);
    border-color: rgba(0, 212, 255, 160);
}

QPushButton:pressed {
    background: rgba(0, 212, 255, 50);
}

QPushButton#mic_btn.listening {
    background: rgba(255, 68, 85, 25);
    border-color: #ff4455;
    color: #ff4455;
}

QPushButton#connect_btn.connected {
    background: rgba(0, 255, 136, 15);
    border-color: #00ff88;
    color: #00ff88;
}

QComboBox {
    background: rgba(0, 212, 255, 10);
    border: 1px solid rgba(0, 212, 255, 60);
    border-radius: 3px;
    color: #c8e8f8;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    padding: 4px 8px;
}

QComboBox::drop-down {
    border: none;
    width: 16px;
}

QComboBox QAbstractItemView {
    background: #040f1a;
    border: 1px solid rgba(0, 212, 255, 80);
    color: #c8e8f8;
    selection-background-color: rgba(0, 212, 255, 50);
}

QScrollArea, QScrollBar {
    background: transparent;
    border: none;
}

QScrollBar:vertical {
    width: 4px;
    background: rgba(0, 212, 255, 10);
}

QScrollBar::handle:vertical {
    background: rgba(0, 212, 255, 80);
    border-radius: 2px;
    min-height: 20px;
}

QSplitter::handle {
    background: rgba(0, 212, 255, 30);
    width: 1px;
}

QTabWidget::pane {
    border: 1px solid rgba(0, 212, 255, 50);
    background: rgba(0, 15, 30, 200);
}

QTabBar::tab {
    background: rgba(0, 212, 255, 8);
    border: 1px solid rgba(0, 212, 255, 40);
    color: rgba(0, 212, 255, 120);
    font-family: 'Courier New', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    padding: 5px 14px;
}

QTabBar::tab:selected {
    background: rgba(0, 212, 255, 20);
    border-bottom: 2px solid #00d4ff;
    color: #00d4ff;
}

QSlider::groove:horizontal {
    height: 3px;
    background: rgba(0, 212, 255, 30);
    border-radius: 1px;
}

QSlider::handle:horizontal {
    background: #00d4ff;
    width: 10px;
    height: 10px;
    margin: -4px 0;
    border-radius: 5px;
}

QSlider::sub-page:horizontal {
    background: rgba(0, 212, 255, 150);
    border-radius: 1px;
}

QFrame#panel {
    border: 1px solid rgba(0, 212, 255, 50);
    border-radius: 4px;
    background: rgba(0, 20, 40, 200);
}

QLabel#panel_title {
    color: rgba(0, 212, 255, 150);
    font-size: 9px;
    letter-spacing: 3px;
    font-weight: bold;
}

QLabel#header_logo {
    color: #00d4ff;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 8px;
}

QLabel#clock {
    color: #00d4ff;
    font-size: 14px;
    letter-spacing: 3px;
}
"""


def make_panel(title: str = None) -> tuple[QFrame, QVBoxLayout]:
    """Create a styled panel box."""
    frame = QFrame()
    frame.setObjectName("panel")
    layout = QVBoxLayout(frame)
    layout.setContentsMargins(10, 8, 10, 10)
    layout.setSpacing(5)
    if title:
        lbl = QLabel(f"◈  {title}")
        lbl.setObjectName("panel_title")
        lbl.setFont(QFont("Courier New", 8, QFont.Weight.Bold))
        layout.addWidget(lbl)
    return frame, layout


# ── Main Window ───────────────────────────────────────────────────────────────

class JarvisWindow(QMainWindow):

    def __init__(self):
        super().__init__()
        self.setWindowTitle("J.A.R.V.I.S  –  AI Desktop Assistant")
        self.setMinimumSize(1200, 750)
        self.resize(1350, 820)
        self.setStyleSheet(STYLESHEET)

        # Core components
        self.brain = AIBrain()
        self.system = SystemController()
        self.voice = VoiceEngine()
        self._ai_worker = None
        self._typing_indicator = None

        self._build_ui()
        self._connect_signals()
        self._start_workers()

        # Clock
        self.clock_timer = QTimer(self)
        self.clock_timer.timeout.connect(self._update_clock)
        self.clock_timer.start(1000)
        self._update_clock()

        # Volume init
        vol = self.system.get_volume()
        self.vol_slider.setValue(vol)
        self.vol_label.setText(f"VOL  {vol}%")

        self._log("System boot complete")
        self._log("J.A.R.V.I.S v1.0 online")

    # ── UI Construction ───────────────────────────────────────────────────────

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(8, 8, 8, 8)
        root.setSpacing(6)

        # Header
        root.addWidget(self._build_header())

        # Main area
        main_split = QHBoxLayout()
        main_split.setSpacing(6)
        main_split.addWidget(self._build_left_panel(), 0)
        main_split.addWidget(self._build_center_panel(), 1)
        main_split.addWidget(self._build_right_panel(), 0)
        root.addLayout(main_split, 1)

        # Footer
        root.addWidget(self._build_footer())

    def _build_header(self) -> QFrame:
        frame, layout = make_panel()
        layout.setContentsMargins(12, 6, 12, 6)
        h = QHBoxLayout()
        h.setSpacing(16)

        logo = QLabel("J.A.R.V.I.S")
        logo.setObjectName("header_logo")
        logo.setFont(QFont("Courier New", 18, QFont.Weight.Bold))
        h.addWidget(logo)

        h.addSpacing(10)

        # Status dot
        self.status_lbl = QLabel("● STANDBY")
        self.status_lbl.setFont(QFont("Courier New", 9))
        self.status_lbl.setStyleSheet("color: #ffaa00;")
        h.addWidget(self.status_lbl)

        h.addStretch()

        # API connection row
        self.api_input = QLineEdit()
        self.api_input.setPlaceholderText("Groq API key (gsk_...)")
        self.api_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.api_input.setFixedWidth(220)
        self.api_input.setFixedHeight(28)
        h.addWidget(self.api_input)

        self.model_combo = QComboBox()
        self.model_combo.addItems([
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ])
        self.model_combo.setFixedWidth(160)
        self.model_combo.setFixedHeight(28)
        h.addWidget(self.model_combo)

        self.connect_btn = QPushButton("CONNECT AI")
        self.connect_btn.setObjectName("connect_btn")
        self.connect_btn.setFixedHeight(28)
        self.connect_btn.clicked.connect(self._connect_ai)
        h.addWidget(self.connect_btn)

        h.addStretch()

        self.clock_lbl = QLabel("--:--:--")
        self.clock_lbl.setObjectName("clock")
        self.clock_lbl.setFont(QFont("Courier New", 13, QFont.Weight.Bold))
        h.addWidget(self.clock_lbl)

        layout.addLayout(h)
        return frame

    def _build_left_panel(self) -> QWidget:
        container = QWidget()
        container.setFixedWidth(210)
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        # System stats
        p, pl = make_panel("SYSTEM METRICS")
        self.cpu_bar = StatBar("CPU")
        self.ram_bar = StatBar("RAM")
        self.disk_bar = StatBar("DISK")
        self.temp_bar = StatBar("TEMP")
        pl.addWidget(self.cpu_bar)
        pl.addWidget(self.ram_bar)
        pl.addWidget(self.disk_bar)
        pl.addWidget(self.temp_bar)
        layout.addWidget(p)

        # Volume / Brightness
        p2, pl2 = make_panel("AUDIO CONTROL")
        self.vol_label = QLabel("VOL  50%")
        self.vol_label.setFont(QFont("Courier New", 9))
        self.vol_label.setStyleSheet("color: rgba(0,212,255,160);")
        pl2.addWidget(self.vol_label)
        self.vol_slider = QSlider(Qt.Orientation.Horizontal)
        self.vol_slider.setRange(0, 100)
        self.vol_slider.setValue(50)
        self.vol_slider.valueChanged.connect(self._on_volume_change)
        pl2.addWidget(self.vol_slider)
        layout.addWidget(p2)

        # Connectivity
        p3, pl3 = make_panel("CONNECTIVITY")
        self.conn_labels = {}
        for key, val, col in [
            ("NETWORK", "ACTIVE", "#00ff88"),
            ("AI CORE", "OFFLINE", "#555"),
            ("VOICE TTS", "READY", "#555"),
            ("VOICE STT", "READY", "#555"),
        ]:
            row = QHBoxLayout()
            row.addWidget(QLabel(key))
            v = QLabel(val)
            v.setFont(QFont("Courier New", 8))
            v.setAlignment(Qt.AlignmentFlag.AlignRight)
            v.setStyleSheet(f"color: {col};")
            self.conn_labels[key] = v
            row.addWidget(v)
            pl3.addLayout(row)
        layout.addWidget(p3)

        # Weather
        p4, pl4 = make_panel("WEATHER // CASABLANCA")
        self.weather_temp = QLabel("--°C")
        self.weather_temp.setFont(QFont("Courier New", 22, QFont.Weight.Bold))
        self.weather_temp.setStyleSheet("color: #00d4ff;")
        self.weather_temp.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.weather_desc = QLabel("Loading...")
        self.weather_desc.setFont(QFont("Courier New", 9))
        self.weather_desc.setStyleSheet("color: rgba(0,212,255,100);")
        self.weather_desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.weather_details = QLabel("")
        self.weather_details.setFont(QFont("Courier New", 8))
        self.weather_details.setStyleSheet("color: rgba(0,212,255,80);")
        self.weather_details.setAlignment(Qt.AlignmentFlag.AlignCenter)
        pl4.addWidget(self.weather_temp)
        pl4.addWidget(self.weather_desc)
        pl4.addWidget(self.weather_details)
        layout.addWidget(p4)

        layout.addStretch()
        return container

    def _build_center_panel(self) -> QWidget:
        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        # Orb + tabs (top)
        top = QHBoxLayout()
        top.setSpacing(6)

        # Orb
        orb_frame, orb_layout = make_panel()
        self.orb = OrbWidget()
        self.orb.setMinimumHeight(200)
        orb_layout.addWidget(self.orb)
        top.addWidget(orb_frame, 0)

        # Right of orb: quick actions + command tab
        tabs_frame, tabs_layout = make_panel("COMMAND CENTER")
        self.tabs = QTabWidget()
        self.tabs.addTab(self._build_quick_tab(), "ACTIONS")
        self.tabs.addTab(self._build_terminal_tab(), "TERMINAL")
        self.tabs.addTab(self._build_notes_tab(), "NOTES")
        tabs_layout.addWidget(self.tabs)
        top.addWidget(tabs_frame, 1)

        layout.addLayout(top, 1)

        # Chat area
        chat_frame, chat_layout = make_panel("NEURAL COMM CHANNEL")
        self.chat_scroll = QScrollArea()
        self.chat_scroll.setWidgetResizable(True)
        self.chat_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.chat_inner = QWidget()
        self.chat_inner_layout = QVBoxLayout(self.chat_inner)
        self.chat_inner_layout.setContentsMargins(4, 4, 4, 4)
        self.chat_inner_layout.setSpacing(6)
        self.chat_inner_layout.addStretch()
        self.chat_scroll.setWidget(self.chat_inner)
        chat_layout.addWidget(self.chat_scroll, 1)

        # Input row
        input_row = QHBoxLayout()
        self.mic_btn = QPushButton("🎤")
        self.mic_btn.setObjectName("mic_btn")
        self.mic_btn.setFixedSize(36, 36)
        self.mic_btn.setToolTip("Voice Input")
        self.mic_btn.clicked.connect(self._toggle_mic)
        self.chat_input = QLineEdit()
        self.chat_input.setPlaceholderText("Enter command or query...")
        self.chat_input.setFixedHeight(36)
        self.chat_input.returnPressed.connect(self._send_message)
        send_btn = QPushButton("SEND")
        send_btn.setFixedHeight(36)
        send_btn.clicked.connect(self._send_message)
        tts_btn = QPushButton("TTS ON")
        tts_btn.setFixedHeight(36)
        tts_btn.setCheckable(True)
        tts_btn.setChecked(True)
        tts_btn.toggled.connect(lambda v: self._toggle_tts(v, tts_btn))
        input_row.addWidget(self.mic_btn)
        input_row.addWidget(self.chat_input, 1)
        input_row.addWidget(send_btn)
        input_row.addWidget(tts_btn)
        chat_layout.addLayout(input_row)
        layout.addWidget(chat_frame, 2)

        # Initial welcome message
        self._add_ai_message(
            "Good day, Sir. I am J.A.R.V.I.S — Just A Rather Very Intelligent System. "
            "Connect your groq API key in the header to activate the AI core. "
            "I support voice commands, system control, file management, and natural conversation. "
            "How may I assist you today?"
        )

        return container

    def _build_quick_tab(self) -> QWidget:
        w = QWidget()
        layout = QGridLayout(w)
        layout.setSpacing(5)
        layout.setContentsMargins(5, 5, 5, 5)

        actions = [
            ("⬡ CAPABILITIES", "What can you do? List your main features."),
            ("⬡ SYSTEM REPORT", "Give me a full system health report."),
            ("⬡ WEATHER BRIEF", "What's the weather like in Casablanca right now?"),
            ("⬡ GAME SUGGEST", "Suggest 5 lightweight free games for Linux Mint on a weak PC."),
            ("⬡ LINUX TIPS", "Give me 3 useful Linux Mint terminal tips."),
            ("⬡ GRUB HELP", "How do I fix GRUB bootloader issues on Linux Mint?"),
            ("⬡ CODE HELPER", "Help me write a Python script to monitor system resources."),
            ("⬡ DISK CLEANUP", "How do I free up disk space on Linux Mint?"),
            ("⬡ JOKE", "Tell me a good tech joke."),
            ("⬡ CLEAR CHAT", "__clear__"),
        ]

        for i, (label, action) in enumerate(actions):
            btn = QPushButton(label)
            btn.setFixedHeight(28)
            btn.setFont(QFont("Courier New", 8))
            if action == "__clear__":
                btn.clicked.connect(self._clear_chat)
            else:
                btn.clicked.connect(lambda _, a=action: self._send_quick(a))
            layout.addWidget(btn, i // 2, i % 2)

        return w

    def _build_terminal_tab(self) -> QWidget:
        w = QWidget()
        layout = QVBoxLayout(w)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)

        self.terminal_output = QTextEdit()
        self.terminal_output.setReadOnly(True)
        self.terminal_output.setFont(QFont("Courier New", 9))
        self.terminal_output.setStyleSheet("background: rgba(0,5,10,200); color: #00ff88;")
        layout.addWidget(self.terminal_output, 1)

        cmd_row = QHBoxLayout()
        self.term_input = QLineEdit()
        self.term_input.setPlaceholderText("Enter shell command...")
        self.term_input.setFixedHeight(30)
        self.term_input.returnPressed.connect(self._run_command)
        run_btn = QPushButton("RUN")
        run_btn.setFixedHeight(30)
        run_btn.clicked.connect(self._run_command)
        cmd_row.addWidget(QLabel("$"))
        cmd_row.addWidget(self.term_input, 1)
        cmd_row.addWidget(run_btn)
        layout.addLayout(cmd_row)

        self._term_print("J.A.R.V.I.S Terminal Interface — Linux Mint")
        self._term_print("Type commands and press RUN or Enter.")
        self._term_print("-" * 45)
        return w

    def _build_notes_tab(self) -> QWidget:
        w = QWidget()
        layout = QVBoxLayout(w)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)

        self.notes_display = QTextEdit()
        self.notes_display.setReadOnly(True)
        self.notes_display.setFont(QFont("Courier New", 9))
        layout.addWidget(self.notes_display, 1)

        self.note_input = QTextEdit()
        self.note_input.setPlaceholderText("Type your note...")
        self.note_input.setMaximumHeight(60)
        self.note_input.setFont(QFont("Courier New", 9))
        layout.addWidget(self.note_input)

        btns = QHBoxLayout()
        save_btn = QPushButton("SAVE NOTE")
        save_btn.clicked.connect(self._save_note)
        refresh_btn = QPushButton("REFRESH")
        refresh_btn.clicked.connect(self._load_notes)
        btns.addWidget(save_btn)
        btns.addWidget(refresh_btn)
        layout.addLayout(btns)

        self._load_notes()
        return w

    def _build_right_panel(self) -> QWidget:
        container = QWidget()
        container.setFixedWidth(200)
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        # Activity log
        p, pl = make_panel("ACTIVITY LOG")
        self.log_display = QTextEdit()
        self.log_display.setReadOnly(True)
        self.log_display.setFont(QFont("Courier New", 8))
        self.log_display.setStyleSheet("color: rgba(0,212,255,150);")
        self.log_display.setMaximumHeight(120)
        pl.addWidget(self.log_display)
        layout.addWidget(p)

        # AI stats
        p2, pl2 = make_panel("AI STATS")
        self._stat_labels = {}
        for key in ["MODEL", "MESSAGES", "TOKENS", "LATENCY"]:
            row = QHBoxLayout()
            row.addWidget(QLabel(key))
            v = QLabel("--")
            v.setAlignment(Qt.AlignmentFlag.AlignRight)
            v.setFont(QFont("Courier New", 9))
            v.setStyleSheet("color: #00d4ff;")
            self._stat_labels[key] = v
            row.addWidget(v)
            pl2.addLayout(row)
        layout.addWidget(p2)

        # App launcher
        p3, pl3 = make_panel("APP LAUNCHER")
        for app_name, cmd in [
            ("🌐 Firefox", "firefox"),
            ("📁 Files", "files"),
            ("⌨ Terminal", "terminal"),
            ("🎵 VLC", "vlc"),
            ("💻 VS Code", "vscode"),
            ("🎮 Steam", "steam"),
        ]:
            btn = QPushButton(app_name)
            btn.setFixedHeight(25)
            btn.setFont(QFont("Courier New", 8))
            btn.clicked.connect(lambda _, a=cmd: self._launch_app(a))
            pl3.addWidget(btn)
        layout.addWidget(p3)

        # File manager shortcut
        p4, pl4 = make_panel("FILE TOOLS")
        open_file_btn = QPushButton("OPEN FILE")
        open_file_btn.clicked.connect(self._open_file_dialog)
        save_conv_btn = QPushButton("SAVE CHAT")
        save_conv_btn.clicked.connect(self._save_conversation)
        pl4.addWidget(open_file_btn)
        pl4.addWidget(save_conv_btn)
        layout.addWidget(p4)

        layout.addStretch()
        return container

    def _build_footer(self) -> QFrame:
        frame, layout = make_panel()
        layout.setContentsMargins(8, 4, 8, 4)
        h = QHBoxLayout()

        for label, url in [
            ("↗ YOUTUBE", "https://youtube.com"),
            ("↗ GITHUB", "https://github.com"),
            ("↗ GROQ CONSOLE", "https://console.groq.com"),
            ("↗ LINUX MINT", "https://linuxmint.com"),
        ]:
            btn = QPushButton(label)
            btn.setFixedHeight(24)
            btn.setFont(QFont("Courier New", 8))
            btn.clicked.connect(lambda _, u=url: self.system.open_url(u))
            h.addWidget(btn)

        h.addStretch()

        web_row = QHBoxLayout()
        self.web_input = QLineEdit()
        self.web_input.setPlaceholderText("Search or URL...")
        self.web_input.setFixedHeight(24)
        self.web_input.setFixedWidth(250)
        self.web_input.returnPressed.connect(self._web_search)
        web_btn = QPushButton("SEARCH")
        web_btn.setFixedHeight(24)
        web_btn.clicked.connect(self._web_search)
        web_row.addWidget(self.web_input)
        web_row.addWidget(web_btn)
        h.addLayout(web_row)

        layout.addLayout(h)
        return frame

    # ── Signal Connections ─────────────────────────────────────────────────────

    def _connect_signals(self):
        self.voice.speech_result.connect(self._on_voice_result)
        self.voice.speech_error.connect(self._on_voice_error)
        self.voice.listening_started.connect(lambda: self.orb.set_state("listening"))
        self.voice.listening_stopped.connect(lambda: self.orb.set_state("ready" if self.brain.is_connected() else "standby"))
        self.voice.speaking_started.connect(lambda: self._conn_set("VOICE TTS", "SPEAKING", "#00d4ff"))
        self.voice.speaking_finished.connect(lambda: self._conn_set("VOICE TTS", "READY", "#00ff88"))

    def _start_workers(self):
        self.stats_worker = StatsWorker(interval_ms=3000)
        self.stats_worker.stats_ready.connect(self._on_stats)
        self.stats_worker.start()

        self.weather_worker = WeatherWorker(city="Casablanca", interval_min=10)
        self.weather_worker.weather_ready.connect(self._on_weather)
        self.weather_worker.weather_error.connect(lambda e: self._log(f"Weather: {e}"))
        self.weather_worker.start()

    # ── Actions ────────────────────────────────────────────────────────────────

    def _connect_ai(self):
        key = self.api_input.text().strip()
        if not key:
            self._add_ai_message("Please enter your Groq API key in the field above.")
            return
        model = self.model_combo.currentText()
        self._add_ai_message("Establishing neural link...")
        self.orb.set_state("thinking")

        def _do_connect():
            ok, msg = self.brain.connect(key, model)
            if ok:
                self.connect_btn.setText("✓ ONLINE")
                self.connect_btn.setProperty("class", "connected")
                self.connect_btn.setStyleSheet("background: rgba(0,255,136,15); border-color: #00ff88; color: #00ff88;")
                self._conn_set("AI CORE", "ONLINE", "#00ff88")
                self.status_lbl.setText("● ONLINE")
                self.status_lbl.setStyleSheet("color: #00ff88;")
                self._stat_labels["MODEL"].setText(model.split("-")[0].upper())
                self.orb.set_state("ready")
                self.orb.set_status_text("ACTIVE")
                self._log("AI core connected")
                self._add_ai_message(f"Neural link established. J.A.R.V.I.S fully operational, Omar. Model: {model}. All systems nominal.")
                if self.voice.tts_available:
                    self.voice.speak("Neural link established. J.A.R.V.I.S fully operational.")
                self._conn_set("VOICE TTS", "READY" if self.voice.tts_available else "N/A",
                               "#00ff88" if self.voice.tts_available else "#555")
                self._conn_set("VOICE STT", "READY" if self.voice.stt_available else "N/A",
                               "#00ff88" if self.voice.stt_available else "#555")
            else:
                self.orb.set_state("standby")
                self._add_ai_message(f"Connection failed: {msg}")
                self._log("AI connection failed")

        # Run in thread to avoid freezing
        import threading
        threading.Thread(target=_do_connect, daemon=True).start()

    def _send_message(self):
        text = self.chat_input.text().strip()
        if not text:
            return
        self.chat_input.clear()
        self._process_input(text)

    def _send_quick(self, text: str):
        self._process_input(text)

    def _process_input(self, text: str):
        self._add_user_message(text)
        self._log(f"Q: {text[:30]}...")

        # Check for local commands first
        if self._handle_local_command(text):
            return

        if not self.brain.is_connected():
            self._add_ai_message("AI core offline. Please connect your Groq API key.")
            return

        # Show typing
        self._show_typing()
        self.orb.set_state("thinking")
        self._t0 = datetime.now()

        self._ai_worker = AIWorker(self.brain, text)
        self._ai_worker.response_ready.connect(self._on_ai_response)
        self._ai_worker.error_signal.connect(self._on_ai_error)
        self._ai_worker.start()

    def _handle_local_command(self, text: str) -> bool:
        """Handle system commands locally without AI. Returns True if handled."""
        t = text.lower().strip()

        if t.startswith("open "):
            app = text[5:].strip()
            result = self.system.open_app(app)
            self._add_ai_message(result)
            return True

        if "volume" in t:
            import re
            m = re.search(r'(\d+)', t)
            if m:
                vol = int(m.group(1))
                result = self.system.set_volume(vol)
                self.vol_slider.setValue(vol)
                self.vol_label.setText(f"VOL  {vol}%")
                self._add_ai_message(result)
                return True

        if t.startswith("search ") or t.startswith("google "):
            query = text.split(" ", 1)[1]
            result = self.system.web_search(query)
            self._add_ai_message(result)
            return True

        if t.startswith("go to ") or t.startswith("open https") or t.startswith("open http"):
            url = text.split(" ", 1)[-1] if " " in text else text
            result = self.system.open_url(url)
            self._add_ai_message(result)
            return True

        if "mute" in t:
            result = self.system.mute_toggle()
            self._add_ai_message(result)
            return True

        return False

    def _on_ai_response(self, reply: str, tokens: int):
        self._hide_typing()
        self.orb.set_state("ready")
        latency = (datetime.now() - self._t0).total_seconds()
        self._add_ai_message(reply)
        self._stat_labels["MESSAGES"].setText(str(self.brain.message_count))
        self._stat_labels["TOKENS"].setText(str(self.brain.total_tokens))
        self._stat_labels["LATENCY"].setText(f"{int(latency*1000)}ms")
        self._log(f"Response {int(latency*1000)}ms")
        if self.voice.tts_enabled:
            self.voice.speak(reply)

    def _on_ai_error(self, error: str):
        self._hide_typing()
        self.orb.set_state("ready")
        self._add_ai_message(f"Error: {error}")

    def _toggle_mic(self):
        if self.voice.is_listening:
            return
        if not self.voice.stt_available:
            self._add_ai_message("Speech recognition not available. Install: pip install SpeechRecognition pyaudio")
            return
        self.mic_btn.setStyleSheet("background: rgba(255,68,85,25); border-color: #ff4455; color: #ff4455;")
        self._conn_set("VOICE STT", "LISTENING", "#ff4455")
        self.voice.start_listening()

    def _on_voice_result(self, text: str):
        self.mic_btn.setStyleSheet("")
        self._conn_set("VOICE STT", "READY", "#00ff88")
        self.chat_input.setText(text)
        self._process_input(text)

    def _on_voice_error(self, error: str):
        self.mic_btn.setStyleSheet("")
        self._conn_set("VOICE STT", "READY", "#555")
        self._add_ai_message(f"Voice: {error}")

    def _toggle_tts(self, enabled: bool, btn: QPushButton):
        self.voice.tts_enabled = enabled
        btn.setText("TTS ON" if enabled else "TTS OFF")

    def _run_command(self):
        cmd = self.term_input.text().strip()
        if not cmd:
            return
        self._term_print(f"$ {cmd}")
        result = self.system.run_terminal_command(cmd)
        self._term_print(result)
        self.term_input.clear()
        self._log(f"CMD: {cmd[:25]}")

    def _launch_app(self, app: str):
        result = self.system.open_app(app)
        self._log(result)
        self._add_ai_message(result)

    def _web_search(self):
        q = self.web_input.text().strip()
        if not q:
            return
        if q.startswith("http"):
            self.system.open_url(q)
        else:
            self.system.web_search(q)
        self.web_input.clear()

    def _on_volume_change(self, val: int):
        self.vol_label.setText(f"VOL  {val}%")
        self.system.set_volume(val)

    def _save_note(self):
        text = self.note_input.toPlainText().strip()
        if not text:
            return
        result = self.system.add_note(text)
        self._log(result)
        self.note_input.clear()
        self._load_notes()

    def _load_notes(self):
        notes = self.system.get_notes()
        if not notes:
            self.notes_display.setPlainText("No notes yet.")
            return
        lines = []
        for n in reversed(notes[-20:]):
            t = datetime.fromisoformat(n["time"]).strftime("%m/%d %H:%M")
            lines.append(f"[{n['id']}] {t}\n{n['text']}\n{'-'*30}")
        self.notes_display.setPlainText("\n".join(lines))

    def _open_file_dialog(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open File", str(os.path.expanduser("~")))
        if path:
            content = self.system.read_file(path)
            self._add_user_message(f"[Opened file: {path}]")
            self._add_ai_message(f"File contents of {os.path.basename(path)}:\n\n{content[:1500]}")

    def _save_conversation(self):
        path, _ = QFileDialog.getSaveFileName(self, "Save Conversation", "jarvis_chat.json", "JSON (*.json)")
        if path:
            self.brain.save_conversation(path)
            self._add_ai_message(f"Conversation saved to: {path}")

    def _clear_chat(self):
        # Clear all chat bubbles
        while self.chat_inner_layout.count() > 1:
            item = self.chat_inner_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        self.brain.clear_history()
        self._add_ai_message("Memory cleared. Fresh session initialized, Omar.")
        self._log("Chat cleared")

    # ── Chat UI ────────────────────────────────────────────────────────────────

    def _add_user_message(self, text: str):
        bubble = ChatBubble("user", text)
        self.chat_inner_layout.insertWidget(self.chat_inner_layout.count() - 1, bubble)
        QTimer.singleShot(50, self._scroll_to_bottom)

    def _add_ai_message(self, text: str):
        bubble = ChatBubble("ai", text)
        self.chat_inner_layout.insertWidget(self.chat_inner_layout.count() - 1, bubble)
        QTimer.singleShot(50, self._scroll_to_bottom)

    def _show_typing(self):
        self._typing_indicator = TypingIndicator()
        self.chat_inner_layout.insertWidget(self.chat_inner_layout.count() - 1, self._typing_indicator)
        QTimer.singleShot(50, self._scroll_to_bottom)

    def _hide_typing(self):
        if self._typing_indicator:
            self._typing_indicator.deleteLater()
            self._typing_indicator = None

    def _scroll_to_bottom(self):
        sb = self.chat_scroll.verticalScrollBar()
        sb.setValue(sb.maximum())

    # ── Stats / Weather Updates ────────────────────────────────────────────────

    def _on_stats(self, stats: dict):
        self.cpu_bar.set_value(stats["cpu_percent"], f"{stats['cpu_percent']}%")
        self.ram_bar.set_value(stats["ram_percent"], f"{stats['ram_used_gb']}G/{stats['ram_total_gb']}G")
        self.disk_bar.set_value(stats["disk_percent"], f"{stats['disk_used_gb']}G")
        temps = stats.get("temps", {})
        if temps:
            t = list(temps.values())[0]
            self.temp_bar.set_value(min(t, 100), f"{t:.0f}°C")
        else:
            self.temp_bar.set_value(0, "N/A")

    def _on_weather(self, w: dict):
        self.weather_temp.setText(f"{w['temp_c']}°C")
        self.weather_desc.setText(w["desc"].upper())
        self.weather_details.setText(f"Feels {w['feels_like']}°C  ·  💧{w['humidity']}%  ·  💨{w['wind_kmph']}km/h")

    # ── Utilities ──────────────────────────────────────────────────────────────

    def _log(self, msg: str):
        t = datetime.now().strftime("%H:%M:%S")
        self.log_display.append(f"[{t}] {msg}")

    def _term_print(self, text: str):
        self.terminal_output.append(text)

    def _conn_set(self, key: str, value: str, color: str):
        if key in self.conn_labels:
            self.conn_labels[key].setText(value)
            self.conn_labels[key].setStyleSheet(f"color: {color};")

    def _update_clock(self):
        self.clock_lbl.setText(datetime.now().strftime("%H:%M:%S"))

    def closeEvent(self, event):
        self.stats_worker.stop()
        self.weather_worker.stop()
        self.voice.stop_speaking()
        event.accept()
