"use client";
import { useEffect, useState, useCallback } from "react";

interface LogEntry {
  id: number;
  event: string;
  details: string | null;
  level: string;
  createdAt: string;
}

const actionIcons: Record<string, string> = {
  chat: "◉",
  open_app: "▶",
  open_url: "🔗",
  system_cmd: "⚙",
  terminal_cmd: "⬛",
  write_code: "⟨/⟩",
  debug_code: "🔧",
  add_task: "✚",
  list_tasks: "☰",
  add_note: "◈",
  get_weather: "◎",
  system_info: "◈",
  volume: "◉",
  brightness: "◉",
  find_files: "⊕",
  set_timer: "◷",
  delete_file: "✕",
  user_input: "▸",
  error: "⚠",
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/jarvis/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <div className="jarvis-panel rounded-lg p-4 h-full flex flex-col">
      <div
        className="flex items-center justify-between mb-3 pb-2 border-b"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <div className="text-xs tracking-widest font-bold" style={{ color: "#00ff88" }}>
          ACTIVITY LOG
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#00ff88", boxShadow: "0 0 4px #00ff88", animation: "glow-pulse 1s ease-in-out infinite" }}
          />
          <span className="text-xs opacity-30 tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5" style={{ minHeight: 0 }}>
        {logs.length === 0 && (
          <div className="text-center text-xs opacity-20 py-4 tracking-widest">
            AWAITING EVENTS
          </div>
        )}
        {logs.map((log, i) => {
          const icon = actionIcons[log.event] || "◉";
          const isError = log.level === "error";
          const color = isError ? "#ff3355" : log.event === "user_input" ? "#0066ff" : "#00ff88";

          return (
            <div
              key={log.id}
              className="flex items-start gap-2 px-2 py-1.5 rounded text-xs group"
              style={{
                background: "rgba(0,20,40,0.4)",
                border: "1px solid rgba(0,212,255,0.06)",
                animation: i === 0 ? "fade-up 0.3s ease-out" : undefined,
              }}
            >
              <span style={{ color, minWidth: 16, textAlign: "center" }}>{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className="font-bold tracking-widest uppercase"
                    style={{ color, fontSize: "0.6rem" }}
                  >
                    {log.event.replace(/_/g, " ")}
                  </span>
                </div>
                {log.details && (
                  <p
                    className="opacity-50 leading-snug truncate"
                    style={{ fontSize: "0.65rem", color: "#a0d8ef" }}
                  >
                    {log.details}
                  </p>
                )}
              </div>
              <span
                className="opacity-20 flex-shrink-0 tracking-widest"
                style={{ fontSize: "0.55rem" }}
              >
                {new Date(log.createdAt).toLocaleTimeString("en-US", { hour12: false })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
