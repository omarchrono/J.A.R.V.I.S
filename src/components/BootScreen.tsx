"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
  { text: "INITIALIZING JARVIS MARK III...", delay: 0, color: "#00d4ff" },
  { text: "LOADING NEURAL INFERENCE ENGINE", delay: 300, color: "#00d4ff" },
  { text: "CONNECTING TO GROQ HYPER-PROCESSOR", delay: 600, color: "#00d4ff" },
  { text: "CALIBRATING ARC REACTOR INTERFACE", delay: 900, color: "#ffd700" },
  { text: "DATABASE LINK ESTABLISHED", delay: 1200, color: "#00ff88" },
  { text: "MEMORY SYSTEMS ONLINE", delay: 1500, color: "#00ff88" },
  { text: "THREAT ASSESSMENT PROTOCOLS READY", delay: 1800, color: "#ffd700" },
  { text: "NATURAL LANGUAGE MATRIX LOADED", delay: 2100, color: "#00d4ff" },
  { text: "ALL SYSTEMS NOMINAL", delay: 2400, color: "#00ff88" },
  { text: "GOOD DAY, SIR.", delay: 2700, color: "#ffffff" },
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        setProgress(Math.round(((i + 1) / bootLines.length) * 100));
      }, line.delay);
    });

    setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 600);
    }, 3400);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: "#000810" }}
        >
          {/* Corner decorations */}
          <div className="fixed top-6 left-6 w-12 h-12 border-t-2 border-l-2" style={{ borderColor: "#00d4ff" }} />
          <div className="fixed top-6 right-6 w-12 h-12 border-t-2 border-r-2" style={{ borderColor: "#00d4ff" }} />
          <div className="fixed bottom-6 left-6 w-12 h-12 border-b-2 border-l-2" style={{ borderColor: "#00d4ff" }} />
          <div className="fixed bottom-6 right-6 w-12 h-12 border-b-2 border-r-2" style={{ borderColor: "#00d4ff" }} />

          {/* Center content */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" className="arc-glow mx-auto">
                <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5"
                  strokeDasharray="8 4"
                  style={{ animation: "rotate-ring 4s linear infinite", transformOrigin: "60px 60px" }} />
                <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(0,212,255,0.6)" strokeWidth="1"
                  strokeDasharray="4 8"
                  style={{ animation: "rotate-ring-reverse 3s linear infinite", transformOrigin: "60px 60px" }} />
                <defs>
                  <radialGradient id="bootGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="40%" stopColor="#00d4ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#000810" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="15" fill="url(#bootGrad)" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className="text-4xl font-bold tracking-widest mb-2"
                style={{
                  color: "#00d4ff",
                  textShadow: "0 0 20px #00d4ff, 0 0 40px #00d4ff",
                  letterSpacing: "0.5em",
                }}
              >
                JARVIS
              </div>
              <div className="text-sm tracking-widest opacity-50" style={{ letterSpacing: "0.4em" }}>
                MARK III — ADVANCED AI SYSTEM
              </div>
            </motion.div>
          </div>

          {/* Boot log */}
          <div
            className="w-full max-w-lg font-mono space-y-1 mb-8 px-8"
            style={{ minHeight: 240 }}
          >
            {bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-xs"
              >
                <span style={{ color: "#00ff88" }}>›</span>
                <span style={{ color: line.color }}>{line.text}</span>
                {visibleLines.includes(i) && (
                  <span className="ml-auto" style={{ color: "#00ff88", fontSize: "0.6rem" }}>
                    [OK]
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-lg px-8">
            <div className="flex justify-between text-xs mb-2 opacity-50">
              <span className="tracking-widest">BOOT SEQUENCE</span>
              <span>{progress}%</span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(0,212,255,0.1)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "linear-gradient(90deg, #0066ff, #00d4ff)",
                  boxShadow: "0 0 10px #00d4ff",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
