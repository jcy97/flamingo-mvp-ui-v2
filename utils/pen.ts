import * as PIXI from "pixi.js";
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

export function calculatePenWidth(
  baseSize: number,
  velocity: number,
  pressure: number = 1.0,
  isStart: boolean = false,
  isEnd: boolean = false,
  totalProgress: number = 0.5
): number {
  let width = baseSize;

  const velocityFactor = Math.max(0.3, Math.min(1.5, 1.0 - velocity * 0.02));
  width *= velocityFactor;

  width *= pressure;

  if (isStart) {
    const taperFactor = Math.min(1.0, totalProgress * 8);
    width *= taperFactor;
  }

  if (isEnd) {
    const taperFactor = Math.max(0.1, 1.0 - (totalProgress - 0.8) * 5);
    width *= taperFactor;
  }

  return Math.max(0.1, width);
}

export function createTaperedStroke(
  points: Array<{ x: number; y: number; velocity?: number; pressure?: number }>,
  baseSize: number,
  color: string,
  opacity: number
): PIXI.Graphics {
  const graphics = new PIXI.Graphics();

  if (points.length < 2) return graphics;

  const colorValue = parseInt(color.replace("#", ""), 16);

  const strokePoints: Array<{ x: number; y: number; width: number }> = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const progress = i / (points.length - 1);

    let width = baseSize;

    if (i < 5) {
      width *= (i + 1) / 5;
    } else if (i > points.length - 6) {
      const remainingPoints = points.length - i;
      width *= remainingPoints / 5;
    }

    const velocity = point.velocity || 0;
    const velocityFactor = Math.max(0.5, Math.min(1.2, 1.0 - velocity * 0.01));
    width *= velocityFactor;

    const pressure = point.pressure || 1.0;
    width *= pressure;

    width = Math.max(0.2, width);

    strokePoints.push({ x: point.x, y: point.y, width });
  }

  graphics.beginFill(colorValue, opacity);

  if (strokePoints.length === 1) {
    const point = strokePoints[0];
    graphics.drawCircle(point.x, point.y, point.width / 2);
  } else {
    const leftSide: Array<{ x: number; y: number }> = [];
    const rightSide: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < strokePoints.length; i++) {
      const current = strokePoints[i];

      let nx = 0,
        ny = 0;

      if (i === 0 && strokePoints.length > 1) {
        const next = strokePoints[i + 1];
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          nx = -dy / len;
          ny = dx / len;
        }
      } else if (i === strokePoints.length - 1) {
        const prev = strokePoints[i - 1];
        const dx = current.x - prev.x;
        const dy = current.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          nx = -dy / len;
          ny = dx / len;
        }
      } else {
        const prev = strokePoints[i - 1];
        const next = strokePoints[i + 1];
        const dx1 = current.x - prev.x;
        const dy1 = current.y - prev.y;
        const dx2 = next.x - current.x;
        const dy2 = next.y - current.y;

        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        let avgNx = 0,
          avgNy = 0;
        if (len1 > 0) {
          avgNx += -dy1 / len1;
          avgNy += dx1 / len1;
        }
        if (len2 > 0) {
          avgNx += -dy2 / len2;
          avgNy += dx2 / len2;
        }

        const avgLen = Math.sqrt(avgNx * avgNx + avgNy * avgNy);
        if (avgLen > 0) {
          nx = avgNx / avgLen;
          ny = avgNy / avgLen;
        }
      }

      const halfWidth = current.width / 2;
      leftSide.push({
        x: current.x + nx * halfWidth,
        y: current.y + ny * halfWidth,
      });
      rightSide.push({
        x: current.x - nx * halfWidth,
        y: current.y - ny * halfWidth,
      });
    }

    if (leftSide.length > 0 && rightSide.length > 0) {
      graphics.moveTo(leftSide[0].x, leftSide[0].y);

      for (let i = 0; i < leftSide.length; i++) {
        graphics.lineTo(leftSide[i].x, leftSide[i].y);
      }

      for (let i = rightSide.length - 1; i >= 0; i--) {
        graphics.lineTo(rightSide[i].x, rightSide[i].y);
      }

      graphics.closePath();
    }
  }

  graphics.endFill();
  return graphics;
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
