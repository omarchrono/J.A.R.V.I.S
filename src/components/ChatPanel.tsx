"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  result?: JarvisResult;
  timestamp: Date;
  pending?: boolean;
}

interface JarvisResult {
  action?: string;
  message?: string;
  target?: string;
  extra?: Record<string, unknown>;
  confirm_required?: boolean;
  speak?: string;
  success?: boolean;
  error?: string;
  result_data?: Record<string, unknown>;
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    chat: "#00d4ff",
    open_app: "#00ff88",
    open_url: "#00ff88",
    system_cmd: "#ffd700",
    terminal_cmd: "#ff8800",
    write_code: "#bf00ff",
    debug_code: "#bf00ff",
    add_task: "#00ff88",
    list_tasks: "#00d4ff",
    add_note: "#ffd700",
    get_weather: "#00d4ff",
    system_info: "#00d4ff",
    volume: "#ffd700",
    brightness: "#ffd700",
    find_files: "#00ff88",
    set_timer: "#ff8800",
    delete_file: "#ff3355",
    shutdown: "#ff3355",
  };
  const color = colors[action] || "#00d4ff";

  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-bold tracking-widest uppercase"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color,
      }}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block rounded mt-2 relative">
      <div
        className="flex items-center justify-between px-3 py-1 text-xs opacity-50 border-b"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <span className="tracking-widest">{language || "CODE"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="jarvis-btn px-2 py-0.5 text-xs rounded"
        >
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
      <pre className="p-3 text-xs overflow-x-auto" style={{ maxHeight: 300 }}>
        {code}
      </pre>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const result = msg.result as JarvisResult | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 30 : -30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="mr-3 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold"
            style={{
              borderColor: "#00d4ff",
              background: "rgba(0,212,255,0.1)",
              color: "#00d4ff",
              boxShadow: "0 0 10px rgba(0,212,255,0.3)",
            }}
          >
            J
          </div>
        </div>
      )}

      <div style={{ maxWidth: "75%" }}>
        {!isUser && result?.action && (
          <div className="mb-1 flex items-center gap-2">
            <ActionBadge action={result.action} />
            {result.confirm_required && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#ff335522", border: "1px solid #ff335544", color: "#ff3355" }}>
                ⚠ CONFIRM REQUIRED
              </span>
            )}
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "text-right"
              : ""
          }`}
          style={{
            background: isUser
              ? "linear-gradient(135deg, rgba(0,102,255,0.25), rgba(0,212,255,0.15))"
              : "rgba(0, 20, 40, 0.8)",
            border: `1px solid ${isUser ? "rgba(0,102,255,0.4)" : "rgba(0,212,255,0.2)"}`,
            color: isUser ? "#80d4ff" : "#b0e8ff",
          }}
        >
          {msg.pending ? (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: 16,
                    background: "#00d4ff",
                    animation: `waveform 0.6s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
              <span className="ml-2 text-xs opacity-50">PROCESSING</span>
            </div>
          ) : (
            <div>
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>

              {/* Code display */}
              {result?.extra && typeof result.extra === "object" && "code" in result.extra && (
                <CodeBlock
                  code={String(result.extra.code)}
                  language={String(result?.target || "")}
                />
              )}

              {/* Task list */}
              {result?.result_data && typeof result.result_data === "object" &&
               "tasks" in result.result_data &&
               Array.isArray((result.result_data as Record<string, unknown[]>)["tasks"]) && (
                <div className="mt-2 space-y-1">
                  {((result.result_data as Record<string, Array<{id: number; title: string; priority: string; done: boolean}>>)["tasks"]).map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded priority-${t.priority}`}
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.15)" }}
                    >
                      <span>{t.done ? "✓" : "○"}</span>
                      <span className="flex-1">{t.title}</span>
                      <span className="opacity-50 uppercase text-xs">{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Terminal output */}
              {result?.result_data && typeof result.result_data === "object" &&
               "stdout" in result.result_data && (
                <div className="code-block rounded mt-2 p-2 text-xs">
                  {String((result.result_data as Record<string, string>)["stdout"])}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-xs opacity-30 mt-1 tracking-widest" style={{ textAlign: isUser ? "right" : "left" }}>
          {msg.timestamp.toLocaleTimeString("en-US", { hour12: false })}
        </div>
      </div>

      {isUser && (
        <div className="ml-3 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold"
            style={{
              borderColor: "rgba(0,102,255,0.6)",
              background: "rgba(0,102,255,0.15)",
              color: "#0066ff",
            }}
          >
            S
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Good day. I am JARVIS — Mark III. All systems nominal. How may I assist you today?",
      action: "chat",
      result: { action: "chat" },
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const historyForApi = messages
    .filter((m) => !m.pending)
    .map((m) => ({ role: m.role, content: m.content }));

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    const pendingMsg: Message = {
      id: `p-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: historyForApi }),
      });

      const data = await res.json();

      if (data.error) {
        if (data.error.includes("GROQ_API_KEY")) setApiKeyMissing(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.pending
              ? {
                  ...m,
                  content: `⚠ ${data.error}`,
                  pending: false,
                  action: "error",
                }
              : m
          )
        );
        return;
      }

      const result: JarvisResult = data.result;
      setMessages((prev) =>
        prev.map((m): Message =>
          m.pending
            ? {
                ...m,
                content: String(result.message || "..."),
                action: result.action,
                result,
                pending: false,
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.pending
            ? { ...m, content: `⚠ Connection error: ${err}`, pending: false }
            : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickCommands = [
    "System status",
    "List my tasks",
    "What time is it?",
    "Write a Python hello world",
    "Show my notes",
  ];

  return (
    <div className="jarvis-panel rounded-lg flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <div className="status-dot" />
          <div>
            <div className="text-sm font-bold tracking-widest" style={{ color: "#00d4ff" }}>
              JARVIS INTERFACE
            </div>
            <div className="text-xs opacity-40 tracking-widest">MARK III — ONLINE</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([{
              id: "welcome",
              role: "assistant",
              content: "Memory cleared. Starting fresh conversation, sir.",
              result: { action: "chat" },
              timestamp: new Date(),
            }])}
            className="jarvis-btn text-xs px-3 py-1 rounded tracking-widest"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* API Key Warning */}
      <AnimatePresence>
        {apiKeyMissing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 text-xs"
            style={{
              background: "rgba(255,51,85,0.1)",
              borderBottom: "1px solid rgba(255,51,85,0.3)",
              color: "#ff3355",
            }}
          >
            ⚠ GROQ_API_KEY not configured in .env file. Add your key from console.groq.com to enable JARVIS intelligence.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div
        className="px-4 py-2 flex gap-2 flex-wrap border-t"
        style={{ borderColor: "rgba(0,212,255,0.1)" }}
      >
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => sendMessage(cmd)}
            disabled={loading}
            className="jarvis-btn text-xs px-2 py-1 rounded tracking-wide"
            style={{ fontSize: "0.65rem" }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 border-t flex gap-3 items-center"
        style={{ borderColor: "rgba(0,212,255,0.15)" }}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Awaiting your command, sir..."
            className="jarvis-input w-full px-4 py-3 rounded text-sm"
            disabled={loading}
            autoFocus
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: 12,
                    background: "#00d4ff",
                    animation: `waveform 0.5s ease-in-out ${i * 0.12}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="jarvis-btn px-5 py-3 rounded font-bold tracking-widest text-sm flex items-center gap-2"
          style={{ minWidth: 90 }}
        >
          {loading ? (
            <span className="opacity-50">...</span>
          ) : (
            <>
              <span>SEND</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
