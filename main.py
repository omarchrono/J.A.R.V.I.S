#!/usr/bin/env python3
"""
J.A.R.V.I.S - Just A Rather Very Intelligent System
Main entry point
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon
from gui.main_window import JarvisWindow


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("J.A.R.V.I.S")
    app.setApplicationVersion("1.0.0")

    # Dark fusion style base
    app.setStyle("Fusion")

    window = JarvisWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
