import * as PIXI from "pixi.js";
import { PenSettings } from "@/types/pen";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
  velocity?: number;
}

interface ProcessedPoint {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export class PenEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private currentStroke: DrawingPoint[] = [];
  private processedPoints: ProcessedPoint[] = [];
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

    this.renderTexture = PIXI.RenderTexture.create({
      width,
      height,
    });

    this.rtSprite = new PIXI.Sprite(this.renderTexture);
    this.rtSprite.texture.source.scaleMode = "linear";
    this.activeLayer.addChild(this.rtSprite);

    this.currentStrokeContainer = new PIXI.Container();
    this.activeLayer.addChild(this.currentStrokeContainer);
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.activeLayer || !this.currentStrokeContainer) return;
    this.isDrawing = true;
    this.currentStroke = [point];
    this.processedPoints = [];
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
    this.currentStroke.push(point);
    this.updateCurrentStroke();
  }

  public endStroke(): void {
    if (!this.isDrawing) return;
    this.commitCurrentStroke();
    this.isDrawing = false;
    this.currentStroke = [];
    this.processedPoints = [];
    if (this.currentStrokeGraphics && this.currentStrokeContainer) {
      this.currentStrokeContainer.removeChild(this.currentStrokeGraphics);
      this.currentStrokeGraphics.destroy();
      this.currentStrokeGraphics = null;
    }
  }

  public setSharedRenderTexture(renderTexture: PIXI.RenderTexture): void {
    this.renderTexture = renderTexture;
    if (this.rtSprite && this.activeLayer) {
      this.activeLayer.removeChild(this.rtSprite);
      this.rtSprite.destroy();
      this.rtSprite = new PIXI.Sprite(this.renderTexture);
      this.rtSprite.texture.source.scaleMode = "linear";
      this.activeLayer.addChildAt(this.rtSprite, 0);
    }
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  private smoothPoint(points: DrawingPoint[], index: number): DrawingPoint {
    if (index === 0 || index === points.length - 1) {
      return points[index];
    }

    const prev = points[index - 1];
    const current = points[index];
    const next = points[index + 1];

    const smoothingFactor = this.settings.smoothing * 0.3;

    return {
      x:
        current.x * (1 - smoothingFactor) +
        (prev.x + next.x) * smoothingFactor * 0.5,
      y:
        current.y * (1 - smoothingFactor) +
        (prev.y + next.y) * smoothingFactor * 0.5,
      pressure: current.pressure,
    };
  }

  private calculateVelocity(points: DrawingPoint[], index: number): number {
    if (index === 0) return 0;

    const current = points[index];
    const previous = points[index - 1];

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const timeDiff = (current.timestamp || 0) - (previous.timestamp || 0);
    return timeDiff > 0 ? distance / timeDiff : distance;
  }

  private processPoints(): ProcessedPoint[] {
    const processed: ProcessedPoint[] = [];

    for (let i = 0; i < this.currentStroke.length; i++) {
      const smoothed = this.smoothPoint(this.currentStroke, i);
      const velocity = this.calculateVelocity(this.currentStroke, i);

      let pressure = smoothed.pressure !== undefined ? smoothed.pressure : 0.5;

      const velocityInfluence = Math.min(velocity * 0.01, 0.3);
      pressure = Math.max(0.1, pressure - velocityInfluence);

      let size = this.settings.size * pressure;
      if (this.settings.pressure) {
        size *= 0.5 + pressure * 0.5;
      }

      const alpha = this.settings.opacity * (0.7 + pressure * 0.3);

      processed.push({
        x: smoothed.x,
        y: smoothed.y,
        size: size,
        alpha: Math.min(1, alpha),
      });
    }

    return processed;
  }

  private updateCurrentStroke(): void {
    if (!this.currentStrokeGraphics || this.currentStroke.length === 0) return;

    this.processedPoints = this.processPoints();
    this.renderStroke();
  }

  private renderStroke(): void {
    if (!this.currentStrokeGraphics || this.processedPoints.length === 0)
      return;

    this.currentStrokeGraphics.clear();
    const color = Number("0x" + this.settings.color.replace("#", ""));

    if (this.processedPoints.length === 1) {
      const point = this.processedPoints[0];
      this.currentStrokeGraphics.circle(point.x, point.y, point.size * 0.5);
      this.currentStrokeGraphics.fill(color, point.alpha);
      return;
    }

    for (let i = 0; i < this.processedPoints.length - 1; i++) {
      const current = this.processedPoints[i];
      const next = this.processedPoints[i + 1];

      this.drawSegment(current, next, color);
    }
  }

  private drawSegment(
    p1: ProcessedPoint,
    p2: ProcessedPoint,
    color: number
  ): void {
    if (!this.currentStrokeGraphics) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) return;

    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI * 0.5;

    const avgAlpha = (p1.alpha + p2.alpha) * 0.5;

    const r1 = p1.size * 0.5;
    const r2 = p2.size * 0.5;

    const cos = Math.cos(perpAngle);
    const sin = Math.sin(perpAngle);

    const p1x1 = p1.x + cos * r1;
    const p1y1 = p1.y + sin * r1;
    const p1x2 = p1.x - cos * r1;
    const p1y2 = p1.y - sin * r1;

    const p2x1 = p2.x + cos * r2;
    const p2y1 = p2.y + sin * r2;
    const p2x2 = p2.x - cos * r2;
    const p2y2 = p2.y - sin * r2;

    this.currentStrokeGraphics.poly([
      p1x1,
      p1y1,
      p2x1,
      p2y1,
      p2x2,
      p2y2,
      p1x2,
      p1y2,
    ]);
    this.currentStrokeGraphics.fill(color, avgAlpha);

    this.currentStrokeGraphics.circle(p1.x, p1.y, r1);
    this.currentStrokeGraphics.fill(color, p1.alpha);

    if (this.processedPoints.indexOf(p2) === this.processedPoints.length - 1) {
      this.currentStrokeGraphics.circle(p2.x, p2.y, r2);
      this.currentStrokeGraphics.fill(color, p2.alpha);
    }
  }

  private commitCurrentStroke(): void {
    if (!this.renderTexture || !this.currentStrokeGraphics) return;

    const tempContainer = new PIXI.Container();
    const highResGraphics = new PIXI.Graphics();
    const color = Number("0x" + this.settings.color.replace("#", ""));

    if (this.processedPoints.length === 1) {
      const point = this.processedPoints[0];
      highResGraphics.circle(point.x, point.y, point.size * 0.5);
      highResGraphics.fill(color, point.alpha);
    } else {
      for (let i = 0; i < this.processedPoints.length - 1; i++) {
        const current = this.processedPoints[i];
        const next = this.processedPoints[i + 1];

        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.1) continue;

        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI * 0.5;
        const avgAlpha = (current.alpha + next.alpha) * 0.5;

        const r1 = current.size * 0.5;
        const r2 = next.size * 0.5;

        const cos = Math.cos(perpAngle);
        const sin = Math.sin(perpAngle);

        const p1x1 = current.x + cos * r1;
        const p1y1 = current.y + sin * r1;
        const p1x2 = current.x - cos * r1;
        const p1y2 = current.y - sin * r1;

        const p2x1 = next.x + cos * r2;
        const p2y1 = next.y + sin * r2;
        const p2x2 = next.x - cos * r2;
        const p2y2 = next.y - sin * r2;

        highResGraphics.poly([p1x1, p1y1, p2x1, p2y1, p2x2, p2y2, p1x2, p1y2]);
        highResGraphics.fill(color, avgAlpha);

        highResGraphics.circle(current.x, current.y, r1);
        highResGraphics.fill(color, current.alpha);

        if (i === this.processedPoints.length - 2) {
          highResGraphics.circle(next.x, next.y, r2);
          highResGraphics.fill(color, next.alpha);
        }
      }
    }

    tempContainer.addChild(highResGraphics);

    this.app.renderer.render({
      container: tempContainer,
      target: this.renderTexture,
      clear: false,
    });

    tempContainer.destroy();
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
