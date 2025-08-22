import * as PIXI from "pixi.js";

export function interpolateStroke(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  spacing: number
): Array<{ x: number; y: number; pressure?: number }> {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const steps = Math.max(1, Math.ceil(distance / spacing));
  const points: Array<{ x: number; y: number; pressure?: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    points.push({ x, y });
  }

  return points;
}

export function smoothPath(
  points: Array<{ x: number; y: number }>,
  smoothing: number
): Array<{ x: number; y: number }> {
  if (points.length < 3 || smoothing === 0) return points;

  const smoothed: Array<{ x: number; y: number }> = [];
  smoothed.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    const smoothedX =
      current.x + (prev.x + next.x - 2 * current.x) * smoothing * 0.5;
    const smoothedY =
      current.y + (prev.y + next.y - 2 * current.y) * smoothing * 0.5;

    smoothed.push({ x: smoothedX, y: smoothedY });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function calculateSpacing(size: number, spacing: number): number {
  const effectiveSpacing = Math.min(spacing, 0.5);
  return Math.max(1, size * effectiveSpacing);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle > Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

export function catmullRomSpline(
  points: Array<{ x: number; y: number }>,
  tension: number = 0.5,
  numSegments: number = 10
): Array<{ x: number; y: number }> {
  if (points.length < 4) return points;

  const result: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < points.length - 3; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    const p3 = points[i + 3];

    for (let j = 0; j < numSegments; j++) {
      const t = j / numSegments;
      const t2 = t * t;
      const t3 = t2 * t;

      const v0 = -tension * t3 + 2 * tension * t2 - tension * t;
      const v1 = (2 - tension) * t3 + (tension - 3) * t2 + 1;
      const v2 = (tension - 2) * t3 + (3 - 2 * tension) * t2 + tension * t;
      const v3 = tension * t3 - tension * t2;

      const x = p0.x * v0 + p1.x * v1 + p2.x * v2 + p3.x * v3;
      const y = p0.y * v0 + p1.y * v1 + p2.y * v2 + p3.y * v3;

      result.push({ x, y });
    }
  }

  result.push(points[points.length - 2]);
  result.push(points[points.length - 1]);

  return result;
}

export function pressureCurve(pressure: number, curve: number): number {
  if (curve === 0) return pressure;
  if (curve > 0) {
    return Math.pow(pressure, 1 + curve);
  } else {
    return 1 - Math.pow(1 - pressure, 1 - curve);
  }
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const normalized = (value - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

export function easeInOut(
  t: number,
  type: "linear" | "quad" | "cubic" | "expo" = "quad"
): number {
  switch (type) {
    case "linear":
      return t;
    case "quad":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case "cubic":
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case "expo":
      return t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    default:
      return t;
  }
}

export class DabTextureCache {
  private cache = new Map<string, PIXI.Texture>();
  private maxCacheSize = 200;

  private generateCacheKey(
    radius: number,
    hardness: number,
    roundness: number,
    angle: number
  ): string {
    return `${Math.round(radius)}_${Math.round(hardness * 100)}_${Math.round(
      roundness * 100
    )}_${Math.round(angle)}`;
  }

  get(
    radius: number,
    hardness: number,
    roundness: number,
    angle: number
  ): PIXI.Texture | null {
    const key = this.generateCacheKey(radius, hardness, roundness, angle);
    return this.cache.get(key) || null;
  }

  set(
    radius: number,
    hardness: number,
    roundness: number,
    angle: number,
    texture: PIXI.Texture
  ): void {
    const key = this.generateCacheKey(radius, hardness, roundness, angle);

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      const oldTexture = this.cache.get(firstKey!);
      oldTexture?.destroy();
      this.cache.delete(firstKey!);
    }

    this.cache.set(key, texture);
  }

  clear(): void {
    this.cache.forEach((texture) => {
      texture.destroy();
    });
    this.cache.clear();
  }
}

export const dabTextureCache = new DabTextureCache();

export function velocityFilter(
  currentVelocity: number,
  targetVelocity: number,
  slowness: number,
  dt: number
): number {
  if (slowness <= 0) return targetVelocity;
  const factor = 1 - Math.exp(-dt / slowness);
  return currentVelocity + (targetVelocity - currentVelocity) * factor;
}

export function directionFilter(
  currentDirection: number,
  targetDirection: number,
  filterStrength: number
): number {
  if (filterStrength <= 0) return targetDirection;

  let diff = targetDirection - currentDirection;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;

  const factor = 1 / (1 + filterStrength);
  return currentDirection + diff * factor;
}

export function strokeInputMapping(
  strokeProgress: number,
  points: Array<[number, number]>
): number {
  if (points.length < 2) return strokeProgress;

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];

    if (strokeProgress >= x1 && strokeProgress <= x2) {
      const t = (strokeProgress - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }

  return points[points.length - 1][1];
}
