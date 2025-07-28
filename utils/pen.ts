import * as PIXI from "pixi.js";
import { getStroke } from "perfect-freehand";
import { PenSettings, PenTexture } from "@/types/pen";

export class PenTextureCache {
  private cache = new Map<string, PenTexture>();
  private maxCacheSize = 30;

  private generateCacheKey(settings: PenSettings): string {
    return `${settings.size}_${settings.color}_${settings.opacity}`;
  }

  get(settings: PenSettings): PenTexture | null {
    const key = this.generateCacheKey(settings);
    return this.cache.get(key) || null;
  }

  set(settings: PenSettings, texture: PenTexture): void {
    const key = this.generateCacheKey(settings);

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      const oldTexture = this.cache.get(firstKey!);
      if (oldTexture) {
        oldTexture.texture?.destroy();
        oldTexture.sprite?.destroy();
      }
      this.cache.delete(firstKey!);
    }

    this.cache.set(key, texture);
  }

  clear(): void {
    this.cache.forEach((texture) => {
      texture.texture?.destroy();
      texture.sprite?.destroy();
    });
    this.cache.clear();
  }
}

export const penTextureCache = new PenTextureCache();

export function createPenTexture(
  app: PIXI.Application,
  settings: PenSettings
): PenTexture | null {
  if (!app || !app.renderer) return null;

  try {
    const size = Math.max(1, Math.min(50, settings.size));
    const radius = size / 2;

    let color;
    try {
      color = parseInt(settings.color.replace("#", ""), 16);
      if (isNaN(color)) color = 0x000000;
    } catch (error) {
      color = 0x000000;
    }

    const padding = Math.max(4, Math.ceil(radius * 0.2));
    const textureSize = Math.max(4, size + padding * 2);

    const renderTexture = PIXI.RenderTexture.create({
      width: textureSize,
      height: textureSize,
      resolution: 1,
    });

    const penGraphics = new PIXI.Graphics();
    penGraphics.beginFill(color, 1);
    penGraphics.drawCircle(textureSize / 2, textureSize / 2, radius);
    penGraphics.endFill();

    app.renderer.render(penGraphics, { renderTexture });
    penGraphics.destroy();

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.anchor.set(0.5, 0.5);

    const texture: PenTexture = {
      texture: renderTexture,
      sprite,
      size,
      color: settings.color,
      opacity: settings.opacity,
    };

    return texture;
  } catch (error) {
    console.error("Failed to create pen texture:", error);
    return null;
  }
}

export function createSmoothStroke(
  points: number[][],
  settings: PenSettings
): number[][] {
  const options = {
    size: settings.size * 4,
    thinning: settings.pressure ? 0.6 : 0,
    smoothing: settings.smoothing,
    streamline: 0.5,
    easing: (t: number) => t,
    start: {
      taper: 0,
      easing: (t: number) => t,
    },
    end: {
      taper: points.length < 10 ? 0 : 20,
      easing: (t: number) => t,
    },
  };

  return getStroke(points, options);
}

export function renderStrokeToGraphics(
  stroke: number[][],
  color: string,
  opacity: number
): PIXI.Graphics {
  const graphics = new PIXI.Graphics();

  if (stroke.length === 0) return graphics;

  const colorValue = parseInt(color.replace("#", ""), 16);
  graphics.beginFill(colorValue, opacity);

  graphics.moveTo(stroke[0][0], stroke[0][1]);
  for (let i = 1; i < stroke.length; i++) {
    graphics.lineTo(stroke[i][0], stroke[i][1]);
  }
  graphics.closePath();
  graphics.endFill();

  return graphics;
}

export function calculatePenSpacing(size: number): number {
  return Math.max(0.5, size * 0.1);
}

export function interpolatePenStroke(
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

export function smoothPenPath(
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
      current.x + (prev.x + next.x - 2 * current.x) * smoothing * 0.3;
    const smoothedY =
      current.y + (prev.y + next.y - 2 * current.y) * smoothing * 0.3;

    smoothed.push({ x: smoothedX, y: smoothedY });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function cleanupPenTextures(): void {
  penTextureCache.clear();
}
