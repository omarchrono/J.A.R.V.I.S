"use client";
import { useEffect, useState } from "react";

export default function ArcReactor({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const rings = [
    { r: 80, dash: "8 4", dur: "4s", dir: "normal", stroke: "rgba(0,212,255,0.8)", w: 2 },
    { r: 65, dash: "4 8", dur: "6s", dir: "reverse", stroke: "rgba(0,102,255,0.6)", w: 1.5 },
    { r: 50, dash: "12 3", dur: "3s", dir: "normal", stroke: "rgba(0,212,255,0.5)", w: 2 },
    { r: 35, dash: "3 6", dur: "5s", dir: "reverse", stroke: "rgba(0,212,255,0.4)", w: 1 },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer pulse rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 200 + i * 20,
            height: 200 + i * 20,
            borderColor: `rgba(0,212,255,${0.15 / i})`,
            animation: `pulse-ring ${1.5 + i * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      <svg width="200" height="200" viewBox="0 0 200 200" className="arc-glow">
        {/* Hex grid lines */}
        <polygon
          points="100,20 168,60 168,140 100,180 32,140 32,60"
          fill="none"
          stroke="rgba(0,212,255,0.1)"
          strokeWidth="1"
        />

        {/* Rotating rings */}
        {rings.map((ring, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={ring.r}
            fill="none"
            stroke={ring.stroke}
            strokeWidth={ring.w}
            strokeDasharray={ring.dash}
            style={{
              transformOrigin: "100px 100px",
              animation: `${ring.dir === "reverse" ? "rotate-ring-reverse" : "rotate-ring"} ${ring.dur} linear infinite`,
            }}
          />
        ))}

        {/* Core glow */}
        <defs>
          <radialGradient id="arcGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0066ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000810" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity={active ? "0.6" : "0.2"} />
            <stop offset="100%" stopColor="#000810" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="22" fill="url(#arcGrad)" />
        <circle cx="100" cy="100" r="30" fill="url(#pulseGrad)" />

        {/* Inner detail lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={100 + 22 * Math.cos(angle)}
              y1={100 + 22 * Math.sin(angle)}
              x2={100 + 30 * Math.cos(angle)}
              y2={100 + 30 * Math.sin(angle)}
              stroke="rgba(0,212,255,0.6)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const r1 = i % 6 === 0 ? 72 : i % 3 === 0 ? 74 : 76;
          const r2 = 78;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(angle)}
              y1={100 + r1 * Math.sin(angle)}
              x2={100 + r2 * Math.cos(angle)}
              y2={100 + r2 * Math.sin(angle)}
              stroke={`rgba(0,212,255,${i % 6 === 0 ? 0.8 : 0.3})`}
              strokeWidth={i % 6 === 0 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Data readout dots */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = ((i * 45 + tick * 3) * Math.PI) / 180;
          const r = 55;
          return (
            <circle
              key={i}
              cx={100 + r * Math.cos(angle)}
              cy={100 + r * Math.sin(angle)}
              r={i % 2 === 0 ? 2 : 1}
              fill={`rgba(0,212,255,${i % 4 === 0 ? 1 : 0.4})`}
            />
          );
        })}
      </svg>

      {/* Center logo text */}
      <div
        className="absolute text-center"
        style={{
          textShadow: "0 0 10px #00d4ff, 0 0 20px #00d4ff",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#00d4ff", opacity: 0.8 }}>
          MARK
        </div>
        <div style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 2, color: "#fff" }}>
          III
        </div>
      </div>
    </div>
  );
}
