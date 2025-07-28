import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { penSettingsAtom } from "@/stores/penStore";

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

interface ProcessedPoint {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

function PenPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [penSettings] = useAtom(penSettingsAtom);

  const smoothPoint = (points: DrawingPoint[], index: number): DrawingPoint => {
    if (index === 0 || index === points.length - 1) {
      return points[index];
    }

    const prev = points[index - 1];
    const current = points[index];
    const next = points[index + 1];

    const smoothingFactor = penSettings.smoothing * 0.3;

    return {
      x:
        current.x * (1 - smoothingFactor) +
        (prev.x + next.x) * smoothingFactor * 0.5,
      y:
        current.y * (1 - smoothingFactor) +
        (prev.y + next.y) * smoothingFactor * 0.5,
      pressure: current.pressure,
    };
  };

  const calculateVelocity = (points: DrawingPoint[], index: number): number => {
    if (index === 0) return 0;

    const current = points[index];
    const previous = points[index - 1];

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const timeDiff = (current.timestamp || 0) - (previous.timestamp || 0);
    return timeDiff > 0 ? distance / timeDiff : distance;
  };

  const processPoints = (points: DrawingPoint[]): ProcessedPoint[] => {
    const processed: ProcessedPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      const smoothed = smoothPoint(points, i);
      const velocity = calculateVelocity(points, i);

      let pressure = smoothed.pressure !== undefined ? smoothed.pressure : 0.5;

      const velocityInfluence = Math.min(velocity * 0.01, 0.3);
      pressure = Math.max(0.1, pressure - velocityInfluence);

      let size = penSettings.size * pressure;
      if (penSettings.pressure) {
        size *= 0.5 + pressure * 0.5;
      }

      const alpha = penSettings.opacity * (0.7 + pressure * 0.3);

      processed.push({
        x: smoothed.x,
        y: smoothed.y,
        size: size,
        alpha: Math.min(1, alpha),
      });
    }

    return processed;
  };

  const drawSegment = (
    ctx: CanvasRenderingContext2D,
    p1: ProcessedPoint,
    p2: ProcessedPoint
  ): void => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) return;

    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI * 0.5;

    const avgAlpha = (p1.alpha + p2.alpha) * 0.5;

    const r1 = p1.size * 0.5;
    const r2 = p2.size * 0.5;

    const cos = Math.cos(perpAngle);
    const sin = Math.sin(perpAngle);

    const p1x1 = p1.x + cos * r1;
    const p1y1 = p1.y + sin * r1;
    const p1x2 = p1.x - cos * r1;
    const p1y2 = p1.y - sin * r1;

    const p2x1 = p2.x + cos * r2;
    const p2y1 = p2.y + sin * r2;
    const p2x2 = p2.x - cos * r2;
    const p2y2 = p2.y - sin * r2;

    ctx.globalAlpha = avgAlpha;
    ctx.beginPath();
    ctx.moveTo(p1x1, p1y1);
    ctx.lineTo(p2x1, p2y1);
    ctx.lineTo(p2x2, p2y2);
    ctx.lineTo(p1x2, p1y2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = p1.alpha;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, r1, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderStroke = (
    ctx: CanvasRenderingContext2D,
    processedPoints: ProcessedPoint[]
  ): void => {
    if (processedPoints.length === 0) return;

    ctx.fillStyle = penSettings.color;

    if (processedPoints.length === 1) {
      const point = processedPoints[0];
      ctx.globalAlpha = point.alpha;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    for (let i = 0; i < processedPoints.length - 1; i++) {
      const current = processedPoints[i];
      const next = processedPoints[i + 1];

      drawSegment(ctx, current, next);
    }

    const lastPoint = processedPoints[processedPoints.length - 1];
    ctx.globalAlpha = lastPoint.alpha;
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, lastPoint.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

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

    const points: DrawingPoint[] = [];
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

      points.push({
        x,
        y,
        pressure,
        timestamp: i * 10,
      });
    }

    const processedPoints = processPoints(points);
    renderStroke(ctx, processedPoints);
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
