import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptime = os.uptime();

  const uptimeStr = (() => {
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    return `${h}h ${m}m`;
  })();

  return NextResponse.json({
    cpu: {
      model: cpus[0]?.model || "Unknown",
      cores: cpus.length,
      speed: cpus[0]?.speed || 0,
    },
    ram: {
      total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
      used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
      free: (freeMem / 1024 / 1024 / 1024).toFixed(2),
      percent: Math.round((usedMem / totalMem) * 100),
    },
    uptime: uptimeStr,
    platform: os.platform(),
    hostname: os.hostname(),
    arch: os.arch(),
    loadAvg: os.loadavg().map((v) => v.toFixed(2)),
  });
}
