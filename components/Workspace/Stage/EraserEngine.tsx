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
  private eraserTexture: PIXI.RenderTexture | null = null;
  private settings: EraserSettings;
  private activeLayer: PIXI.Container | null = null;
  private strokePath: DrawingPoint[] = [];
  private renderTexture: PIXI.RenderTexture | null = null;
  private rtSprite: PIXI.Sprite | null = null;

  constructor(app: PIXI.Application, initialSettings: EraserSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    requestAnimationFrame(() => {
      this.updateEraserTexture();
    });
  }

  public updateSettings(newSettings: EraserSettings): void {
    const settingsChanged = this.hasSettingsChanged(this.settings, newSettings);
    this.settings = { ...newSettings };
    if (settingsChanged && !this.isDrawing) {
      requestAnimationFrame(() => {
        this.updateEraserTexture();
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
    this.renderTexture = PIXI.RenderTexture.create({
      width,
      height,
      alphaMode: "no-premultiply-alpha",
    });
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
    oldSettings: EraserSettings,
    newSettings: EraserSettings
  ): boolean {
    const relevantProps: (keyof EraserSettings)[] = [
      "size",
      "hardness",
      "opacity",
    ];
    return relevantProps.some(
      (prop) => oldSettings[prop] !== newSettings[prop]
    );
  }

  private async updateEraserTexture(): Promise<void> {
    if (this.isDrawing) {
      return;
    }
    try {
      if (this.eraserTexture) {
        this.eraserTexture.destroy();
        this.eraserTexture = null;
      }

      const size = Math.max(2, Math.min(200, this.settings.size));
      const radius = size / 2;
      const padding = Math.max(20, Math.ceil(radius * 0.8));
      const textureSize = Math.max(8, size + padding * 2);

      this.eraserTexture = PIXI.RenderTexture.create({
        width: textureSize,
        height: textureSize,
        resolution: 1,
      });

      const eraserGraphics = new PIXI.Graphics();
      eraserGraphics.beginFill(0xffffff, 1);
      eraserGraphics.drawCircle(textureSize / 2, textureSize / 2, radius);
      eraserGraphics.endFill();

      if (this.settings.hardness < 0.98) {
        const blurAmount = (1 - this.settings.hardness) * radius * 0.3;
        try {
          const blurFilter = new PIXI.BlurFilter();
          blurFilter.blur = Math.max(0.5, Math.min(10, blurAmount));
          blurFilter.quality = 1;
          eraserGraphics.filters = [blurFilter];
        } catch (error) {
          console.warn("Blur filter creation failed:", error);
        }
      }

      this.app.renderer.render({
        container: eraserGraphics,
        target: this.eraserTexture,
        clear: true,
        clearColor: 0x00000000,
      });
      eraserGraphics.destroy();
    } catch (error) {
      console.error("Failed to create eraser texture:", error);
      this.eraserTexture = null;
    }
  }

  private drawPoint(point: DrawingPoint): void {
    if (!this.eraserTexture || !this.renderTexture) return;
    const stamp = new PIXI.Sprite(this.eraserTexture);
    stamp.anchor.set(0.5, 0.5);
    stamp.x = point.x;
    stamp.y = point.y;
    stamp.alpha = Math.max(0.01, Math.min(1, this.settings.opacity));
    stamp.blendMode = "erase";

    if (point.pressure !== undefined) {
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
    if (this.eraserTexture) {
      this.eraserTexture.destroy();
    }
    this.eraserTexture = null;
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
