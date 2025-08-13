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

  private tipTaperFactor = 0.8;
  private thicknessSmoothingFactor = 0.3;
  private minThicknessFactor = 0.3;
  private maxVelocity = 3.0;

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

    const baseThickness = this.settings.size * 0.5;
    this.lastThickness = baseThickness;
    this.lineThickness = baseThickness;
    this.lastVelocity = 0;
    this.lastDirection = { x: 0, y: 0 };
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.lastPoint || !this.renderTexture) return;

    const currentTime = Date.now();
    const currentPoint: DrawingPoint = { ...point, timestamp: currentTime };
    this.currentStroke.push(currentPoint);

    const smoothing = this.settings.smoothing;
    this.smoothedMouseX =
      smoothing * point.x + (1 - smoothing) * this.smoothedMouseX;
    this.smoothedMouseY =
      smoothing * point.y + (1 - smoothing) * this.smoothedMouseY;

    const dx = this.smoothedMouseX - this.lastSmoothedMouseX;
    const dy = this.smoothedMouseY - this.lastSmoothedMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.5) {
      this.lastPoint = currentPoint;
      return;
    }

    const dt = currentPoint.timestamp! - this.lastPoint.timestamp! || 16;
    let velocity = (dist / dt) * 16;
    velocity = Math.min(velocity, this.maxVelocity);

    // 필압 반영: 압력 값이 없으면 1로 기본값 설정
    const pressure = point.pressure !== undefined ? point.pressure : 1;

    const baseThickness = this.settings.size * 0.95;
    // velocity에 따른 두께
    const velocityFactor = lerp(
      baseThickness,
      baseThickness * this.minThicknessFactor,
      velocity / this.maxVelocity
    );
    // 필압과 velocityFactor를 lerp하여 균형 있게 적용
    const targetThickness = lerp(velocityFactor, baseThickness * pressure, 0.5);

    this.lineThickness +=
      this.thicknessSmoothingFactor * (targetThickness - this.lineThickness);

    let currentDirection = normalize({ x: dx, y: dy });
    const smoothedDirection = normalize(
      lerpVector(this.lastDirection, currentDirection, 0.5)
    );
    currentDirection = smoothedDirection;

    const perp = { x: -currentDirection.y, y: currentDirection.x };
    const halfThickness = this.lineThickness;

    const p1 = {
      x: this.lastSmoothedMouseX + perp.x * this.lastThickness,
      y: this.lastSmoothedMouseY + perp.y * this.lastThickness,
    };
    const p2 = {
      x: this.smoothedMouseX + perp.x * halfThickness,
      y: this.smoothedMouseY + perp.y * halfThickness,
    };
    const p3 = {
      x: this.smoothedMouseX - perp.x * halfThickness,
      y: this.smoothedMouseY - perp.y * halfThickness,
    };
    const p4 = {
      x: this.lastSmoothedMouseX - perp.x * this.lastThickness,
      y: this.lastSmoothedMouseY - perp.y * this.lastThickness,
    };

    const color = Number("0x" + this.settings.color.replace("#", ""));

    const segmentGraphics = new PIXI.Graphics();
    segmentGraphics.beginFill(color, this.settings.opacity);
    segmentGraphics.moveTo(p1.x, p1.y);
    segmentGraphics.lineTo(p2.x, p2.y);
    segmentGraphics.lineTo(p3.x, p3.y);
    segmentGraphics.lineTo(p4.x, p4.y);
    segmentGraphics.closePath();
    segmentGraphics.endFill();

    this.app.renderer.render({
      container: segmentGraphics,
      target: this.renderTexture,
      clear: false,
    });

    segmentGraphics.destroy();

    this.drawTip(false, this.smoothedMouseX, this.smoothedMouseY);

    this.lastThickness = halfThickness;
    this.lastDirection = currentDirection;
    this.lastSmoothedMouseX = this.smoothedMouseX;
    this.lastSmoothedMouseY = this.smoothedMouseY;
    this.lastPoint = currentPoint;
    this.lastVelocity = velocity;
  }

  public endStroke(): void {
    if (!this.isDrawing) return;

    this.drawTip(true, this.smoothedMouseX, this.smoothedMouseY);

    this.isDrawing = false;
    this.lastPoint = null;
    this.currentStroke = [];
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

    // 여러 원을 크기 감소하며 겹쳐서 뾰족한 끝부분 표현
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
