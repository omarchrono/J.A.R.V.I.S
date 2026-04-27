"use client";
import { useEffect, useRef } from "react";

export default function RadarDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 140;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 8;

    let angle = 0;
    let animFrame: number;

    // Fake blips
    const blips = Array.from({ length: 6 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: 20 + Math.random() * (maxR - 20),
      age: Math.random() * 100,
      brightness: Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Outer rings
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR * i) / 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Cross hairs
      ctx.strokeStyle = "rgba(0,212,255,0.08)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxR * 0.7, cy - maxR * 0.7); ctx.lineTo(cx + maxR * 0.7, cy + maxR * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + maxR * 0.7, cy - maxR * 0.7); ctx.lineTo(cx - maxR * 0.7, cy + maxR * 0.7); ctx.stroke();

      // Draw sweep as arc fill
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, maxR, 0);
      grad.addColorStop(0, "rgba(0,212,255,0.4)");
      grad.addColorStop(0.4, "rgba(0,212,255,0.1)");
      grad.addColorStop(1, "rgba(0,212,255,0)");

      // Draw sweep sector
      for (let sweep = 0; sweep < 90; sweep += 2) {
        const sweepRad = (sweep * Math.PI) / 180;
        const alpha = (1 - sweep / 90) * 0.18;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxR, -sweepRad, -sweepRad + (2 * Math.PI) / 180);
        ctx.lineTo(0, 0);
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Blips
      blips.forEach((blip) => {
        blip.age++;
        const blipAngle = blip.angle;
        const diff = ((angle - blipAngle + Math.PI * 4) % (Math.PI * 2));
        const fade = diff < Math.PI / 2 ? 1 - diff / (Math.PI / 2) : 0;
        if (fade > 0) {
          const bx = cx + blip.r * Math.cos(blipAngle);
          const by = cy + blip.r * Math.sin(blipAngle);
          const grd = ctx.createRadialGradient(bx, by, 0, bx, by, 4);
          grd.addColorStop(0, `rgba(0, 255, 136, ${fade})`);
          grd.addColorStop(1, "rgba(0, 255, 136, 0)");
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00d4ff";
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      angle = (angle + 0.025) % (Math.PI * 2);
      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-full p-1 relative"
        style={{
          border: "1px solid rgba(0,212,255,0.3)",
          boxShadow: "0 0 20px rgba(0,212,255,0.1), inset 0 0 20px rgba(0,212,255,0.05)",
        }}
      >
        <canvas ref={canvasRef} className="rounded-full" />
      </div>
      <div className="text-xs opacity-40 tracking-widest">PROXIMITY SCAN</div>
    </div>
  );
}


