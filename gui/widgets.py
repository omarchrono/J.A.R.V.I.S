"""
J.A.R.V.I.S - Custom Widgets
Animated orb, stat bars, chat bubbles with JARVIS aesthetic
"""

import math
import random
from PyQt6.QtWidgets import (
    QWidget, QLabel, QFrame, QVBoxLayout, QHBoxLayout,
    QScrollArea, QSizePolicy
)
from PyQt6.QtCore import (
    Qt, QTimer, QPropertyAnimation, QEasingCurve,
    pyqtProperty, QPoint, QRect, QRectF
)
from PyQt6.QtGui import (
    QPainter, QPen, QBrush, QColor, QFont, QFontMetrics,
    QLinearGradient, QRadialGradient, QPainterPath, QPolygonF
)


CYAN = QColor("#00d4ff")
CYAN_DIM = QColor("#00aacc")
DARK = QColor("#020b14")
DARK2 = QColor("#040f1a")
PANEL = QColor(0, 20, 40, 220)
GREEN = QColor("#00ff88")
RED = QColor("#ff4455")
AMBER = QColor("#ffaa00")
TEXT = QColor("#c8e8f8")
MUTED = QColor(0, 212, 255, 100)


class OrbWidget(QWidget):
    """Animated central orb - the heart of JARVIS."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(200, 200)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        self._angle = 0.0
        self._angle2 = 0.0
        self._angle3 = 0.0
        self._pulse = 0.0
        self._pulse_dir = 1
        self._listening = False
        self._thinking = False
        self._status = "STANDBY"
        self._viz_bars = [0.0] * 20

        self.timer = QTimer(self)
        self.timer.timeout.connect(self._animate)
        self.timer.start(30)

    def _animate(self):
        self._angle = (self._angle + 1.2) % 360
        self._angle2 = (self._angle2 - 0.8) % 360
        self._angle3 = (self._angle3 + 0.4) % 360

        if self._listening or self._thinking:
            self._pulse += 0.08 * self._pulse_dir
            if self._pulse >= 1.0 or self._pulse <= 0.0:
                self._pulse_dir *= -1
        else:
            self._pulse = max(0, self._pulse - 0.05)

        if self._listening:
            self._viz_bars = [random.random() for _ in self._viz_bars]
        elif self._thinking:
            shift = self._viz_bars[-1]
            self._viz_bars = [shift] + self._viz_bars[:-1]
        else:
            self._viz_bars = [v * 0.85 for v in self._viz_bars]

        self.update()

    def set_state(self, state: str):
        """State: 'standby', 'listening', 'thinking', 'ready'"""
        self._listening = (state == "listening")
        self._thinking = (state == "thinking")
        self._status = state.upper()
        self.update()

    def set_status_text(self, text: str):
        self._status = text
        self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        w, h = self.width(), self.height()
        cx, cy = w // 2, h // 2
        r = min(w, h) // 2 - 10

        # Background
        painter.fillRect(0, 0, w, h, DARK)

        # Outer rings
        self._draw_ring(painter, cx, cy, r, self._angle, CYAN, 1.5, Qt.PenStyle.SolidLine, 0.4)
        self._draw_ring(painter, cx, cy, int(r * 0.82), self._angle2, CYAN_DIM, 1.0, Qt.PenStyle.DashLine, 0.25)
        self._draw_ring(painter, cx, cy, int(r * 0.65), self._angle3, CYAN, 0.8, Qt.PenStyle.DotLine, 0.15)

        # Tick marks on outer ring
        self._draw_ticks(painter, cx, cy, r, 36, CYAN, 0.3)

        # Glow when active
        if self._listening or self._thinking:
            glow = QRadialGradient(cx, cy, r)
            alpha = int(60 + 40 * self._pulse)
            glow.setColorAt(0, QColor(0, 212, 255, alpha))
            glow.setColorAt(1, QColor(0, 212, 255, 0))
            painter.setBrush(QBrush(glow))
            painter.setPen(Qt.PenStyle.NoPen)
            painter.drawEllipse(cx - r, cy - r, r * 2, r * 2)

        # Core sphere
        core_r = int(r * 0.42)
        grad = QRadialGradient(cx - core_r // 3, cy - core_r // 3, core_r * 1.5)
        grad.setColorAt(0.0, QColor(0, 212, 255, 180))
        grad.setColorAt(0.4, QColor(0, 80, 140, 200))
        grad.setColorAt(1.0, QColor(0, 20, 50, 240))
        painter.setBrush(QBrush(grad))

        border_color = RED if self._listening else (AMBER if self._thinking else CYAN)
        border_color.setAlphaF(0.7 + 0.3 * self._pulse)
        painter.setPen(QPen(border_color, 1.5))
        painter.drawEllipse(cx - core_r, cy - core_r, core_r * 2, core_r * 2)

        # Status text
        font = QFont("Courier New", 8, QFont.Weight.Bold)
        painter.setFont(font)
        painter.setPen(QPen(CYAN))
        fm = QFontMetrics(font)
        tw = fm.horizontalAdvance(self._status)
        painter.drawText(cx - tw // 2, cy + 4, self._status)

        # Voice viz bars at bottom of orb
        if any(v > 0.02 for v in self._viz_bars):
            bar_w = 3
            total = len(self._viz_bars) * (bar_w + 2)
            bx = cx - total // 2
            by = cy + core_r + 8
            for i, v in enumerate(self._viz_bars):
                bh = max(2, int(v * 18))
                color = QColor(0, 212, 255, int(200 * v))
                painter.setPen(Qt.PenStyle.NoPen)
                painter.setBrush(color)
                painter.drawRoundedRect(bx + i * (bar_w + 2), by - bh, bar_w, bh, 1, 1)

        painter.end()

    def _draw_ring(self, p, cx, cy, r, angle, color, width, style, alpha):
        c = QColor(color)
        c.setAlphaF(alpha)
        pen = QPen(c, width, style)
        p.setPen(pen)
        p.setBrush(Qt.BrushStyle.NoBrush)
        p.save()
        p.translate(cx, cy)
        p.rotate(angle)
        p.drawEllipse(-r, -r, r * 2, r * 2)
        p.restore()

    def _draw_ticks(self, p, cx, cy, r, count, color, alpha):
        c = QColor(color)
        c.setAlphaF(alpha)
        pen = QPen(c, 0.8)
        p.setPen(pen)
        for i in range(count):
            a = math.radians(i * 360 / count + self._angle)
            tick_len = 6 if i % 6 == 0 else 3
            x1 = cx + (r - tick_len) * math.cos(a)
            y1 = cy + (r - tick_len) * math.sin(a)
            x2 = cx + r * math.cos(a)
            y2 = cy + r * math.sin(a)
            p.drawLine(int(x1), int(y1), int(x2), int(y2))


class StatBar(QWidget):
    """Animated progress bar with label and value."""

    def __init__(self, label: str, parent=None):
        super().__init__(parent)
        self.label = label
        self._value = 0.0
        self._target = 0.0
        self.setFixedHeight(38)
        self.setMinimumWidth(100)

        self.anim_timer = QTimer(self)
        self.anim_timer.timeout.connect(self._lerp)
        self.anim_timer.start(30)

    def set_value(self, pct: float, text: str = ""):
        self._target = max(0.0, min(100.0, pct))
        self._display_text = text
        self.update()

    def _lerp(self):
        if abs(self._value - self._target) > 0.5:
            self._value += (self._target - self._value) * 0.12
            self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h = self.width(), self.height()

        # Label
        font = QFont("Courier New", 8)
        p.setFont(font)
        p.setPen(QPen(MUTED))
        p.drawText(0, 12, self.label)

        # Value text (right side)
        val_text = getattr(self, "_display_text", f"{int(self._value)}%")
        p.setPen(QPen(CYAN))
        fm = QFontMetrics(font)
        tw = fm.horizontalAdvance(val_text)
        p.drawText(w - tw, 12, val_text)

        # Track
        track_y = 18
        track_h = 4
        p.setPen(Qt.PenStyle.NoPen)
        track_color = QColor(0, 212, 255, 30)
        p.setBrush(track_color)
        p.drawRoundedRect(0, track_y, w, track_h, 2, 2)

        # Fill
        if self._value > 75:
            fill_color = QColor("#ff4455")
        elif self._value > 55:
            fill_color = QColor("#ffaa00")
        else:
            fill_color = CYAN

        fill_w = int(w * self._value / 100)
        if fill_w > 0:
            grad = QLinearGradient(0, 0, fill_w, 0)
            c1 = QColor(fill_color)
            c1.setAlphaF(0.6)
            c2 = QColor(fill_color)
            grad.setColorAt(0, c1)
            grad.setColorAt(1, c2)
            p.setBrush(QBrush(grad))
            p.drawRoundedRect(0, track_y, fill_w, track_h, 2, 2)

            # Glow tip
            glow_w = min(20, fill_w)
            glow = QLinearGradient(fill_w - glow_w, 0, fill_w, 0)
            glow.setColorAt(0, QColor(fill_color.red(), fill_color.green(), fill_color.blue(), 0))
            glow.setColorAt(1, QColor(fill_color.red(), fill_color.green(), fill_color.blue(), 180))
            p.setBrush(QBrush(glow))
            p.drawRoundedRect(fill_w - glow_w, track_y - 1, glow_w, track_h + 2, 2, 2)

        p.end()


class ChatBubble(QFrame):
    """A single chat message bubble."""

    def __init__(self, role: str, text: str, parent=None):
        super().__init__(parent)
        self.role = role
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 8, 10, 8)
        layout.setSpacing(3)

        # Label
        label_text = "OMAR // OPERATOR" if role == "user" else "J.A.R.V.I.S // AI"
        label = QLabel(label_text)
        label.setFont(QFont("Courier New", 7, QFont.Weight.Bold))
        label.setStyleSheet(
            f"color: {'#00aacc' if role == 'user' else '#00d4ff'};"
            "letter-spacing: 2px;"
        )
        layout.addWidget(label)

        # Message
        msg = QLabel(text)
        msg.setWordWrap(True)
        msg.setFont(QFont("Courier New", 10))
        msg.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        if role == "user":
            msg.setStyleSheet("color: #00ccee;")
        else:
            msg.setStyleSheet("color: #c8e8f8;")
        layout.addWidget(msg)

        # Styling
        if role == "user":
            self.setStyleSheet("""
                QFrame {
                    background: rgba(0, 212, 255, 15);
                    border: 1px solid rgba(0, 212, 255, 60);
                    border-radius: 4px;
                }
            """)
        else:
            self.setStyleSheet("""
                QFrame {
                    background: rgba(0, 30, 60, 160);
                    border: 1px solid rgba(0, 212, 255, 30);
                    border-radius: 4px;
                }
            """)


class TypingIndicator(QWidget):
    """Animated typing dots."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedHeight(40)
        self._dots = [0.0, 0.0, 0.0]
        self._t = 0

        self.timer = QTimer(self)
        self.timer.timeout.connect(self._tick)
        self.timer.start(60)

    def _tick(self):
        self._t += 1
        for i in range(3):
            phase = (self._t + i * 8) % 24
            self._dots[i] = max(0.0, 1.0 - abs(phase - 12) / 12.0)
        self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        x = 14
        y = self.height() // 2
        for v in self._dots:
            c = QColor(0, 212, 255, int(80 + 170 * v))
            r = 3 + int(2 * v)
            p.setBrush(c)
            p.setPen(Qt.PenStyle.NoPen)
            p.drawEllipse(x - r, y - r, r * 2, r * 2)
            x += 14
        p.end()


class HexButton(QWidget):
    """Hexagonal JARVIS-style button."""

    clicked = None  # set externally

    def __init__(self, text: str, parent=None):
        super().__init__(parent)
        self.text = text
        self._hovered = False
        self._pressed = False
        self.setFixedHeight(30)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setMouseTracking(True)

    def mousePressEvent(self, e):
        self._pressed = True
        self.update()

    def mouseReleaseEvent(self, e):
        self._pressed = False
        self.update()
        if self.clicked and self.rect().contains(e.pos()):
            self.clicked()

    def enterEvent(self, e):
        self._hovered = True
        self.update()

    def leaveEvent(self, e):
        self._hovered = False
        self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h = self.width(), self.height()

        if self._pressed:
            bg = QColor(0, 212, 255, 50)
            border = CYAN
        elif self._hovered:
            bg = QColor(0, 212, 255, 25)
            border = QColor(0, 212, 255, 180)
        else:
            bg = QColor(0, 212, 255, 8)
            border = QColor(0, 212, 255, 60)

        p.setBrush(bg)
        p.setPen(QPen(border, 0.8))
        p.drawRoundedRect(2, 2, w - 4, h - 4, 3, 3)

        font = QFont("Courier New", 8, QFont.Weight.Bold)
        p.setFont(font)
        p.setPen(QPen(CYAN if self._hovered else MUTED))
        p.drawText(QRect(0, 0, w, h), Qt.AlignmentFlag.AlignCenter, self.text)
        p.end()
