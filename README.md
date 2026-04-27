🤖 J.A.R.V.I.S — AI Desktop Assistant
Just A Rather Very Intelligent System

A futuristic desktop AI assistant built with Python + PyQt6 and powered by Groq (LLaMA 3.3 70B).

Designed to behave like a real intelligent system with voice control, system automation, terminal access, and live system monitoring.

⚡ Quick Start (Linux Mint)
1. Install dependencies
bash install.sh
2. Get a FREE Groq API Key
Visit: https://console.groq.com
Sign up (no credit card required)
Go to API Keys
Click Create API Key
Copy key (starts with gsk_...)
3. Run JARVIS
python3 main.py
4. Connect AI
Paste your Groq API key in the top input field
Click CONNECT AI
Start interacting with JARVIS 🤖
✨ Features
🧠 AI Brain
Powered by Groq + LLaMA 3.3 70B (free tier)
Context-aware conversations (memory of last 20 messages)
Personalized behavior (knows user environment)
🎤 Voice System
Voice input via microphone 🎤
Text-to-Speech (AI reads responses aloud)
Toggle TTS on/off anytime
Requires Chromium/Chrome for speech recognition
🖥️ System Control

Direct command execution (no AI needed):

open firefox
open terminal
volume 50
mute
search linux tips
Instant system response
App launcher panel included
💻 Built-in Terminal
Full terminal embedded inside UI
Run shell commands directly
Live output streaming
📊 System Monitor
CPU usage (live)
RAM usage (live)
Disk usage
Temperature monitoring
Updates every 3 seconds
🌤️ Live Data
Weather tracking (Casablanca)
System volume control slider
📝 Notes System
Save quick notes inside the app
Persistent storage across sessions
Stored locally in:
~/.jarvis_notes.json
📁 File Tools
Open files and analyze content with AI
Supports reading and interpretation
Save chat history as JSON
🧩 Project Structure
jarvis/
├── main.py                  # Application entry point
├── requirements.txt         # Dependencies
├── install.sh               # Auto setup script
│
├── core/
│   ├── ai_brain.py          # Groq AI communication layer
│   ├── system_controller.py # OS control (apps, volume, files)
│   ├── voice_engine.py      # TTS + Speech recognition
│   └── workers.py           # Background tasks (stats, weather)
│
└── gui/
    ├── main_window.py       # PyQt6 main interface
    └── widgets.py           # Custom UI components
📦 Requirements
Python 3.9+
Linux Mint / Ubuntu-based distro
Internet connection (AI + weather)
Microphone (optional but recommended)
🛠️ Troubleshooting
❌ PyQt6 missing
pip3 install --break-system-packages PyQt6
❌ PyAudio installation error
sudo apt install portaudio19-dev python3-dev
pip3 install --break-system-packages pyaudio
❌ Text-to-Speech not working
sudo apt install espeak espeak-ng
pip3 install --break-system-packages pyttsx3
🎤 Voice input not working
Check microphone connection
Verify devices:
arecord -l
🔑 Groq API Setup (Free Tier)
Go to https://console.groq.com
Create account
Open API Keys
Generate new key
Paste inside JARVIS UI
Free Tier Includes:
~14,400 requests/day
LLaMA 3.3 70B access
No credit card required
⚡ Final Vision

J.A.R.V.I.S is designed to be more than an assistant —
it is a full desktop intelligence layer:

Voice-controlled
System-aware
AI-powered
Fully interactive

A step toward a real “Iron Man-style” operating system.
