"use client";
import { useEffect, useState } from "react";

interface SysInfo {
  cpu: { model: string; cores: number; speed: number };
  ram: { total: string; used: string; free: string; percent: number };
  uptime: string;
  platform: string;
  hostname: string;
  arch: string;
  loadAvg: string[];
}

function CircularGauge({
  value,
  label,
  color = "#00d4ff",
  size = 80,
}: {
  value: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0,212,255,0.1)"
            strokeWidth="5"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 1s ease",
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color, textShadow: `0 0 8px ${color}` }}
        >
          {value}%
        </div>
      </div>
      <div className="text-xs opacity-60 tracking-widest">{label}</div>
    </div>
  );
}

function StatBar({ label, value, max, color = "#00d4ff", unit = "" }: {
  label: string; value: number; max: number; color?: string; unit?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1 opacity-70">
        <span className="tracking-widest">{label}</span>
        <span style={{ color }}>{value.toFixed(1)}{unit}/{max}{unit}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: "rgba(0,212,255,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function SystemStats() {
  const [info, setInfo] = useState<SysInfo | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/jarvis/sysinfo");
        const data = await res.json();
        setInfo(data);
      } catch {}
    };
    fetchInfo();
    const interval = setInterval(fetchInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const cpuPercent = info ? Math.round(parseFloat(info.loadAvg[0]) * 10) : 0;

  return (
    <div className="jarvis-panel rounded-lg p-4 space-y-4" style={{ minWidth: 220 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-widest opacity-60 uppercase">System Status</div>
        <div className="status-dot" />
      </div>

      {/* Clock */}
      <div className="text-center">
        <div
          className="text-2xl font-bold tracking-widest text-glow"
          style={{ color: "#00d4ff", fontVariantNumeric: "tabular-nums" }}
        >
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>
        <div className="text-xs opacity-40 tracking-widest mt-1">
          {time.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Gauges */}
      {info && (
        <div className="flex justify-around">
          <CircularGauge value={Math.min(99, cpuPercent)} label="CPU" color="#00d4ff" size={72} />
          <CircularGauge value={info.ram.percent} label="RAM" color="#ffd700" size={72} />
          <CircularGauge
            value={Math.min(95, Math.round(parseFloat(info.loadAvg[2]) * 8))}
            label="LOAD"
            color="#00ff88"
            size={72}
          />
        </div>
      )}

      {/* Bars */}
      {info && (
        <div>
          <StatBar
            label="MEMORY"
            value={parseFloat(info.ram.used)}
            max={parseFloat(info.ram.total)}
            color="#ffd700"
            unit="G"
          />
        </div>
      )}

      {/* System info */}
      {info && (
        <div className="space-y-1 text-xs opacity-60 border-t border-cyan-900 pt-3">
          <div className="flex justify-between">
            <span className="tracking-widest">HOST</span>
            <span className="text-cyan-400">{info.hostname.slice(0, 12)}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-widest">ARCH</span>
            <span className="text-cyan-400">{info.arch}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-widest">UPTIME</span>
            <span className="text-cyan-400">{info.uptime}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-widest">CORES</span>
            <span className="text-cyan-400">{info.cpu.cores}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-widest">PLATFORM</span>
            <span className="text-cyan-400">{info.platform}</span>
          </div>
        </div>
      )}

      {!info && (
        <div className="text-center text-xs opacity-40 py-4">
          <div className="typing-dot inline-block w-1 h-3 bg-cyan-400 rounded mx-0.5" />
          <div className="typing-dot inline-block w-1 h-3 bg-cyan-400 rounded mx-0.5" />
          <div className="typing-dot inline-block w-1 h-3 bg-cyan-400 rounded mx-0.5" />
        </div>
      )}
    </div>
  );
}
