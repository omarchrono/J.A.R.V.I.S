"""
J.A.R.V.I.S - AI Core
Handles Groq API communication and conversation management
"""

import json
import os
from datetime import datetime
from groq import Groq


SYSTEM_PROMPT = """You are J.A.R.V.I.S (Just A Rather Very Intelligent System), an advanced AI assistant.
Your user is Omar, a tech enthusiast in Casablanca, Morocco.
He uses Linux Mint on a Dell Vostro 3667 PC (older hardware).
He is interested in: lightweight games (Minecraft, free Steam games), Linux troubleshooting (GRUB, disk issues, filesystem errors), coding help (Python, terminal commands), and building a budget gaming PC.

Your personality:
- Helpful, slightly formal but friendly - like a real AI assistant
- Concise but informative responses
- Address Omar by name occasionally
- When asked about Linux commands, give real terminal commands with explanations
- When asked about games, suggest ones that work on weak hardware (low RAM/GPU)
- For system tasks, explain what the command does before running it
- Keep responses under 3 paragraphs unless a detailed explanation is needed

Current date/time: {datetime}
OS: Linux Mint
Location: Casablanca, Morocco
"""


class AIBrain:
    def __init__(self):
        self.client = None
        self.api_key = ""
        self.model = "llama-3.3-70b-versatile"
        self.history = []
        self.max_history = 20
        self.total_tokens = 0
        self.message_count = 0

    def connect(self, api_key: str, model: str = None) -> tuple[bool, str]:
        """Connect to Groq API. Returns (success, message)."""
        try:
            self.client = Groq(api_key=api_key)
            # Test connection with a minimal request
            test = self.client.chat.completions.create(
                model=model or self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            self.api_key = api_key
            if model:
                self.model = model
            return True, "Neural link established successfully."
        except Exception as e:
            self.client = None
            return False, f"Connection failed: {str(e)}"

    def is_connected(self) -> bool:
        return self.client is not None

    def chat(self, user_message: str) -> tuple[str, int]:
        """Send message and get response. Returns (response_text, tokens_used)."""
        if not self.client:
            return "AI core offline. Please connect your Groq API key.", 0

        self.history.append({"role": "user", "content": user_message})

        # Keep history bounded
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]

        system = SYSTEM_PROMPT.format(datetime=datetime.now().strftime("%A, %B %d %Y %H:%M"))

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system}] + self.history,
                max_tokens=800,
                temperature=0.7
            )
            reply = response.choices[0].message.content
            tokens = response.usage.total_tokens if response.usage else 0

            self.history.append({"role": "assistant", "content": reply})
            self.total_tokens += tokens
            self.message_count += 1

            return reply, tokens

        except Exception as e:
            # Remove the failed user message from history
            self.history.pop()
            return f"Error: {str(e)}", 0

    def clear_history(self):
        self.history = []
        self.message_count = 0

    def save_conversation(self, path: str):
        """Save conversation to JSON file."""
        data = {
            "timestamp": datetime.now().isoformat(),
            "model": self.model,
            "total_tokens": self.total_tokens,
            "messages": self.history
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load_conversation(self, path: str):
        """Load conversation from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.history = data.get("messages", [])
        self.total_tokens = data.get("total_tokens", 0)
