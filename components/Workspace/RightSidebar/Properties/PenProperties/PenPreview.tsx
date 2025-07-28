import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { penSettingsAtom } from "@/stores/penStore";

function PenPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [penSettings] = useAtom(penSettingsAtom);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = penSettings.color;
    ctx.globalAlpha = penSettings.opacity;

    const startX = width * 0.15;
    const endX = width * 0.85;
    const centerY = height * 0.5;
    const amplitude = height * 0.25;

    const points: Array<{ x: number; y: number; size: number }> = [];
    const steps = 120;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;

      const sineWave = Math.sin(t * Math.PI * 2.5) * amplitude;
      const y = centerY + sineWave * (1 - Math.abs(t - 0.5) * 1.5);

      let size = penSettings.size;

      if (t < 0.05) {
        size *= Math.max(0.8, t / 0.05);
      } else if (t > 0.95) {
        size *= Math.max(0.8, (1 - t) / 0.05);
      }

      const velocity = Math.abs(Math.cos(t * Math.PI * 2.5) * 2);
      size *= Math.max(0.9, 1 - velocity * 0.1);

      points.push({ x, y, size: Math.max(penSettings.size * 0.8, size) });
    }

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [penSettings]);

  return (
    <div className="bg-neutral-700 rounded-lg p-3">
      <label className="text-xs text-neutral-400 block mb-2">미리보기</label>
      <div className="flex items-center justify-center h-16 bg-white rounded relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={64}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default PenPreview;
