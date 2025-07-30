import * as PIXI from "pixi.js";
import { BrushSettings } from "@/types/brush";

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
  private settings: BrushSettings;
  private activeLayer: PIXI.Container | null = null;
  private renderTexture: PIXI.RenderTexture | null = null;
  private rtSprite: PIXI.Sprite | null = null;
  private brushTexture: PIXI.Texture | null = null;
  private tempContainer: PIXI.Container | null = null;

  constructor(app: PIXI.Application, initialSettings: BrushSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    this.createBrushTexture();
    this.tempContainer = new PIXI.Container();
  }

  private createBrushTexture() {
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    this.brushTexture = PIXI.Texture.from(canvas);
  }

  public updateSettings(newSettings: BrushSettings): void {
    this.settings = { ...newSettings };
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
      resolution: 1,
    });
    this.rtSprite = new PIXI.Sprite(this.renderTexture);
    this.activeLayer.addChild(this.rtSprite);
  }

  private renderBrushStamp(x: number, y: number, pressure: number = 0.5) {
    if (!this.brushTexture || !this.renderTexture || !this.tempContainer)
      return;

    let size = this.settings.size;
    let opacity = this.settings.opacity;

    if (this.settings.pressure && pressure !== undefined) {
      size *= Math.max(0.1, pressure);
      opacity *= Math.max(0.1, pressure);
    }

    const scatterX = (Math.random() - 0.5) * (this.settings.scatterX || 0);
    const scatterY = (Math.random() - 0.5) * (this.settings.scatterY || 0);

    this.tempContainer.removeChildren();

    const stamp = new PIXI.Sprite(this.brushTexture);
    stamp.anchor.set(0.5, 0.5);
    stamp.x = x + scatterX;
    stamp.y = y + scatterY;
    stamp.width = size;
    stamp.height = size * this.settings.roundness;
    stamp.alpha = opacity * this.settings.flow;
    stamp.rotation = (this.settings.angle * Math.PI) / 180;
    stamp.tint = parseInt(this.settings.color.replace("#", ""), 16);

    this.tempContainer.addChild(stamp);

    this.app.renderer.render({
      container: this.tempContainer,
      target: this.renderTexture,
      clear: false,
    });

    this.tempContainer.removeChildren();
    stamp.destroy();
  }

  private interpolateStroke(start: DrawingPoint, end: DrawingPoint) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const spacing = Math.max(1, this.settings.size * this.settings.spacing);
    const steps = Math.ceil(distance / spacing);

    if (steps <= 1) {
      this.renderBrushStamp(end.x, end.y, end.pressure);
      return;
    }

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + dx * t;
      const y = start.y + dy * t;
      const pressure =
        (start.pressure || 0.5) +
        ((end.pressure || 0.5) - (start.pressure || 0.5)) * t;

      this.renderBrushStamp(x, y, pressure);
    }
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer) return;

    this.isDrawing = true;
    this.lastPoint = { ...point, pressure: point.pressure || 0.5 };

    this.renderBrushStamp(point.x, point.y, point.pressure || 0.5);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.activeLayer) return;

    const currentPoint = { ...point, pressure: point.pressure || 0.5 };
    this.interpolateStroke(this.lastPoint, currentPoint);
    this.lastPoint = currentPoint;
  }

  public endStroke(): void {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  public cleanup(): void {
    this.endStroke();

    if (this.tempContainer) {
      this.tempContainer.destroy({ children: true });
      this.tempContainer = null;
    }

    if (this.brushTexture) {
      this.brushTexture.destroy();
      this.brushTexture = null;
    }

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
}
