import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { getStroke } from "perfect-freehand";
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

    const startX = width * 0.15;
    const endX = width * 0.85;
    const centerY = height * 0.5;
    const amplitude = height * 0.25;

    const points: number[][] = [];
    const steps = 80;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;

      const sineWave = Math.sin(t * Math.PI * 2.5) * amplitude;
      const y = centerY + sineWave * (1 - Math.abs(t - 0.5) * 1.5);

      let pressure = 0.5;
      if (penSettings.pressure) {
        if (t < 0.1) {
          pressure = t * 5;
        } else if (t > 0.9) {
          pressure = (1 - t) * 10;
        } else {
          const velocity = Math.abs(Math.cos(t * Math.PI * 2.5));
          pressure = Math.max(0.2, 0.8 - velocity * 0.3);
        }
      }

      points.push([x, y, pressure]);
    }

    const options = {
      size: penSettings.size * 3,
      thinning: penSettings.pressure ? 0.6 : 0,
      smoothing: penSettings.smoothing,
      streamline: 0.5,
      easing: (t: number) => t,
      start: {
        taper: 0,
        easing: (t: number) => t,
      },
      end: {
        taper: 20,
        easing: (t: number) => t,
      },
    };

    const stroke = getStroke(points, options);

    if (stroke.length > 0) {
      ctx.fillStyle = penSettings.color;
      ctx.globalAlpha = penSettings.opacity;
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0], stroke[i][1]);
      }
      ctx.closePath();
      ctx.fill();
    }
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
