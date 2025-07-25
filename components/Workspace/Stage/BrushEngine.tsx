import * as PIXI from "pixi.js";
import { BrushSettings, BrushTexture } from "@/types/brush";
import {
  createBrushTexture,
  interpolateStroke,
  smoothPath,
  calculateSpacing,
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
    this.updateBrushTexture();
  }

  public updateSettings(newSettings: BrushSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };

    if (settingsChanged && !this.isDrawing) {
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

    this.drawPoint(point);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.activeLayer) return;

    const currentPoint = { ...point, timestamp: Date.now() };
    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);

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
    if (this.isDrawing) {
      return;
    }

    try {
      if (this.brushTexture?.texture) {
        this.brushTexture.texture.destroy();
        this.brushTexture = null;
      }

      requestAnimationFrame(() => {
        this.brushTexture = createBrushTexture(this.app, this.settings);
        if (!this.brushTexture) {
          console.error("Failed to create brush texture");
        }
      });
    } catch (error) {
      console.error("Error updating brush texture:", error);
      this.brushTexture = null;
    }
  }

  private drawPoint(point: DrawingPoint): void {
    if (!this.brushTexture?.texture || !this.activeLayer) {
      return;
    }

    try {
      const stamp = new PIXI.Sprite(this.brushTexture.texture);
      stamp.anchor.set(0.5, 0.5);
      stamp.x = point.x;
      stamp.y = point.y;
      if (this.settings.opacity > 0.9) {
        stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));
      } else if (this.settings.opacity === 0) {
        stamp.alpha = 0;
      } else {
        stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity / 10));
      }

      if (this.settings.pressure && point.pressure !== undefined) {
        const pressureScale = Math.max(0.1, point.pressure);
        stamp.scale.set(pressureScale, pressureScale);
      }

      this.activeLayer.addChild(stamp);
    } catch (error) {
      console.warn("Failed to draw point:", error);
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
    if (this.brushTexture?.texture) {
      this.brushTexture.texture.destroy();
    }
    this.brushTexture = null;
    this.activeLayer = null;
  }

  public getBrushPreview(): HTMLCanvasElement | null {
    try {
      const canvas = document.createElement("canvas");
      const size = Math.min(this.settings.size, 100);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

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

  public adjustBrushSize(delta: number): void {
    const newSize = Math.max(1, Math.min(200, this.settings.size + delta));
    this.updateSettings({ ...this.settings, size: newSize });
  }

  public adjustBrushHardness(delta: number): void {
    const newHardness = Math.max(
      0,
      Math.min(1, this.settings.hardness + delta)
    );
    this.updateSettings({ ...this.settings, hardness: newHardness });
  }

  public adjustBrushOpacity(delta: number): void {
    const newOpacity = Math.max(0, Math.min(1, this.settings.opacity + delta));
    this.updateSettings({ ...this.settings, opacity: newOpacity });
  }
}
