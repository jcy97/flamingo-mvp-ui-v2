import * as PIXI from "pixi.js";
import { PenSettings, PenTexture } from "@/types/pen";
import {
  createPenTexture,
  interpolatePenStroke,
  smoothPenPath,
  calculatePenSpacing,
} from "@/utils/pen";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
  velocity?: number;
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
  private rtSprite: PIXI.Sprite | null = null;

  constructor(app: PIXI.Application, initialSettings: PenSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    this.updatePenTexture();
  }

  public updateSettings(newSettings: PenSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };
    if (settingsChanged && !this.isDrawing) {
      this.updatePenTexture();
    }
  }

  public setActiveLayer(layer: PIXI.Container): void {
    this.activeLayer = layer;
    this.initRenderLayer();
  }

  private initRenderLayer() {
    if (!this.activeLayer) return;
    if (this.rtSprite) {
      this.activeLayer.removeChild(this.rtSprite);
      this.rtSprite.destroy();
      this.rtSprite = null;
    }
    if (this.renderTexture) {
      this.renderTexture.destroy();
      this.renderTexture = null;
    }
    const { width, height } = this.app.renderer;
    this.renderTexture = PIXI.RenderTexture.create({ width, height });
    this.rtSprite = new PIXI.Sprite(this.renderTexture);
    this.activeLayer.addChild(this.rtSprite);
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer) return;
    this.isDrawing = true;
    this.lastPoint = { ...point, timestamp: Date.now(), velocity: 0 };
    this.currentStroke = [this.lastPoint];
    this.strokePath = [this.lastPoint];
    this.drawPoint(point);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.activeLayer) return;

    const currentTime = Date.now();
    const timeDelta = Math.max(
      1,
      currentTime - (this.lastPoint.timestamp || currentTime)
    );
    const distance = Math.sqrt(
      Math.pow(point.x - this.lastPoint.x, 2) +
        Math.pow(point.y - this.lastPoint.y, 2)
    );
    const velocity = Math.min(50, distance / timeDelta);

    const currentPoint = {
      ...point,
      timestamp: currentTime,
      velocity: velocity,
    };

    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);

    if (this.settings.smoothing > 0 && this.strokePath.length > 2) {
      const smoothedPath = smoothPenPath(
        this.strokePath.slice(-3),
        this.settings.smoothing
      );
      if (smoothedPath.length > 1) {
        const smoothedPoint = {
          ...smoothedPath[smoothedPath.length - 2],
          velocity: currentPoint.velocity,
          pressure: currentPoint.pressure,
        };
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

  private updatePenTexture(): void {
    if (this.isDrawing) {
      return;
    }
    try {
      if (this.penTexture?.texture) {
        this.penTexture.texture.destroy();
        this.penTexture = null;
      }
      requestAnimationFrame(() => {
        this.penTexture = createPenTexture(this.app, this.settings);
      });
    } catch (error) {
      this.penTexture = null;
    }
  }

  private calculateDynamicSize(
    baseSize: number,
    velocity: number,
    pressure: number,
    strokeIndex: number,
    totalStrokeLength: number
  ): number {
    let size = baseSize;

    const velocityFactor = Math.max(
      0.85,
      Math.min(1.1, 1.0 - velocity * 0.003)
    );
    size *= velocityFactor;

    size *= pressure;

    const taperLength = Math.min(3, totalStrokeLength * 0.1);
    if (strokeIndex < taperLength) {
      size *= Math.max(0.7, (strokeIndex + 1) / taperLength);
    } else if (strokeIndex > totalStrokeLength - taperLength) {
      const remainingPoints = totalStrokeLength - strokeIndex;
      size *= Math.max(0.7, remainingPoints / taperLength);
    }

    return Math.max(baseSize * 0.8, size);
  }

  private drawPoint(point: DrawingPoint, dynamicSize?: number): void {
    if (!this.penTexture?.texture || !this.renderTexture) return;

    const strokeIndex = this.currentStroke.length - 1;
    const totalLength = Math.max(1, this.currentStroke.length);
    const velocity = point.velocity || 0;
    const pressure = point.pressure || 1.0;

    let size: number;
    if (dynamicSize !== undefined) {
      size = dynamicSize;
    } else if (strokeIndex === 0) {
      size = this.settings.size * pressure;
    } else {
      size = this.calculateDynamicSize(
        this.settings.size,
        velocity,
        pressure,
        strokeIndex,
        totalLength
      );
    }

    const stamp = new PIXI.Sprite(this.penTexture.texture);
    stamp.anchor.set(0.5, 0.5);
    stamp.x = point.x;
    stamp.y = point.y;
    stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));

    const scale = size / this.settings.size;
    stamp.scale.set(scale, scale);

    this.app.renderer.render({
      container: stamp,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });
    stamp.destroy();
  }

  private drawInterpolatedLine(start: DrawingPoint, end: DrawingPoint): void {
    const spacing = calculatePenSpacing(this.settings.size);
    const points = interpolatePenStroke(
      start.x,
      start.y,
      end.x,
      end.y,
      spacing
    );

    const avgVelocity = ((start.velocity || 0) + (end.velocity || 0)) / 2;
    const avgPressure = ((start.pressure || 1.0) + (end.pressure || 1.0)) / 2;

    points.forEach((point) => {
      const interpolatedPoint = {
        ...point,
        velocity: avgVelocity,
        pressure: avgPressure,
      };
      this.drawPoint(interpolatedPoint);
    });
  }

  public cleanup(): void {
    this.endStroke();
    if (this.penTexture?.texture) {
      this.penTexture.texture.destroy();
    }
    this.penTexture = null;
    if (this.rtSprite) {
      this.rtSprite.destroy();
      this.rtSprite = null;
    }
    if (this.renderTexture) {
      this.renderTexture.destroy();
      this.renderTexture = null;
    }
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
