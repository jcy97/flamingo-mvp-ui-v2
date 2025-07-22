import * as PIXI from "pixi.js";
import { BrushSettings, BrushTexture } from "@/types/brush";

export class BrushTextureCache {
  private cache = new Map<string, BrushTexture>();
  private maxCacheSize = 50;

  private generateCacheKey(settings: BrushSettings): string {
    return `${settings.size}_${settings.color}_${settings.hardness}_${settings.opacity}_${settings.roundness}_${settings.angle}`;
  }

  get(settings: BrushSettings): BrushTexture | null {
    const key = this.generateCacheKey(settings);
    return this.cache.get(key) || null;
  }

  set(settings: BrushSettings, texture: BrushTexture): void {
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

export const brushTextureCache = new BrushTextureCache();

export function createBrushTexture(
  app: PIXI.Application,
  settings: BrushSettings
): BrushTexture | null {
  if (!app || !app.renderer) return null;

  // 캐시에서 먼저 확인
  const cached = brushTextureCache.get(settings);
  if (cached) return cached;

  const size = Math.max(2, settings.size);
  const radius = size / 2;

  let color;
  try {
    color = parseInt(settings.color.replace("#", ""), 16);
    if (isNaN(color)) color = 0x000000;
  } catch (error) {
    color = 0x000000;
  }

  // 브러쉬 Graphics 생성
  const brushGraphics = new PIXI.Graphics();

  if (settings.roundness < 1) {
    // 타원형 브러쉬
    const radiusX = radius;
    const radiusY = radius * settings.roundness;

    brushGraphics.beginFill(color);
    brushGraphics.drawEllipse(radius, radius, radiusX, radiusY);
    brushGraphics.endFill();

    if (settings.angle !== 0) {
      brushGraphics.rotation = (settings.angle * Math.PI) / 180;
    }
  } else {
    // 원형 브러쉬
    brushGraphics.beginFill(color);
    brushGraphics.drawCircle(radius, radius, radius);
    brushGraphics.endFill();
  }

  // 부드러움 적용
  if (settings.hardness < 0.98) {
    const blurAmount = (1 - settings.hardness) * radius * 0.5;
    try {
      const blurFilter = new PIXI.BlurFilter();
      blurFilter.blur = Math.max(0.1, blurAmount);
      blurFilter.quality = 2;
      brushGraphics.filters = [blurFilter];
    } catch (error) {
      console.warn("Blur filter creation failed:", error);
    }
  }

  // RenderTexture에 브러쉬 렌더링
  const padding = Math.max(10, Math.ceil(radius * 0.5));
  const textureSize = Math.max(4, size + padding * 2);

  try {
    const renderTexture = PIXI.RenderTexture.create({
      width: textureSize,
      height: textureSize,
    });

    brushGraphics.x = padding;
    brushGraphics.y = padding;

    app.renderer.render(brushGraphics, { renderTexture });

    // 재사용할 Sprite 생성
    const sprite = new PIXI.Sprite(renderTexture);
    sprite.anchor.set(0.5, 0.5);

    const texture: BrushTexture = {
      texture: renderTexture,
      sprite,
      size,
      color: settings.color,
      hardness: settings.hardness,
      opacity: settings.opacity,
    };

    // 캐시에 저장
    brushTextureCache.set(settings, texture);

    // 임시 Graphics 정리
    brushGraphics.destroy();

    return texture;
  } catch (error) {
    console.error("브러쉬 텍스처 생성 실패:", error);
    brushGraphics.destroy();
    return null;
  }
}

export function applyGammaCorrection(opacity: number): number {
  const gamma = 2.2;
  const minVisible = 0.07;
  return minVisible + (1 - minVisible) * Math.pow(opacity, gamma);
}

export function calculateSpacing(size: number, spacing: number): number {
  const effectiveSpacing = Math.min(spacing, 0.5);
  return Math.max(1, size * effectiveSpacing);
}

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

export function createBrushStamp(
  container: PIXI.Container,
  x: number,
  y: number,
  brushTexture: BrushTexture,
  settings: BrushSettings
): void {
  if (!brushTexture.texture) return;

  try {
    const stamp = new PIXI.Sprite(brushTexture.texture);
    stamp.anchor.set(0.5, 0.5);
    stamp.x = x;
    stamp.y = y;

    // 플로우와 오패시티 적용
    const finalOpacity = settings.opacity * settings.flow;
    stamp.alpha = Math.max(0, Math.min(1, finalOpacity));

    // 압력 감지가 활성화되어 있다면 추가 처리 가능
    if (settings.pressure) {
      // 압력에 따른 크기 조절 등 (현재는 기본값)
      stamp.scale.set(1, 1);
    }

    container.addChild(stamp);
  } catch (error) {
    console.warn("Failed to create brush stamp:", error);
  }
}

export function cleanupBrushTextures(): void {
  brushTextureCache.clear();
}
