import * as PIXI from "pixi.js";
import { PenSettings } from "@/types/pen";
import { interpolateStroke, smoothPath, calculateSpacing } from "@/utils/brush";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
  velocity?: number;
}

interface PenTexture {
  texture: PIXI.Texture;
}

export class PenEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private lastPoint: DrawingPoint | null = null;
  private currentStroke: DrawingPoint[] = [];
  private penTexture: PenTexture | null = null;
  private settings: PenSettings;
  private activeLayer: PIXI.Container | null = null;
  private strokePath: DrawingPoint[] = [];
  private renderTexture: PIXI.RenderTexture | null = null;

  constructor(app: PIXI.Application, initialSettings: PenSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    requestAnimationFrame(() => {
      this.updatePenTexture();
    });
  }

  public updateSettings(newSettings: PenSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };
    if (settingsChanged && !this.isDrawing) {
      requestAnimationFrame(() => {
        this.updatePenTexture();
      });
    }
  }

  public setActiveLayer(layer: PIXI.Container): void {
    this.activeLayer = layer;
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
    oldSettings: PenSettings,
    newSettings: PenSettings
  ): boolean {
    const relevantProps: (keyof PenSettings)[] = ["size", "color", "opacity"];
    return relevantProps.some(
      (prop) => oldSettings[prop] !== newSettings[prop]
    );
  }

  private async updatePenTexture(): Promise<void> {
    if (this.isDrawing) {
      return;
    }
    try {
      if (this.penTexture?.texture) {
        this.penTexture.texture.destroy();
        this.penTexture = null;
      }

      this.penTexture = this.createPenTexture();
    } catch (error) {
      console.error("Failed to create pen texture:", error);
      this.penTexture = null;
    }
  }

  private createPenTexture(): PenTexture {
    const size = Math.max(1, this.settings.size);
    const graphics = new PIXI.Graphics();
    const radius = size / 2;
    const color = Number("0x" + this.settings.color.replace("#", ""));

    graphics.circle(0, 0, radius);
    graphics.fill(color);

    const texture = this.app.renderer.generateTexture(graphics);
    graphics.destroy();

    return { texture };
  }

  private drawPoint(point: DrawingPoint): void {
    if (!this.renderTexture || !this.penTexture?.texture) return;

    const stamp = new PIXI.Sprite(this.penTexture.texture);
    stamp.anchor.set(0.5, 0.5);
    stamp.x = point.x;
    stamp.y = point.y;

    stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));

    if (this.settings.pressure && point.pressure !== undefined) {
      const pressureScale = Math.max(0.1, point.pressure);
      stamp.scale.set(pressureScale, pressureScale);
    }

    this.app.renderer.render({
      container: stamp,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });

    stamp.destroy();
  }

  private drawInterpolatedLine(start: DrawingPoint, end: DrawingPoint): void {
    const spacing = calculateSpacing(this.settings.size, 0.1);
    const points = interpolateStroke(start.x, start.y, end.x, end.y, spacing);
    points.forEach((point) => {
      this.drawPoint(point);
    });
  }

  public cleanup(): void {
    this.endStroke();
    if (this.penTexture?.texture) {
      this.penTexture.texture.destroy();
    }
    this.penTexture = null;
    this.renderTexture = null;
    this.activeLayer = null;
  }

  public adjustPenSize(delta: number): void {
    const newSize = Math.max(0.5, Math.min(50, this.settings.size + delta));
    this.updateSettings({ ...this.settings, size: newSize });
  }

  public adjustPenOpacity(delta: number): void {
    const newOpacity = Math.max(0, Math.min(1, this.settings.opacity + delta));
    this.updateSettings({ ...this.settings, opacity: newOpacity });
  }
}
