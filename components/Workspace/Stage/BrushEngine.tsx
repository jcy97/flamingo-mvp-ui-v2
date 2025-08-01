import * as PIXI from "pixi.js";
import { BrushSettings, BrushTexture, BrushType } from "@/types/brush";
import {
  createBrushTexture,
  createImageBrushTexture,
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
  private renderTexture: PIXI.RenderTexture | null = null;
  private rtSprite: PIXI.Sprite | null = null;

  constructor(app: PIXI.Application, initialSettings: BrushSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    requestAnimationFrame(() => {
      this.updateBrushTexture();
    });
  }

  public updateSettings(newSettings: BrushSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };
    if (settingsChanged && !this.isDrawing) {
      requestAnimationFrame(() => {
        this.updateBrushTexture();
      });
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
      "brushType",
      "size",
      "color",
      "hardness",
      "roundness",
      "angle",
      "imageUrl",
    ];
    return relevantProps.some(
      (prop) => oldSettings[prop] !== newSettings[prop]
    );
  }

  private async updateBrushTexture(): Promise<void> {
    if (this.isDrawing) {
      return;
    }
    try {
      if (this.brushTexture?.texture) {
        this.brushTexture.texture.destroy();
        this.brushTexture = null;
      }

      if (this.settings.brushType === BrushType.IMAGE) {
        const imageUrl = this.settings.imageUrl || "/brush/stroke_a.png";
        this.brushTexture = await createImageBrushTexture(
          this.app,
          imageUrl,
          this.settings
        );
      } else {
        this.brushTexture = createBrushTexture(this.app, this.settings);
      }
    } catch (error) {
      console.error("Failed to create brush texture:", error);
      this.brushTexture = null;
    }
  }

  private drawPoint(point: DrawingPoint): void {
    if (!this.renderTexture) return;

    if (this.settings.brushType === BrushType.ERASER) {
      const eraser = new PIXI.Graphics();
      const eraserRadius = this.settings.size / 2;
      eraser.beginFill(0xffffff, 1);
      eraser.drawCircle(0, 0, eraserRadius);
      eraser.endFill();
      eraser.x = point.x;
      eraser.y = point.y;
      eraser.blendMode = "erase";

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
    } else {
      if (!this.brushTexture?.texture) return;

      const stamp = new PIXI.Sprite(this.brushTexture.texture);
      stamp.anchor.set(0.5, 0.5);
      stamp.x = point.x;
      stamp.y = point.y;

      if (this.settings.brushType === BrushType.IMAGE) {
        stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));
      } else {
        if (this.settings.opacity > 0.9) {
          stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));
        } else if (this.settings.opacity === 0) {
          stamp.alpha = 0;
        } else {
          stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity / 10));
        }
      }

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

  public getBrushPreview(): HTMLCanvasElement | null {
    try {
      const canvas = document.createElement("canvas");
      const size = Math.min(this.settings.size, 100);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      if (this.settings.brushType === BrushType.IMAGE) {
        ctx.fillStyle = this.settings.color;
        ctx.globalAlpha = this.settings.opacity;
        ctx.fillRect(0, 0, size, size);
        return canvas;
      }

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
