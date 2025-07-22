import * as PIXI from "pixi.js";
import { BrushSettings, BrushTexture } from "@/types/brush";
import {
  createBrushTexture,
  createBrushStamp,
  interpolateStroke,
  smoothPath,
  calculateSpacing,
  brushTextureCache,
} from "@/utils/brush";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export class BrushEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private lastPoint: DrawingPoint | null = null;
  private currentStroke: DrawingPoint[] = [];
  private brushTexture: BrushTexture | null = null;
  private settings: BrushSettings;
  private activeLayer: PIXI.Container | null = null;
  private strokePath: DrawingPoint[] = [];

  constructor(app: PIXI.Application, initialSettings: BrushSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public updateSettings(newSettings: BrushSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };

    if (settingsChanged) {
      this.updateBrushTexture();
    }
  }

  public setActiveLayer(layer: PIXI.Container): void {
    this.activeLayer = layer;
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer) {
      console.warn("No active layer set for drawing");
      return;
    }

    this.isDrawing = true;
    this.lastPoint = { ...point, timestamp: Date.now() };
    this.currentStroke = [this.lastPoint];
    this.strokePath = [this.lastPoint];

    // 첫 번째 점 그리기
    this.drawPoint(point);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.activeLayer) return;

    const currentPoint = { ...point, timestamp: Date.now() };
    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);

    // 스무딩 적용
    if (this.settings.smoothing > 0 && this.strokePath.length > 2) {
      const smoothedPath = smoothPath(
        this.strokePath.slice(-3),
        this.settings.smoothing
      );
      if (smoothedPath.length > 1) {
        const smoothedPoint = smoothedPath[smoothedPath.length - 2];
        this.drawInterpolatedLine(this.lastPoint, smoothedPoint);
        this.lastPoint = smoothedPoint;
        return;
      }
    }

    // 일반 보간 그리기
    this.drawInterpolatedLine(this.lastPoint, currentPoint);
    this.lastPoint = currentPoint;
  }

  public endStroke(): void {
    this.isDrawing = false;
    this.lastPoint = null;
    this.currentStroke = [];
    this.strokePath = [];
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  private hasSettingsChanged(
    oldSettings: BrushSettings,
    newSettings: BrushSettings
  ): boolean {
    const relevantProps: (keyof BrushSettings)[] = [
      "size",
      "color",
      "hardness",
      "roundness",
      "angle",
    ];
    return relevantProps.some(
      (prop) => oldSettings[prop] !== newSettings[prop]
    );
  }

  private updateBrushTexture(): void {
    try {
      this.brushTexture = createBrushTexture(this.app, this.settings);
      if (!this.brushTexture) {
        console.error("Failed to create brush texture");
      }
    } catch (error) {
      console.error("Error updating brush texture:", error);
      this.brushTexture = null;
    }
  }

  private drawPoint(point: DrawingPoint): void {
    if (!this.brushTexture) {
      this.updateBrushTexture();
    }

    if (this.brushTexture && this.activeLayer && this.brushTexture.texture) {
      // 새로운 Sprite 생성
      const stamp = new PIXI.Sprite(this.brushTexture.texture);
      stamp.anchor.set(0.5, 0.5);
      stamp.x = point.x;
      stamp.y = point.y;

      // 플로우와 오패시티 적용
      const finalOpacity = this.settings.opacity * this.settings.flow;
      stamp.alpha = finalOpacity;

      // 압력 감지가 활성화되어 있다면 크기 조절
      if (this.settings.pressure && point.pressure !== undefined) {
        const pressureScale = Math.max(0.1, point.pressure);
        stamp.scale.set(pressureScale, pressureScale);
      }

      this.activeLayer.addChild(stamp);
    }
  }

  private drawInterpolatedLine(start: DrawingPoint, end: DrawingPoint): void {
    const spacing = calculateSpacing(this.settings.size, this.settings.spacing);
    const points = interpolateStroke(start.x, start.y, end.x, end.y, spacing);

    points.forEach((point) => {
      this.drawPoint(point);
    });
  }

  public cleanup(): void {
    this.endStroke();
    this.brushTexture = null;
    this.activeLayer = null;
  }

  public getBrushPreview(): HTMLCanvasElement | null {
    if (!this.brushTexture?.texture) return null;

    try {
      const canvas = document.createElement("canvas");
      const size = Math.min(this.settings.size, 100);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // 간단한 미리보기 그리기
      ctx.fillStyle = this.settings.color;
      ctx.globalAlpha = this.settings.opacity;

      const radius = size / 2;
      const radiusX = radius;
      const radiusY = radius * this.settings.roundness;

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate((this.settings.angle * Math.PI) / 180);
      ctx.scale(radiusX / radius, radiusY / radius);

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fill();

      if (this.settings.hardness < 0.99) {
        ctx.filter = `blur(${(1 - this.settings.hardness) * 5}px)`;
      }

      ctx.restore();

      return canvas;
    } catch (error) {
      console.error("Failed to generate brush preview:", error);
      return null;
    }
  }

  // 브러쉬 크기 조절 (단축키 지원용)
  public adjustBrushSize(delta: number): void {
    const newSize = Math.max(1, Math.min(200, this.settings.size + delta));
    this.updateSettings({ ...this.settings, size: newSize });
  }

  // 브러쉬 경도 조절 (단축키 지원용)
  public adjustBrushHardness(delta: number): void {
    const newHardness = Math.max(
      0,
      Math.min(1, this.settings.hardness + delta)
    );
    this.updateSettings({ ...this.settings, hardness: newHardness });
  }

  // 브러쉬 불투명도 조절 (단축키 지원용)
  public adjustBrushOpacity(delta: number): void {
    const newOpacity = Math.max(0, Math.min(1, this.settings.opacity + delta));
    this.updateSettings({ ...this.settings, opacity: newOpacity });
  }
}
