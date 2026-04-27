"use client";
import { useEffect, useRef } from "react";

export default function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const hexes: Array<{
      x: number; y: number; size: number; phase: number; speed: number; active: boolean;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      hexes.length = 0;
      const hexSize = 30;
      const w = hexSize * 2;
      const h = Math.sqrt(3) * hexSize;
      for (let row = -1; row < canvas.height / h + 2; row++) {
        for (let col = -1; col < canvas.width / w + 2; col++) {
          const x = col * w * 0.75;
          const y = row * h + (col % 2 === 0 ? 0 : h / 2);
          hexes.push({
            x, y, size: hexSize,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.4,
            active: Math.random() < 0.08,
          });
        }
      }
    };

    const drawHex = (x: number, y: number, size: number, opacity: number, fill = false) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = `rgba(0, 212, 255, ${opacity * 0.08})`;
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      hexes.forEach((hex) => {
        const pulse = (Math.sin(time * hex.speed + hex.phase) + 1) / 2;
        const baseOpacity = 0.03;
        const opacity = hex.active ? baseOpacity + pulse * 0.12 : baseOpacity + pulse * 0.02;
        drawHex(hex.x, hex.y, hex.size - 2, opacity, hex.active);
      });

      animFrame = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
