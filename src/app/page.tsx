"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ArcReactor from "@/components/ArcReactor";
import ChatPanel from "@/components/ChatPanel";
import SystemStats from "@/components/SystemStats";
import TasksPanel from "@/components/TasksPanel";
import NotesPanel from "@/components/NotesPanel";
import ActivityLog from "@/components/ActivityLog";
import BootScreen from "@/components/BootScreen";

// Client-only canvas components
const HexGrid = dynamic(() => import("@/components/HexGrid"), { ssr: false });
const RadarDisplay = dynamic(() => import("@/components/RadarDisplay"), { ssr: false });

type Tab = "chat" | "tasks" | "notes";

export default function JarvisGUI() {
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [jarvisActive, setJarvisActive] = useState(true);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "chat", label: "INTERFACE", icon: "◉" },
    { id: "tasks", label: "MISSIONS", icon: "☰" },
    { id: "notes", label: "INTEL", icon: "◈" },
  ];

  return (
    <>
      {/* Boot screen */}
      <BootScreen onComplete={handleBootComplete} />

      {/* Scan overlay */}
      <div className="scan-overlay" />
      <div className="scan-line" />

      {/* Hex grid background */}
      <HexGrid />

      {/* Main UI */}
      <div
        className="relative flex flex-col h-screen"
        style={{
          zIndex: 1,
          opacity: booted ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        {/* ══ TOP BAR ══ */}
        <header
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(0,212,255,0.15)",
            background: "rgba(0,8,16,0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Left — Jarvis branding */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{
                  borderColor: "#00d4ff",
                  background: "rgba(0,212,255,0.1)",
                  color: "#00d4ff",
                  boxShadow: "0 0 12px rgba(0,212,255,0.4)",
                }}
              >
                J
              </div>
              <div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border"
                style={{
                  background: jarvisActive ? "#00ff88" : "#ff3355",
                  borderColor: jarvisActive ? "#00ff88" : "#ff3355",
                  boxShadow: `0 0 6px ${jarvisActive ? "#00ff88" : "#ff3355"}`,
                }}
              />
            </div>
            <div>
              <div
                className="text-sm font-bold tracking-widest"
                style={{ color: "#00d4ff", textShadow: "0 0 10px rgba(0,212,255,0.5)" }}
              >
                J.A.R.V.I.S
              </div>
              <div className="text-xs opacity-40 tracking-widest">
                Just A Rather Very Intelligent System
              </div>
            </div>
          </div>

          {/* Center — Status indicators */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "AI ENGINE", value: "GROQ LLaMA-3.3", color: "#00d4ff" },
              { label: "STATUS", value: jarvisActive ? "ONLINE" : "STANDBY", color: jarvisActive ? "#00ff88" : "#ffd700" },
              { label: "SECURITY", value: "LEVEL 5", color: "#ffd700" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xs opacity-30 tracking-widest">{item.label}</div>
                <div
                  className="text-xs font-bold tracking-widest"
                  style={{ color: item.color, textShadow: `0 0 8px ${item.color}` }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Right — Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setJarvisActive(!jarvisActive)}
              className="jarvis-btn px-4 py-2 rounded text-xs tracking-widest font-bold"
              style={{
                color: jarvisActive ? "#00ff88" : "#ff3355",
                borderColor: jarvisActive ? "rgba(0,255,136,0.3)" : "rgba(255,51,85,0.3)",
              }}
            >
              {jarvisActive ? "ONLINE" : "STANDBY"}
            </button>

            {/* Top decorative bits */}
            <div className="hidden lg:flex items-center gap-2 opacity-40">
              {["⬡", "⬡", "⬡"].map((s, i) => (
                <span
                  key={i}
                  style={{
                    color: "#00d4ff",
                    animation: `hex-pulse 2s ease-in-out ${i * 0.3}s infinite`,
                    fontSize: 10,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* ══ MAIN CONTENT ══ */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT SIDEBAR */}
          <aside
            className="hidden lg:flex flex-col gap-4 p-4 flex-shrink-0"
            style={{
              width: 260,
              borderRight: "1px solid rgba(0,212,255,0.1)",
              overflowY: "auto",
            }}
          >
            {/* Arc Reactor */}
            <div className="flex justify-center py-2">
              <ArcReactor active={jarvisActive} />
            </div>

            {/* Radar */}
            <div className="flex justify-center">
              <RadarDisplay />
            </div>

            {/* System stats */}
            <SystemStats />
          </aside>

          {/* CENTER — Tab content */}
          <main className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div
              className="flex items-center px-4 gap-1 flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(0,212,255,0.12)",
                background: "rgba(0,8,16,0.6)",
                paddingTop: "0.5rem",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 text-xs font-bold tracking-widest transition-all relative"
                  style={{
                    color: activeTab === tab.id ? "#00d4ff" : "rgba(0,212,255,0.4)",
                    background:
                      activeTab === tab.id
                        ? "rgba(0,212,255,0.08)"
                        : "transparent",
                    borderBottom:
                      activeTab === tab.id
                        ? "2px solid #00d4ff"
                        : "2px solid transparent",
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              {/* Decorative right side */}
              <div className="ml-auto flex items-center gap-3 pr-2 opacity-30 text-xs tracking-widest">
                <span style={{ color: "#00d4ff" }}>SYS</span>
                <span>|</span>
                <span style={{ color: "#00ff88" }}>NET</span>
                <span>|</span>
                <span style={{ color: "#ffd700" }}>SEC</span>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden p-4">
              {activeTab === "chat" && <ChatPanel />}
              {activeTab === "tasks" && <TasksPanel />}
              {activeTab === "notes" && <NotesPanel />}
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside
            className="hidden xl:flex flex-col gap-4 p-4 flex-shrink-0"
            style={{
              width: 240,
              borderLeft: "1px solid rgba(0,212,255,0.1)",
              overflowY: "auto",
            }}
          >
            {/* Activity log */}
            <div className="flex-1">
              <ActivityLog />
            </div>

            {/* Quick stats panel */}
            <div className="jarvis-panel rounded-lg p-4">
              <div className="text-xs tracking-widest font-bold mb-3 opacity-60">QUICK COMMANDS</div>
              <div className="space-y-1">
                {[
                  { cmd: "SYSTEM STATUS", color: "#00d4ff" },
                  { cmd: "LIST TASKS", color: "#00ff88" },
                  { cmd: "MY NOTES", color: "#ffd700" },
                  { cmd: "OPEN YOUTUBE", color: "#ff3355" },
                  { cmd: "WRITE CODE", color: "#bf00ff" },
                ].map((item) => (
                  <div
                    key={item.cmd}
                    className="text-xs px-2 py-1.5 rounded tracking-widest cursor-default"
                    style={{
                      background: `${item.color}0a`,
                      border: `1px solid ${item.color}22`,
                      color: `${item.color}99`,
                    }}
                  >
                    › {item.cmd}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom decorative panel */}
            <div className="jarvis-panel rounded-lg p-4">
              <div className="text-xs tracking-widest font-bold mb-3 opacity-60">PROTOCOLS</div>
              <div className="space-y-2">
                {[
                  { name: "NEURAL NET", status: "ACTIVE", color: "#00ff88" },
                  { name: "VOICE I/O", status: "READY", color: "#00d4ff" },
                  { name: "FILE SYS", status: "MOUNTED", color: "#00ff88" },
                  { name: "MEMORY", status: "SYNCED", color: "#ffd700" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <span className="opacity-40 tracking-widest">{p.name}</span>
                    <span
                      className="tracking-widest font-bold"
                      style={{ color: p.color, textShadow: `0 0 6px ${p.color}` }}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ══ BOTTOM STATUS BAR ══ */}
        <footer
          className="flex items-center justify-between px-6 py-2 flex-shrink-0 text-xs"
          style={{
            borderTop: "1px solid rgba(0,212,255,0.12)",
            background: "rgba(0,8,16,0.95)",
            backdropFilter: "blur(20px)",
            color: "rgba(0,212,255,0.4)",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="tracking-widest">STARK INDUSTRIES PROPRIETARY SYSTEM</span>
            <span>|</span>
            <span className="tracking-widest">JARVIS v3.0.1</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Animated data tickers */}
            {["KERNEL 6.8.0", "GROQ CONNECTED", "DB SYNC OK"].map((s, i) => (
              <span
                key={s}
                className="tracking-widest"
                style={{
                  color: ["rgba(0,212,255,0.5)", "rgba(0,255,136,0.5)", "rgba(255,215,0,0.5)"][i],
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#00ff88", boxShadow: "0 0 4px #00ff88", animation: "glow-pulse 1.5s ease-in-out infinite" }}
            />
            <span className="tracking-widest">ALL SYSTEMS NOMINAL</span>
          </div>
        </footer>
      </div>
    </>
  );
}
