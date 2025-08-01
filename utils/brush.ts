import * as PIXI from "pixi.js";
import { BrushSettings, BrushTexture } from "@/types/brush";

export class BrushTextureCache {
  private cache = new Map<string, BrushTexture>();
  private maxCacheSize = 50;

  private generateCacheKey(settings: BrushSettings, imageUrl?: string): string {
    return `${settings.size}_${settings.color}_${settings.hardness}_${
      settings.opacity
    }_${settings.roundness}_${settings.angle}_${imageUrl || ""}`;
  }

  get(settings: BrushSettings, imageUrl?: string): BrushTexture | null {
    const key = this.generateCacheKey(settings, imageUrl);
    return this.cache.get(key) || null;
  }

  set(settings: BrushSettings, texture: BrushTexture, imageUrl?: string): void {
    const key = this.generateCacheKey(settings, imageUrl);
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

// 1. 벡터(원/타원/블러) 브러쉬 텍스쳐 생성
export function createBrushTexture(
  app: PIXI.Application,
  settings: BrushSettings
): BrushTexture | null {
  if (!app || !app.renderer) return null;

  try {
    const size = Math.max(2, Math.min(200, settings.size));
    const radius = size / 2;
    let color;
    try {
      color = parseInt(settings.color.replace("#", ""), 16);
      if (isNaN(color)) color = 0x000000;
    } catch (error) {
      color = 0x000000;
    }
    const padding = Math.max(20, Math.ceil(radius * 0.8));
    const textureSize = Math.max(8, size + padding * 2);

    const renderTexture = PIXI.RenderTexture.create({
      width: textureSize,
      height: textureSize,
      resolution: 1,
    });

    const brushGraphics = new PIXI.Graphics();
    if (settings.roundness < 1) {
      const radiusX = radius;
      const radiusY = radius * settings.roundness;
      brushGraphics.beginFill(color, 1);
      brushGraphics.drawEllipse(
        textureSize / 2,
        textureSize / 2,
        radiusX,
        radiusY
      );
      brushGraphics.endFill();
      if (settings.angle !== 0) {
        brushGraphics.pivot.set(textureSize / 2, textureSize / 2);
        brushGraphics.rotation = (settings.angle * Math.PI) / 180;
        brushGraphics.x = textureSize / 2;
        brushGraphics.y = textureSize / 2;
      }
    } else {
      brushGraphics.beginFill(color, 1);
      brushGraphics.drawCircle(textureSize / 2, textureSize / 2, radius);
      brushGraphics.endFill();
    }
    if (settings.hardness < 0.98) {
      const blurAmount = (1 - settings.hardness) * radius * 0.3;
      try {
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = Math.max(0.5, Math.min(10, blurAmount));
        blurFilter.quality = 1;
        brushGraphics.filters = [blurFilter];
      } catch (error) {
        console.warn("Blur filter creation failed:", error);
      }
    }
    // clear 옵션 없이 사용
    app.renderer.render({ container: brushGraphics, target: renderTexture });
    brushGraphics.destroy();

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.anchor.set(0.5, 0.5);
    return {
      texture: renderTexture,
      sprite,
      size,
      color: settings.color,
      hardness: settings.hardness,
      opacity: settings.opacity,
    };
  } catch (error) {
    console.error("Failed to create brush texture:", error);
    return null;
  }
}

// 2. 이미지 브러쉬 (PNG/JPG 등) 생성
export async function createImageBrushTexture(
  app: PIXI.Application,
  imageUrl: string,
  settings: BrushSettings
): Promise<BrushTexture | null> {
  try {
    const { size, opacity, color, hardness } = settings;
    // baseTexture 로드
    const baseTexture = await PIXI.Assets.load(imageUrl);
    // 원본 이미지 비율 유지
    const origW = baseTexture.width;
    const origH = baseTexture.height;
    let scale = 1;
    if (origW > origH) {
      scale = size / origW;
    } else {
      scale = size / origH;
    }
    const sprite = new PIXI.Sprite(baseTexture);
    sprite.anchor.set(0.5);
    sprite.scale.set(scale, scale); // 원본 비율 유지하며 size 맞춤
    sprite.x = size / 2;
    sprite.y = size / 2;
    sprite.alpha = opacity;

    // 색상(Tint) 반영
    if (color && color.startsWith("#")) {
      const tintVal = parseInt(color.replace("#", ""), 16);
      if (!isNaN(tintVal)) {
        sprite.tint = tintVal;
      }
    }

    // 부드러움(하드니스) 적용: BlurFilter 적용
    if (hardness !== undefined && hardness < 0.98) {
      const blurStrength = (1 - hardness) * size * 0.2;
      try {
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = Math.max(2, Math.min(40, blurStrength));
        blurFilter.quality = 4;
        sprite.filters = [blurFilter];
      } catch (error) {
        console.warn("Blur filter creation failed:", error);
      }
    }

    // 렌더 타겟을 브러쉬 '사이즈'만큼 정사각형으로!
    const renderTexture = PIXI.RenderTexture.create({
      width: size,
      height: size,
      resolution: 1,
    });
    // clear 옵션 없이 사용
    app.renderer.render({ container: sprite, target: renderTexture });
    sprite.destroy();

    return {
      texture: renderTexture,
      sprite: new PIXI.Sprite(renderTexture),
      size,
      color: color,
      hardness,
      opacity,
    };
  } catch (e) {
    console.error("이미지 브러쉬 텍스처 생성 실패:", e);
    return null;
  }
}

export function applyGammaCorrection(opacity: number): number {
  return opacity;
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

// 3. 브러쉬(벡터/이미지 공통) 스탬프 함수
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
    stamp.alpha = Math.max(0, Math.min(1, settings.opacity));
    if (settings.color && settings.color.startsWith("#")) {
      const tintVal = parseInt(settings.color.replace("#", ""), 16);
      if (!isNaN(tintVal)) {
        stamp.tint = tintVal;
      }
    }
    stamp.scale.set(1, 1);
    container.addChild(stamp);
  } catch (error) {
    console.warn("Failed to create brush stamp:", error);
  }
}

export function cleanupBrushTextures(): void {
  brushTextureCache.clear();
}
