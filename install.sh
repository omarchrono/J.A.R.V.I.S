#!/bin/bash
# J.A.R.V.I.S - Install & Run Script for Linux Mint
# Run this once: bash install.sh
# Then to run: bash run.sh

set -e

echo "╔══════════════════════════════════════════╗"
echo "║    J.A.R.V.I.S  —  Installing...        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 not found. Install it first:"
    echo "  sudo apt install python3 python3-pip"
    exit 1
fi

PYTHON_VER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "[OK] Python $PYTHON_VER found."

# System dependencies for PyAudio and PyQt6
echo ""
echo "[*] Installing system dependencies..."
sudo apt-get install -y \
    python3-pyqt6 \
    portaudio19-dev \
    python3-dev \
    espeak \
    espeak-ng \
    2>/dev/null || echo "[WARN] Some apt packages may have failed — continuing..."

# Python packages
echo ""
echo "[*] Installing Python packages..."
pip3 install --user \
    groq \
    psutil \
    requests \
    pyttsx3 \
    SpeechRecognition \
    pyaudio \
    2>/dev/null || pip3 install --break-system-packages \
    groq \
    psutil \
    requests \
    pyttsx3 \
    SpeechRecognition \
    pyaudio

# PyQt6 via pip (in case system package is outdated)
pip3 install --user PyQt6 2>/dev/null || pip3 install --break-system-packages PyQt6

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    Installation Complete!                ║"
echo "║                                          ║"
echo "║  Get your FREE Groq API key:            ║"
echo "║  https://console.groq.com               ║"
echo "║                                          ║"
echo "║  Then run:  python3 main.py             ║"
echo "╚══════════════════════════════════════════╝"
