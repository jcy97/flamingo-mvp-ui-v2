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
  private strokeGraphics: PIXI.Graphics | null = null;

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
    const { width, height } = this.app.renderer;
    this.renderTexture = PIXI.RenderTexture.create({ width, height });
    this.rtSprite = new PIXI.Sprite(this.renderTexture);
    this.activeLayer.addChild(this.rtSprite);
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer) return;
    this.isDrawing = true;
    this.currentStroke = [[point.x, point.y, point.pressure || 0.5]];
    this.updateStroke();
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.activeLayer) return;
    this.currentStroke.push([point.x, point.y, point.pressure || 0.5]);
    this.updateStroke();
  }

  public endStroke(): void {
    this.isDrawing = false;
    this.currentStroke = [];
    this.strokeGraphics = null;
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  private updateStroke(): void {
    if (!this.renderTexture || this.currentStroke.length < 2) return;

    const options = {
      size: this.settings.size * 4,
      thinning: this.settings.pressure ? 0.6 : 0,
      smoothing: this.settings.smoothing,
      streamline: 0.5,
      easing: (t: number) => t,
      start: {
        taper: 0,
        easing: (t: number) => t,
      },
      end: {
        taper: this.currentStroke.length < 10 ? 0 : 20,
        easing: (t: number) => t,
      },
    };

    const stroke = getStroke(this.currentStroke, options);

    if (this.strokeGraphics) {
      this.strokeGraphics.destroy();
    }

    this.strokeGraphics = new PIXI.Graphics();

    const color = parseInt(this.settings.color.replace("#", ""), 16);
    this.strokeGraphics.beginFill(color, this.settings.opacity);

    if (stroke.length > 0) {
      this.strokeGraphics.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i++) {
        this.strokeGraphics.lineTo(stroke[i][0], stroke[i][1]);
      }
      this.strokeGraphics.closePath();
    }

    this.strokeGraphics.endFill();

    this.app.renderer.render({
      container: this.strokeGraphics,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });
  }

  public cleanup(): void {
    this.endStroke();
    if (this.strokeGraphics) {
      this.strokeGraphics.destroy();
      this.strokeGraphics = null;
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
