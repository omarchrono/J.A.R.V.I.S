"""
J.A.R.V.I.S - System Controller
Handles OS-level commands: apps, volume, brightness, files, web
"""

import subprocess
import os
import shutil
import webbrowser
import platform
import psutil
import json
from datetime import datetime
from pathlib import Path


class SystemController:
    def __init__(self):
        self.os = platform.system().lower()
        self.notes_file = Path.home() / ".jarvis_notes.json"
        self.notes = self._load_notes()

    # ── App Control ──────────────────────────────────────────────────────────

    def open_app(self, app_name: str) -> str:
        """Try to open an application."""
        app_map = {
            "terminal": ["x-terminal-emulator", "gnome-terminal", "xterm", "konsole"],
            "browser": ["firefox", "chromium-browser", "google-chrome", "brave-browser"],
            "firefox": ["firefox"],
            "chrome": ["google-chrome", "chromium-browser"],
            "files": ["nautilus", "thunar", "nemo", "dolphin"],
            "text editor": ["gedit", "mousepad", "kate", "nano"],
            "vscode": ["code", "codium"],
            "vs code": ["code", "codium"],
            "calculator": ["gnome-calculator", "xcalc", "kcalc"],
            "settings": ["gnome-control-center", "xfce4-settings-manager"],
            "vlc": ["vlc"],
            "spotify": ["spotify"],
            "discord": ["discord"],
            "steam": ["steam"],
        }

        key = app_name.lower().strip()
        candidates = app_map.get(key, [key])

        for cmd in candidates:
            if shutil.which(cmd):
                try:
                    subprocess.Popen([cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    return f"Opening {app_name}..."
                except Exception as e:
                    continue

        return f"Could not find '{app_name}'. Is it installed?"

    def close_app(self, app_name: str) -> str:
        """Kill a running application by name."""
        try:
            result = subprocess.run(
                ["pkill", "-f", app_name],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                return f"Closed {app_name}."
            return f"No running process found for '{app_name}'."
        except Exception as e:
            return f"Error: {e}"

    # ── Web ───────────────────────────────────────────────────────────────────

    def open_url(self, url: str) -> str:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        webbrowser.open(url)
        return f"Opening {url} in browser."

    def web_search(self, query: str) -> str:
        url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        webbrowser.open(url)
        return f"Searching Google for: {query}"

    # ── Volume ────────────────────────────────────────────────────────────────

    def set_volume(self, level: int) -> str:
        """Set system volume 0-100."""
        level = max(0, min(100, level))
        try:
            subprocess.run(
                ["pactl", "set-sink-volume", "@DEFAULT_SINK@", f"{level}%"],
                check=True, capture_output=True
            )
            return f"Volume set to {level}%."
        except FileNotFoundError:
            try:
                subprocess.run(["amixer", "set", "Master", f"{level}%"], check=True, capture_output=True)
                return f"Volume set to {level}%."
            except Exception as e:
                return f"Could not set volume: {e}"

    def get_volume(self) -> int:
        try:
            result = subprocess.run(
                ["pactl", "get-sink-volume", "@DEFAULT_SINK@"],
                capture_output=True, text=True
            )
            import re
            match = re.search(r'(\d+)%', result.stdout)
            return int(match.group(1)) if match else 50
        except:
            return 50

    def mute_toggle(self) -> str:
        try:
            subprocess.run(["pactl", "set-sink-mute", "@DEFAULT_SINK@", "toggle"], check=True)
            return "Audio muted/unmuted."
        except Exception as e:
            return f"Could not toggle mute: {e}"

    # ── Brightness ────────────────────────────────────────────────────────────

    def set_brightness(self, level: int) -> str:
        level = max(1, min(100, level))
        try:
            subprocess.run(["xrandr", "--output", "LVDS-1", "--brightness", str(level/100)],
                           capture_output=True)
            return f"Brightness set to {level}%."
        except:
            try:
                # Try with brightnessctl
                subprocess.run(["brightnessctl", "set", f"{level}%"], capture_output=True)
                return f"Brightness set to {level}%."
            except Exception as e:
                return f"Could not set brightness: {e}"

    # ── System Info ───────────────────────────────────────────────────────────

    def get_system_stats(self) -> dict:
        cpu = psutil.cpu_percent(interval=0.5)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        temps = {}
        try:
            temp_data = psutil.sensors_temperatures()
            if temp_data:
                for key, vals in temp_data.items():
                    if vals:
                        temps[key] = vals[0].current
        except:
            pass

        return {
            "cpu_percent": round(cpu, 1),
            "ram_percent": round(mem.percent, 1),
            "ram_used_gb": round(mem.used / 1e9, 1),
            "ram_total_gb": round(mem.total / 1e9, 1),
            "disk_percent": round(disk.percent, 1),
            "disk_used_gb": round(disk.used / 1e9, 1),
            "disk_total_gb": round(disk.total / 1e9, 1),
            "temps": temps,
            "cpu_cores": psutil.cpu_count(),
            "uptime_hours": round((datetime.now().timestamp() - psutil.boot_time()) / 3600, 1)
        }

    def get_running_processes(self, n=10) -> list:
        procs = []
        for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                procs.append(p.info)
            except:
                pass
        return sorted(procs, key=lambda x: x.get('cpu_percent', 0), reverse=True)[:n]

    # ── File Management ───────────────────────────────────────────────────────

    def list_dir(self, path: str = ".") -> str:
        try:
            p = Path(path).expanduser()
            items = list(p.iterdir())
            dirs = [f"📁 {x.name}" for x in items if x.is_dir()]
            files = [f"📄 {x.name}" for x in items if x.is_file()]
            return "\n".join(sorted(dirs) + sorted(files)) or "Empty directory."
        except Exception as e:
            return f"Error: {e}"

    def create_file(self, path: str, content: str = "") -> str:
        try:
            p = Path(path).expanduser()
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding="utf-8")
            return f"File created: {path}"
        except Exception as e:
            return f"Error: {e}"

    def read_file(self, path: str) -> str:
        try:
            p = Path(path).expanduser()
            content = p.read_text(encoding="utf-8", errors="replace")
            if len(content) > 3000:
                content = content[:3000] + "\n... (truncated)"
            return content
        except Exception as e:
            return f"Error: {e}"

    def delete_file(self, path: str) -> str:
        try:
            p = Path(path).expanduser()
            if p.is_dir():
                shutil.rmtree(p)
                return f"Directory deleted: {path}"
            else:
                p.unlink()
                return f"File deleted: {path}"
        except Exception as e:
            return f"Error: {e}"

    def run_terminal_command(self, cmd: str) -> str:
        """Run a shell command and return output."""
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True,
                text=True, timeout=15
            )
            out = result.stdout.strip()
            err = result.stderr.strip()
            if out:
                return out[:2000]
            if err:
                return f"[stderr]: {err[:1000]}"
            return "(Command completed with no output)"
        except subprocess.TimeoutExpired:
            return "Command timed out after 15 seconds."
        except Exception as e:
            return f"Error: {e}"

    # ── Notes ─────────────────────────────────────────────────────────────────

    def _load_notes(self) -> list:
        if self.notes_file.exists():
            try:
                return json.loads(self.notes_file.read_text())
            except:
                return []
        return []

    def _save_notes(self):
        self.notes_file.write_text(json.dumps(self.notes, ensure_ascii=False, indent=2))

    def add_note(self, text: str) -> str:
        note = {"id": len(self.notes)+1, "text": text, "time": datetime.now().isoformat()}
        self.notes.append(note)
        self._save_notes()
        return f"Note #{note['id']} saved."

    def get_notes(self) -> list:
        return self.notes

    def delete_note(self, note_id: int) -> str:
        self.notes = [n for n in self.notes if n['id'] != note_id]
        self._save_notes()
        return f"Note #{note_id} deleted."
