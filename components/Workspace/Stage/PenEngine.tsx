import * as PIXI from "pixi.js";
import { getStroke } from "perfect-freehand";
import { PenSettings } from "@/types/pen";

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
  private currentStroke: number[][] = [];
  private settings: PenSettings;
  private activeLayer: PIXI.Container | null = null;
  private renderTexture: PIXI.RenderTexture | null = null;
  private rtSprite: PIXI.Sprite | null = null;
  private currentStrokeGraphics: PIXI.Graphics | null = null;
  private currentStrokeContainer: PIXI.Container | null = null;

  constructor(app: PIXI.Application, initialSettings: PenSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public updateSettings(newSettings: PenSettings): void {
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
    if (this.currentStrokeContainer) {
      this.activeLayer.removeChild(this.currentStrokeContainer);
      this.currentStrokeContainer.destroy();
      this.currentStrokeContainer = null;
    }
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    this.renderTexture = PIXI.RenderTexture.create({ width, height });
    this.rtSprite = new PIXI.Sprite(this.renderTexture);
    this.activeLayer.addChild(this.rtSprite);
    this.currentStrokeContainer = new PIXI.Container();
    this.activeLayer.addChild(this.currentStrokeContainer);
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer || !this.currentStrokeContainer) return;
    this.isDrawing = true;
    this.currentStroke = [
      [point.x, point.y, point.pressure !== undefined ? point.pressure : 0.5],
    ];
    if (this.currentStrokeGraphics) {
      this.currentStrokeContainer.removeChild(this.currentStrokeGraphics);
      this.currentStrokeGraphics.destroy();
    }
    this.currentStrokeGraphics = new PIXI.Graphics();
    this.currentStrokeContainer.addChild(this.currentStrokeGraphics);
    this.updateCurrentStroke();
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.activeLayer) return;
    this.currentStroke.push([
      point.x,
      point.y,
      point.pressure !== undefined ? point.pressure : 0.5,
    ]);
    this.updateCurrentStroke();
  }

  public endStroke(): void {
    if (!this.isDrawing) return;
    this.commitCurrentStroke();
    this.isDrawing = false;
    this.currentStroke = [];
    if (this.currentStrokeGraphics && this.currentStrokeContainer) {
      this.currentStrokeContainer.removeChild(this.currentStrokeGraphics);
      this.currentStrokeGraphics.destroy();
      this.currentStrokeGraphics = null;
    }
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  private updateCurrentStroke(): void {
    if (!this.currentStrokeGraphics || this.currentStroke.length < 2) return;
    const options = {
      size: this.settings.size * 4,
      thinning: this.settings.pressure ? 0.6 : 0,
      smoothing: this.settings.smoothing,
      streamline: 0.5,
      easing: (t: number) => t,
      start: { taper: 0, easing: (t: number) => t },
      end: {
        taper: this.currentStroke.length < 10 ? 0 : 20,
        easing: (t: number) => t,
      },
    };
    const stroke = getStroke(this.currentStroke, options);
    if (stroke.length < 2) return;
    this.currentStrokeGraphics.clear();
    const color = Number("0x" + this.settings.color.replace("#", ""));
    this.currentStrokeGraphics.beginFill(color, this.settings.opacity);
    const flatPoints = stroke.flat();
    this.currentStrokeGraphics.drawPolygon(flatPoints);
    this.currentStrokeGraphics.endFill();
  }

  private commitCurrentStroke(): void {
    if (!this.renderTexture || !this.currentStrokeGraphics) return;
    this.app.renderer.render({
      container: this.currentStrokeGraphics,
      target: this.renderTexture,
      clear: false,
    });
  }

  public cleanup(): void {
    this.endStroke();
    if (this.currentStrokeGraphics) {
      this.currentStrokeGraphics.destroy();
      this.currentStrokeGraphics = null;
    }
    if (this.currentStrokeContainer) {
      this.currentStrokeContainer.destroy();
      this.currentStrokeContainer = null;
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

  public adjustPenSize(delta: number): void {
    const newSize = Math.max(0.5, Math.min(50, this.settings.size + delta));
    this.updateSettings({ ...this.settings, size: newSize });
  }

  public adjustPenOpacity(delta: number): void {
    const newOpacity = Math.max(0, Math.min(1, this.settings.opacity + delta));
    this.updateSettings({ ...this.settings, opacity: newOpacity });
  }
}
