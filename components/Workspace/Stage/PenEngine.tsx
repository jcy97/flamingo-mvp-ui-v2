import * as PIXI from "pixi.js";
import { PenSettings } from "@/types/pen";
import { interpolateStroke, calculateSpacing } from "@/utils/brush";

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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVector(
  v1: { x: number; y: number },
  v2: { x: number; y: number },
  t: number
) {
  return {
    x: lerp(v1.x, v2.x, t),
    y: lerp(v1.y, v2.y, t),
  };
}

function normalize(v: { x: number; y: number }) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class PenEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private lastPoint: DrawingPoint | null = null;
  private currentStroke: DrawingPoint[] = [];
  private penTexture: PenTexture | null = null;
  private settings: PenSettings;
  private activeLayer: PIXI.Container | null = null;
  private renderTexture: PIXI.RenderTexture | null = null;

  private smoothedMouseX = 0;
  private smoothedMouseY = 0;

  private lastSmoothedMouseX = 0;
  private lastSmoothedMouseY = 0;

  private lastVelocity = 0;
  private lastThickness = 0;

  private lineThickness = 0;
  private lastDirection: { x: number; y: number } = { x: 0, y: 0 };

  private tipTaperFactor = 0.95;
  private thicknessSmoothingFactor = 0.18;
  private minThicknessFactor = 0.15;
  private maxThicknessFactor = 1.4;
  private maxVelocity = 5.0;
  private pressureSensitivity = 0.85;
  private velocitySensitivity = 0.15;

  private strokeStartThickness = 0;
  private strokeDistance = 0;
  private initialTaperDistance = 12;
  private endTaperDistance = 8;

  private pressureHistory: number[] = [];
  private pressureHistorySize = 5;

  constructor(app: PIXI.Application, initialSettings: PenSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    requestAnimationFrame(() => {
      this.updatePenTexture();
    });
  }

  public updateSettings(newSettings: PenSettings): void {
    const changed =
      this.settings.size !== newSettings.size ||
      this.settings.color !== newSettings.color ||
      this.settings.opacity !== newSettings.opacity;
    this.settings = { ...newSettings };
    if (changed && !this.isDrawing) {
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
    this.smoothedMouseX = this.lastSmoothedMouseX = point.x;
    this.smoothedMouseY = this.lastSmoothedMouseY = point.y;

    const basePressure = point.pressure !== undefined ? point.pressure : 0.3;
    this.pressureHistory = [basePressure];

    const baseThickness = this.settings.size * 0.5;
    this.strokeStartThickness = baseThickness * 0.1;
    this.lastThickness = this.strokeStartThickness;
    this.lineThickness = this.strokeStartThickness;
    this.lastVelocity = 0;
    this.lastDirection = { x: 0, y: 0 };
    this.strokeDistance = 0;

    this.drawStartCap(point.x, point.y, this.strokeStartThickness);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.renderTexture) return;

    const currentTime = Date.now();
    const currentPoint: DrawingPoint = { ...point, timestamp: currentTime };
    this.currentStroke.push(currentPoint);

    const smoothing = this.settings.smoothing * 0.7;
    this.smoothedMouseX =
      smoothing * point.x + (1 - smoothing) * this.smoothedMouseX;
    this.smoothedMouseY =
      smoothing * point.y + (1 - smoothing) * this.smoothedMouseY;

    const dx = this.smoothedMouseX - this.lastSmoothedMouseX;
    const dy = this.smoothedMouseY - this.lastSmoothedMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.3) {
      this.lastPoint = currentPoint;
      return;
    }

    this.strokeDistance += dist;

    const dt = currentPoint.timestamp! - this.lastPoint.timestamp! || 16;
    let velocity = (dist / dt) * 16;
    velocity = Math.min(velocity, this.maxVelocity);
    velocity = lerp(this.lastVelocity, velocity, 0.5);

    const pressure = point.pressure !== undefined ? point.pressure : 0.5;
    this.pressureHistory.push(pressure);
    if (this.pressureHistory.length > this.pressureHistorySize) {
      this.pressureHistory.shift();
    }

    const avgPressure =
      this.pressureHistory.reduce((a, b) => a + b, 0) /
      this.pressureHistory.length;

    const baseThickness = this.settings.size * 0.8;

    let targetThickness = baseThickness;

    if (this.strokeDistance < this.initialTaperDistance) {
      const taperProgress = this.strokeDistance / this.initialTaperDistance;
      const taperFactor = easeOutQuad(taperProgress);
      const minStart = baseThickness * 0.1;
      const normalThickness = baseThickness * avgPressure;
      targetThickness = lerp(minStart, normalThickness, taperFactor);
    } else {
      const pressureFactor =
        Math.pow(avgPressure, 0.6) * this.maxThicknessFactor;
      const velocityFactor = 1 - (velocity / this.maxVelocity) * 0.6;

      targetThickness =
        baseThickness *
        (this.pressureSensitivity * pressureFactor +
          this.velocitySensitivity * velocityFactor);

      targetThickness = Math.max(
        baseThickness * this.minThicknessFactor,
        Math.min(baseThickness * this.maxThicknessFactor, targetThickness)
      );
    }

    this.lineThickness +=
      this.thicknessSmoothingFactor * (targetThickness - this.lineThickness);

    let currentDirection = normalize({ x: dx, y: dy });
    const smoothedDirection = normalize(
      lerpVector(this.lastDirection, currentDirection, 0.3)
    );
    currentDirection = smoothedDirection;

    this.drawSegment(
      this.lastSmoothedMouseX,
      this.lastSmoothedMouseY,
      this.smoothedMouseX,
      this.smoothedMouseY,
      this.lastThickness,
      this.lineThickness,
      currentDirection
    );

    this.lastThickness = this.lineThickness;
    this.lastDirection = currentDirection;
    this.lastSmoothedMouseX = this.smoothedMouseX;
    this.lastSmoothedMouseY = this.smoothedMouseY;
    this.lastPoint = currentPoint;
    this.lastVelocity = velocity;
  }

  private drawSegment(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness1: number,
    thickness2: number,
    direction: { x: number; y: number }
  ): void {
    if (!this.renderTexture) return;

    const perp = { x: -direction.y, y: direction.x };
    const color = Number("0x" + this.settings.color.replace("#", ""));

    const steps = Math.max(
      2,
      Math.ceil(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2)
    );

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const smoothT = easeInOutCubic(t);

      const x = lerp(x1, x2, smoothT);
      const y = lerp(y1, y2, smoothT);
      const thickness = lerp(thickness1, thickness2, smoothT);

      const prevT = Math.max(0, (i - 1) / (steps - 1));
      const prevSmoothT = easeInOutCubic(prevT);
      const prevX = lerp(x1, x2, prevSmoothT);
      const prevY = lerp(y1, y2, prevSmoothT);
      const prevThickness = lerp(thickness1, thickness2, prevSmoothT);

      if (i > 0) {
        const segmentGraphics = new PIXI.Graphics();
        segmentGraphics.beginFill(color, this.settings.opacity);

        const p1 = {
          x: prevX + perp.x * prevThickness,
          y: prevY + perp.y * prevThickness,
        };
        const p2 = { x: x + perp.x * thickness, y: y + perp.y * thickness };
        const p3 = { x: x - perp.x * thickness, y: y - perp.y * thickness };
        const p4 = {
          x: prevX - perp.x * prevThickness,
          y: prevY - perp.y * prevThickness,
        };

        segmentGraphics.moveTo(p1.x, p1.y);
        segmentGraphics.lineTo(p2.x, p2.y);
        segmentGraphics.lineTo(p3.x, p3.y);
        segmentGraphics.lineTo(p4.x, p4.y);
        segmentGraphics.closePath();
        segmentGraphics.endFill();

        segmentGraphics.beginFill(color, this.settings.opacity);
        segmentGraphics.drawCircle(x, y, thickness * 0.98);
        segmentGraphics.endFill();

        this.app.renderer.render({
          container: segmentGraphics,
          target: this.renderTexture,
          clear: false,
        });

        segmentGraphics.destroy();
      }
    }
  }

  private drawStartCap(x: number, y: number, thickness: number): void {
    if (!this.renderTexture) return;

    const color = Number("0x" + this.settings.color.replace("#", ""));
    const graphics = new PIXI.Graphics();

    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const radius = thickness * (1 - t * 0.8);
      const alpha = this.settings.opacity * (1 - t * 0.3);

      graphics.beginFill(color, alpha);
      graphics.drawCircle(x, y, radius);
      graphics.endFill();
    }

    this.app.renderer.render({
      container: graphics,
      target: this.renderTexture,
      clear: false,
    });

    graphics.destroy();
  }

  public endStroke(): void {
    if (!this.isDrawing) return;

    const endTaperSteps = 5;
    const taperLength = this.endTaperDistance;

    if (this.lastDirection.x !== 0 || this.lastDirection.y !== 0) {
      for (let i = 1; i <= endTaperSteps; i++) {
        const t = i / endTaperSteps;
        const taperFactor = 1 - easeInQuad(t);

        const endX =
          this.smoothedMouseX +
          this.lastDirection.x * ((taperLength * t) / endTaperSteps);
        const endY =
          this.smoothedMouseY +
          this.lastDirection.y * ((taperLength * t) / endTaperSteps);
        const endThickness = this.lineThickness * taperFactor;

        this.drawEndCap(endX, endY, endThickness);
      }
    }

    this.drawEndCap(
      this.smoothedMouseX,
      this.smoothedMouseY,
      this.lineThickness * 0.1
    );

    this.isDrawing = false;
    this.lastPoint = null;
    this.currentStroke = [];
    this.pressureHistory = [];
  }

  private drawEndCap(x: number, y: number, thickness: number): void {
    if (!this.renderTexture) return;

    const color = Number("0x" + this.settings.color.replace("#", ""));
    const graphics = new PIXI.Graphics();

    graphics.beginFill(color, this.settings.opacity);
    graphics.drawCircle(x, y, thickness);
    graphics.endFill();

    this.app.renderer.render({
      container: graphics,
      target: this.renderTexture,
      clear: false,
    });

    graphics.destroy();
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

    for (let r = taperThickness; r > 0; r -= taperThickness / 4) {
      tipGraphics.drawCircle(x, y, r);
    }

    tipGraphics.endFill();

    this.app.renderer.render({
      container: tipGraphics,
      target: this.renderTexture,
      clear: false,
    });

    tipGraphics.destroy();
  }

  private async updatePenTexture(): Promise<void> {
    if (this.isDrawing) return;

    if (this.penTexture?.texture) {
      this.penTexture.texture.destroy();
      this.penTexture = null;
    }

    this.penTexture = this.createPenTexture();
  }

  private createPenTexture(): PenTexture {
    const size = Math.max(1, this.settings.size);
    const graphics = new PIXI.Graphics();
    const radius = size / 2;
    const color = Number("0x" + this.settings.color.replace("#", ""));

    graphics.beginFill(color, this.settings.opacity);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();

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
