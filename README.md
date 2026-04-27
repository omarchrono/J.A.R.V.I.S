# J.A.R.V.I.S — AI Desktop Assistant
### Just A Rather Very Intelligent System

A full Python desktop AI assistant with a futuristic JARVIS-style interface,
built with PyQt6 + Groq AI (free LLaMA 70B).

---

## Quick Start (Linux Mint)

### 1. Install dependencies
```bash
bash install.sh
```

### 2. Get a FREE Groq API key
- Go to: https://console.groq.com
- Sign up (free)
- Click "API Keys" → "Create API Key"
- Copy the key (starts with `gsk_...`)

### 3. Run JARVIS
```bash
python3 main.py
```

### 4. Connect AI
- Paste your Groq API key in the header field
- Click "CONNECT AI"
- Start talking or typing!

---

## Features

### AI Brain
- Groq API with LLaMA 3.3 70B (free tier)
- Natural conversation memory (20 messages)
- Context-aware: knows you're Omar on Linux Mint

### Voice
- **Voice Input**: Click 🎤 and speak (Chrome/Chromium needed for STT)
- **TTS Output**: Every AI response is read aloud
- Toggle TTS on/off with the TTS button

### System Control
- **Direct commands** (no AI needed):
  - `open firefox` → opens Firefox
  - `open terminal` → opens terminal
  - `volume 50` → sets volume to 50%
  - `mute` → toggles mute
  - `search linux tips` → Google search
- **App Launcher** panel on the right

### Terminal Tab
- Built-in terminal inside the app
- Run any shell command
- See output live

### System Stats
- CPU, RAM, Disk, Temperature — live every 3 seconds
- Weather for Casablanca (live)
- Volume slider

### Notes
- Save quick notes that persist across sessions
- Stored in `~/.jarvis_notes.json`

### File Tools
- Open any file and read its contents to AI
- Save conversation history as JSON

---

## Project Structure

```
jarvis/
├── main.py                 # Entry point
├── requirements.txt        # Python packages
├── install.sh              # Auto-installer
├── core/
│   ├── ai_brain.py         # Groq AI communication
│   ├── system_controller.py# OS control (apps, volume, files)
│   ├── voice_engine.py     # TTS + STT
│   └── workers.py          # Background threads (stats, weather)
└── gui/
    ├── main_window.py      # Main PyQt6 window
    └── widgets.py          # Custom widgets (orb, bars, bubbles)
```

---

## Requirements

- Python 3.9+
- Linux Mint (or any Ubuntu-based distro)
- Internet connection (for AI + weather)
- Microphone (optional, for voice input)

---

## Troubleshooting

**PyQt6 not found:**
```bash
pip3 install --break-system-packages PyQt6
```

**PyAudio install fails:**
```bash
sudo apt install portaudio19-dev python3-dev
pip3 install --break-system-packages pyaudio
```

**TTS not working:**
```bash
sudo apt install espeak espeak-ng
pip3 install --break-system-packages pyttsx3
```

**Voice input not working:**
- Make sure your microphone is connected
- Check: `arecord -l` to list audio devices

---

## Get Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up with Google or email
3. Click **API Keys** in sidebar
4. Click **Create API Key**
5. Copy the key → paste in JARVIS header

Free tier: ~14,400 requests/day with LLaMA 70B ✅
