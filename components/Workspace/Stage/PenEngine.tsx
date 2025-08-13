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

  private mouseMoved = false;
  private lastSmoothedMouseX = 0;
  private lastSmoothedMouseY = 0;
  private smoothedMouseX = 0;
  private smoothedMouseY = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private lastMouseChangeVectorX = 0;
  private lastMouseChangeVectorY = 0;

  private lastRotation = 0;
  private lineRotation = 0;
  private L1Sin1 = 0;
  private L1Cos1 = 0;
  private controlX1 = 0;
  private controlY1 = 0;
  private controlX2 = 0;
  private controlY2 = 0;

  private lastThickness = 0;
  private lineThickness = 0;
  private tipTaperFactor = 0.8;
  private thicknessFactor = 0.1;
  private thicknessSmoothingFactor = 0.3;

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

    this.lastSmoothedMouseX = this.smoothedMouseX = this.lastMouseX = point.x;
    this.lastSmoothedMouseY = this.smoothedMouseY = this.lastMouseY = point.y;

    this.lastThickness = this.settings.size * 0.5;
    this.lastRotation = Math.PI / 2;
    this.lastMouseChangeVectorX = 0;
    this.lastMouseChangeVectorY = 0;
    this.mouseMoved = false;
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.renderTexture) return;

    const currentPoint = { ...point, timestamp: Date.now() };
    this.currentStroke.push(currentPoint);
    this.strokePath.push(currentPoint);

    this.mouseDeltaX = point.x - this.lastMouseX;
    this.mouseDeltaY = point.y - this.lastMouseY;
    this.mouseMoved = true;

    const smoothing = this.settings.smoothing;
    this.smoothedMouseX += smoothing * (point.x - this.smoothedMouseX);
    this.smoothedMouseY += smoothing * (point.y - this.smoothedMouseY);

    const dx = this.smoothedMouseX - this.lastSmoothedMouseX;
    const dy = this.smoothedMouseY - this.lastSmoothedMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.5) {
      this.lastPoint = currentPoint;
      return;
    }

    const baseThickness = this.settings.size * 0.5;
    const velocityFactor = Math.min(
      dist * this.thicknessFactor,
      baseThickness * 0.5
    );
    const targetLineThickness = Math.max(
      baseThickness * 0.3,
      baseThickness - velocityFactor
    );

    this.lineRotation = Math.PI / 2 + Math.atan2(dy, dx);
    this.lineThickness =
      this.lastThickness +
      this.thicknessSmoothingFactor *
        (targetLineThickness - this.lastThickness);

    const sin0 = Math.sin(this.lastRotation);
    const cos0 = Math.cos(this.lastRotation);
    const sin1 = Math.sin(this.lineRotation);
    const cos1 = Math.cos(this.lineRotation);

    const L0Sin0 = this.lastThickness * sin0;
    const L0Cos0 = this.lastThickness * cos0;
    this.L1Sin1 = this.lineThickness * sin1;
    this.L1Cos1 = this.lineThickness * cos1;

    const controlVecX = 0.33 * dist * sin0;
    const controlVecY = -0.33 * dist * cos0;

    this.controlX1 = this.lastSmoothedMouseX + L0Cos0 + controlVecX;
    this.controlY1 = this.lastSmoothedMouseY + L0Sin0 + controlVecY;
    this.controlX2 = this.lastSmoothedMouseX - L0Cos0 + controlVecX;
    this.controlY2 = this.lastSmoothedMouseY - L0Sin0 + controlVecY;

    const color = Number("0x" + this.settings.color.replace("#", ""));

    const segmentGraphics = new PIXI.Graphics();
    segmentGraphics.beginFill(color, this.settings.opacity);
    segmentGraphics.moveTo(
      this.lastSmoothedMouseX + L0Cos0,
      this.lastSmoothedMouseY + L0Sin0
    );
    segmentGraphics.quadraticCurveTo(
      this.controlX1,
      this.controlY1,
      this.smoothedMouseX + this.L1Cos1,
      this.smoothedMouseY + this.L1Sin1
    );
    segmentGraphics.lineTo(
      this.smoothedMouseX - this.L1Cos1,
      this.smoothedMouseY - this.L1Sin1
    );
    segmentGraphics.quadraticCurveTo(
      this.controlX2,
      this.controlY2,
      this.lastSmoothedMouseX - L0Cos0,
      this.lastSmoothedMouseY - L0Sin0
    );
    segmentGraphics.lineTo(
      this.lastSmoothedMouseX + L0Cos0,
      this.lastSmoothedMouseY + L0Sin0
    );
    segmentGraphics.endFill();

    this.app.renderer.render({
      container: segmentGraphics,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });

    segmentGraphics.destroy();

    this.drawTip(false, point.x, point.y);

    this.lastSmoothedMouseX = this.smoothedMouseX;
    this.lastSmoothedMouseY = this.smoothedMouseY;
    this.lastRotation = this.lineRotation;
    this.lastThickness = this.lineThickness;
    this.lastMouseChangeVectorX = this.mouseDeltaX;
    this.lastMouseChangeVectorY = this.mouseDeltaY;
    this.lastMouseX = point.x;
    this.lastMouseY = point.y;

    this.lastPoint = currentPoint;
  }

  public endStroke(): void {
    if (!this.isDrawing) return;

    this.drawTip(true, this.lastMouseX, this.lastMouseY);

    this.isDrawing = false;
    this.lastPoint = null;
    this.currentStroke = [];
    this.strokePath = [];
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  private drawTip(isFinal: boolean, x: number, y: number): void {
    if (!this.renderTexture) return;

    const taperThickness = this.tipTaperFactor * this.lineThickness;
    const color = Number("0x" + this.settings.color.replace("#", ""));

    const tipGraphics = new PIXI.Graphics();

    tipGraphics.beginFill(color, this.settings.opacity);
    tipGraphics.drawCircle(x, y, taperThickness);
    tipGraphics.endFill();

    if (this.mouseMoved && this.L1Sin1 !== 0 && this.L1Cos1 !== 0) {
      const taper = this.tipTaperFactor;

      tipGraphics.beginFill(color, this.settings.opacity);
      tipGraphics.moveTo(
        this.smoothedMouseX + this.L1Cos1,
        this.smoothedMouseY + this.L1Sin1
      );
      tipGraphics.lineTo(x + taper * this.L1Cos1, y + taper * this.L1Sin1);
      tipGraphics.lineTo(x - taper * this.L1Cos1, y - taper * this.L1Sin1);
      tipGraphics.lineTo(
        this.smoothedMouseX - this.L1Cos1,
        this.smoothedMouseY - this.L1Sin1
      );
      tipGraphics.lineTo(
        this.smoothedMouseX + this.L1Cos1,
        this.smoothedMouseY + this.L1Sin1
      );
      tipGraphics.endFill();
    }

    this.app.renderer.render({
      container: tipGraphics,
      target: this.renderTexture,
      clear: false,
      transform: undefined,
    });

    tipGraphics.destroy();
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
