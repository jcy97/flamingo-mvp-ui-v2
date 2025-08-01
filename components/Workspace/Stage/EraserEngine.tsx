import * as PIXI from "pixi.js";
import { EraserSettings } from "@/types/eraser";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export class EraserEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private lastPoint: DrawingPoint | null = null;
  private currentStroke: DrawingPoint[] = [];
  private settings: EraserSettings;
  private activeLayer: PIXI.Container | null = null;
  private strokePath: DrawingPoint[] = [];
  private renderTexture: PIXI.RenderTexture | null = null;

  constructor(app: PIXI.Application, initialSettings: EraserSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public updateSettings(newSettings: EraserSettings): void {
    this.settings = { ...newSettings };
  }

  public setSharedRenderTexture(renderTexture: PIXI.RenderTexture): void {
    this.renderTexture = renderTexture;
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.renderTexture) return;
    this.isDrawing = true;
    this.lastPoint = { ...point, timestamp: Date.now() };
    this.currentStroke = [this.lastPoint];
    this.strokePath = [this.lastPoint];
    this.drawPoint(point);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.renderTexture) return;
    const currentPoint = { ...point, timestamp: Date.now() };
    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);
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

  private drawPoint(point: DrawingPoint): void {
    if (!this.renderTexture) return;

    const eraser = new PIXI.Graphics();
    const eraserRadius = this.settings.size / 2;
    eraser.beginFill(0xffffff, 1);
    eraser.drawCircle(0, 0, eraserRadius);
    eraser.endFill();
    eraser.x = point.x;
    eraser.y = point.y;
    eraser.blendMode = "erase";
    eraser.alpha = this.settings.opacity;

    if (this.settings.hardness < 0.98) {
      const blurAmount = (1 - this.settings.hardness) * eraserRadius * 0.3;
      try {
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = Math.max(0.5, Math.min(10, blurAmount));
        blurFilter.quality = 1;
        eraser.filters = [blurFilter];
      } catch (error) {
        console.warn("Blur filter creation failed:", error);
      }
    }

    if (this.settings.pressure && point.pressure !== undefined) {
      const pressureScale = Math.max(0.1, point.pressure);
      eraser.scale.set(pressureScale, pressureScale);
    }

    this.app.renderer.render({
      container: eraser,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });

    eraser.destroy();
  }

  private drawInterpolatedLine(start: DrawingPoint, end: DrawingPoint): void {
    const spacing = this.settings.size * 0.1;
    const points = this.interpolateStroke(
      start.x,
      start.y,
      end.x,
      end.y,
      spacing
    );
    points.forEach((point) => {
      this.drawPoint(point);
    });
  }

  private interpolateStroke(
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

  public cleanup(): void {
    this.endStroke();
    this.renderTexture = null;
    this.activeLayer = null;
  }

  public adjustEraserSize(delta: number): void {
    const newSize = Math.max(1, Math.min(200, this.settings.size + delta));
    this.updateSettings({ ...this.settings, size: newSize });
  }

  public adjustEraserOpacity(delta: number): void {
    const newOpacity = Math.max(0, Math.min(1, this.settings.opacity + delta));
    this.updateSettings({ ...this.settings, opacity: newOpacity });
  }

  public adjustEraserHardness(delta: number): void {
    const newHardness = Math.max(
      0,
      Math.min(1, this.settings.hardness + delta)
    );
    this.updateSettings({ ...this.settings, hardness: newHardness });
  }
}
