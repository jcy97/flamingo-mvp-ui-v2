import * as PIXI from "pixi.js";
import { EraserSettings } from "@/types/eraser";
import { BrushStroke, BrushPoint } from "@/types/layer";

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
  private currentBrushStroke: BrushStroke | null = null;
  private onStrokeDataComplete?: (strokeData: BrushStroke) => void;

  constructor(app: PIXI.Application, initialSettings: EraserSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public setOnStrokeDataComplete(callback: (strokeData: BrushStroke) => void) {
    this.onStrokeDataComplete = callback;
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

    this.currentBrushStroke = {
      id: `eraser-stroke-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      points: [],
      brushSettings: {
        radius: this.settings.radius,
        opacity: this.settings.opacity,
        hardness: this.settings.hardness,
        color: "#000000",
        pressureOpacity: this.settings.pressure ? 1.0 : 0.0,
        pressureSize: this.settings.pressure ? 1.0 : 0.0,
        speedSize: 0,
        smudgeLength: 0,
        smudgeRadius: 1.0,
        spacing: 1.0,
        jitter: 0,
        angle: 0,
        roundness: 1,
        dabsPerSecond: 0,
        dabsPerRadius: 0,
        speedOpacity: 0,
        randomRadius: 0,
        strokeThreshold: 0,
        strokeDuration: 0,
        slowTracking: 0,
        slowTrackingPerDab: 0,
        colorMixing: 0,
        eraser: 1,
        lockAlpha: 0,
        colorizeMode: 0,
        snapToPixel: 0,
      },
      timestamp: Date.now(),
      duration: 0,
      bounds: {
        minX: point.x,
        minY: point.y,
        maxX: point.x,
        maxY: point.y,
      },
    };

    this.addPointToCurrentStroke(point);
    this.drawPoint(point);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.renderTexture) return;
    const currentPoint = { ...point, timestamp: Date.now() };
    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);
    this.addPointToCurrentStroke(currentPoint);
    this.drawInterpolatedLine(this.lastPoint, currentPoint);
    this.lastPoint = currentPoint;
  }

  public endStroke(): void {
    this.isDrawing = false;

    if (this.currentBrushStroke) {
      this.currentBrushStroke.duration =
        Date.now() - this.currentBrushStroke.timestamp;

      console.log("🧽 EraserEngine 스트로크 완성:", {
        id: this.currentBrushStroke.id,
        pointsCount: this.currentBrushStroke.points.length,
        firstPoint: this.currentBrushStroke.points[0],
        lastPoint:
          this.currentBrushStroke.points[
            this.currentBrushStroke.points.length - 1
          ],
        duration: this.currentBrushStroke.duration,
        bounds: this.currentBrushStroke.bounds,
        brushSettings: this.currentBrushStroke.brushSettings,
      });

      if (this.onStrokeDataComplete) {
        this.onStrokeDataComplete({ ...this.currentBrushStroke });
      }
    }

    this.lastPoint = null;
    this.currentStroke = [];
    this.strokePath = [];
    this.currentBrushStroke = null;
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

  private addPointToCurrentStroke(point: DrawingPoint): void {
    if (!this.currentBrushStroke) return;

    const brushPoint: BrushPoint = {
      x: point.x,
      y: point.y,
      pressure: point.pressure || 0.5,
      timestamp: point.timestamp || Date.now(),
      actualRadius: this.settings.radius,
      actualOpacity: this.settings.opacity,
      speed: 0,
      direction: 0,
    };

    this.currentBrushStroke.points.push(brushPoint);

    this.currentBrushStroke.bounds.minX = Math.min(
      this.currentBrushStroke.bounds.minX,
      point.x
    );
    this.currentBrushStroke.bounds.minY = Math.min(
      this.currentBrushStroke.bounds.minY,
      point.y
    );
    this.currentBrushStroke.bounds.maxX = Math.max(
      this.currentBrushStroke.bounds.maxX,
      point.x
    );
    this.currentBrushStroke.bounds.maxY = Math.max(
      this.currentBrushStroke.bounds.maxY,
      point.y
    );
  }
}
