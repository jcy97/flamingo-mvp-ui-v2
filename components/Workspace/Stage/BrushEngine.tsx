import * as PIXI from "pixi.js";
import { BrushSettings, BrushState } from "@/types/brush";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export class BrushEngine {
  private app: PIXI.Application;
  private isDrawing = false;
  private settings: BrushSettings;
  private renderTexture: PIXI.RenderTexture | null = null;
  private dabTextures = new Map<string, PIXI.Texture>();
  private lastTime = performance.now();
  private strokeStartTime = 0;
  private strokeDistance = 0;

  private states: BrushState = {
    x: 0,
    y: 0,
    pressure: 0,
    actualX: 0,
    actualY: 0,
    dx: 0,
    dy: 0,
    speed: 0,
    direction: 0,
    distance: 0,
    time: 0,
    strokeTime: 0,
    dabCount: 0,
    smudgeColor: { r: 0, g: 0, b: 0, a: 0 },
    lastSmudgeX: 0,
    lastSmudgeY: 0,
    stroke: 0,
    customInput: 0,
    actualRadius: 0,
    actualOpacity: 0,
  };

  private speed1 = 0;
  private speed2 = 0;
  private lastActualX = 0;
  private lastActualY = 0;
  private strokeLength = 0;

  constructor(app: PIXI.Application, initialSettings: BrushSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public updateSettings(newSettings: BrushSettings): void {
    this.settings = { ...newSettings };
  }

  public setSharedRenderTexture(renderTexture: PIXI.RenderTexture): void {
    this.renderTexture = renderTexture;
  }

  public setActiveLayer(layer: PIXI.Container): void {}

  private generateDabTexture(
    radius: number,
    hardness: number,
    roundness: number,
    angle: number
  ): PIXI.Texture {
    const key = `${radius}_${hardness}_${roundness}_${angle}`;
    if (this.dabTextures.has(key)) {
      return this.dabTextures.get(key)!;
    }
    const size = Math.max(4, Math.ceil(radius * 2 * 1.5));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const centerX = size / 2;
    const centerY = size / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    const radiusX = radius;
    const radiusY = radius * roundness;

    if (hardness >= 0.999) {
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fill();
    } else {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX);

      if (hardness > 0) {
        const fadeStart = Math.pow(hardness, 2);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(fadeStart, "rgba(255,255,255,1)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
      } else {
        gradient.addColorStop(0, `rgba(255,255,255,${1 - hardness})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
      }

      ctx.save();
      ctx.scale(1, roundness);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    const texture = PIXI.Texture.from(canvas);
    this.dabTextures.set(key, texture);

    if (this.dabTextures.size > 200) {
      const firstKey = this.dabTextures.keys().next().value;
      const firstTexture = this.dabTextures.get(firstKey!);
      firstTexture?.destroy();
      this.dabTextures.delete(firstKey!);
    }

    return texture;
  }

  private sampleColor(
    x: number,
    y: number,
    radius: number
  ): { r: number; g: number; b: number; a: number } {
    if (this.settings.colorMixing <= 0) {
      return this.hexToRgb(this.settings.color);
    }

    const sampled = {
      r: this.states.smudgeColor.r,
      g: this.states.smudgeColor.g,
      b: this.states.smudgeColor.b,
      a: this.states.smudgeColor.a,
    };

    const mixFactor = this.settings.smudgeLength;
    const color = this.hexToRgb(this.settings.color);
    sampled.r = sampled.r * mixFactor + color.r * (1 - mixFactor);
    sampled.g = sampled.g * mixFactor + color.g * (1 - mixFactor);
    sampled.b = sampled.b * mixFactor + color.b * (1 - mixFactor);
    sampled.a = 1;

    return sampled;
  }

  private hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
    a: number;
  } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
          a: 1,
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  }

  private calculateDynamics(
    pressure: number,
    speed: number,
    dt: number
  ): { opacity: number; radius: number; hardness: number; jitter: number } {
    const dynamics = {
      opacity: this.settings.opacity,
      radius: this.settings.radius,
      hardness: this.settings.hardness,
      jitter: this.settings.jitter,
    };

    if (this.settings.strokeThreshold > 0) {
      const strokeProgress = Math.min(1, this.states.stroke);
      if (strokeProgress < this.settings.strokeThreshold) {
        pressure = 0;
      }
    }

    const strokeDuration = Math.exp(this.settings.strokeDuration * Math.LN2);
    this.states.stroke = Math.min(1, this.strokeDistance / strokeDuration);

    if (this.settings.pressureOpacity > 0) {
      const pressureCurve = Math.pow(pressure, 0.9);
      dynamics.opacity *= pressureCurve * this.settings.pressureOpacity;
    }

    if (this.settings.pressureSize !== 0) {
      const sizeFactor = pressure * this.settings.pressureSize;
      dynamics.radius *= Math.max(0.1, sizeFactor);
    }

    if (this.settings.speedSize !== 0) {
      const speedFactor = Math.min(this.speed1 / 4.0, 1);
      dynamics.radius *= 1 + speedFactor * this.settings.speedSize;
    }

    if (this.settings.speedOpacity !== 0) {
      const speedFactor = Math.min(this.speed1 / 4.0, 1);
      dynamics.opacity *= Math.max(
        0,
        1 + speedFactor * this.settings.speedOpacity
      );
    }

    if (this.settings.randomRadius > 0) {
      const randomFactor =
        1 + (Math.random() - 0.5) * this.settings.randomRadius;
      dynamics.radius *= randomFactor;
    }

    if (pressure < 0.01 && this.settings.pressureOpacity > 0) {
      dynamics.opacity = 0;
    }

    dynamics.jitter *= pressure;

    dynamics.opacity = Math.max(0, Math.min(1, dynamics.opacity));
    dynamics.radius = Math.max(0.5, Math.min(200, dynamics.radius));
    dynamics.hardness = Math.max(0, Math.min(1, dynamics.hardness));

    this.states.actualRadius = dynamics.radius;
    this.states.actualOpacity = dynamics.opacity;

    return dynamics;
  }

  private drawDab(
    x: number,
    y: number,
    dynamics: {
      opacity: number;
      radius: number;
      hardness: number;
      jitter: number;
    },
    color: { r: number; g: number; b: number; a: number }
  ): void {
    if (!this.renderTexture) {
      return;
    }
    if (this.settings.snapToPixel > 0) {
      x = Math.round(x);
      y = Math.round(y);
      dynamics.radius = Math.round(dynamics.radius);
    }

    const dabTexture = this.generateDabTexture(
      dynamics.radius,
      dynamics.hardness,
      this.settings.roundness,
      this.settings.angle
    );

    const dab = new PIXI.Sprite(dabTexture);
    dab.anchor.set(0.5);
    dab.x = x;
    dab.y = y;

    if (dynamics.jitter > 0) {
      const jitterAmount = dynamics.jitter * dynamics.radius * 0.01;
      dab.x += (Math.random() - 0.5) * jitterAmount * 2;
      dab.y += (Math.random() - 0.5) * jitterAmount * 2;
    }

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    dab.tint = (r << 16) + (g << 8) + b;

    let finalOpacity = dynamics.opacity;

    if (this.settings.eraser > 0) {
      dab.blendMode = "erase";
      finalOpacity *= this.settings.eraser;
    } else if (this.settings.lockAlpha > 0) {
      dab.blendMode = "multiply";
      finalOpacity *= 1 - this.settings.lockAlpha;
    } else if (this.settings.colorizeMode > 0) {
      dab.blendMode = "overlay";
      finalOpacity *= this.settings.colorizeMode;
    }

    dab.alpha = finalOpacity;

    this.app.renderer.render({
      container: dab,
      target: this.renderTexture,
      clear: false,
    });

    dab.destroy();
    this.states.dabCount++;
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.renderTexture) {
      return;
    }

    this.isDrawing = true;
    this.states.x = point.x;
    this.states.y = point.y;
    this.states.actualX = point.x;
    this.states.actualY = point.y;
    this.lastActualX = point.x;
    this.lastActualY = point.y;
    this.states.distance = 0;
    this.states.strokeTime = 0;
    this.states.dabCount = 0;
    this.states.pressure = point.pressure || 0.5;
    this.states.stroke = 0;
    this.strokeDistance = 0;
    this.strokeLength = 0;
    this.strokeStartTime = performance.now();
    this.lastTime = performance.now();
    this.speed1 = 0;
    this.speed2 = 0;

    const color = this.hexToRgb(this.settings.color);
    this.states.smudgeColor = { ...color };

    const dynamics = this.calculateDynamics(this.states.pressure, 0, 0);
    this.drawDab(point.x, point.y, dynamics, color);
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.renderTexture) {
      return;
    }

    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (dt <= 0) return;

    const dx = point.x - this.states.x;
    const dy = point.y - this.states.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.01) return;

    const instantSpeed = distance / dt;

    const speed1Slowness = 0.04;
    const speed1Gamma = 4.0;
    this.speed1 +=
      (instantSpeed - this.speed1) * (1 - Math.exp(-dt / speed1Slowness));
    this.speed1 = Math.pow(this.speed1 / 4.0, 1 / speed1Gamma) * 4.0;

    const speed2Slowness = 0.8;
    this.speed2 +=
      (instantSpeed - this.speed2) * (1 - Math.exp(-dt / speed2Slowness));

    this.states.dx = dx;
    this.states.dy = dy;
    this.states.speed = this.speed1;
    this.states.direction = Math.atan2(dy, dx);
    this.states.distance += distance;
    this.strokeDistance += distance;
    this.strokeLength += distance;
    this.states.time += dt;
    this.states.strokeTime = (now - this.strokeStartTime) / 1000;
    this.states.pressure = point.pressure || 0.5;

    const dynamics = this.calculateDynamics(
      this.states.pressure,
      this.speed1,
      dt
    );

    let actualX = this.states.actualX;
    let actualY = this.states.actualY;

    if (this.settings.slowTracking > 0) {
      const slowFactor = Math.exp(
        -distance / Math.max(1, this.settings.slowTracking * 10)
      );
      actualX += dx * (1 - slowFactor);
      actualY += dy * (1 - slowFactor);
    } else {
      actualX = point.x;
      actualY = point.y;
    }

    const actualDistance = Math.hypot(
      actualX - this.lastActualX,
      actualY - this.lastActualY
    );

    let spacing = dynamics.radius * this.settings.spacing;

    if (this.settings.dabsPerRadius > 0) {
      spacing = dynamics.radius / this.settings.dabsPerRadius;
    }

    spacing = Math.max(0.5, spacing);

    if (actualDistance > 0) {
      const steps = Math.ceil(actualDistance / spacing);

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const dabX = this.lastActualX + (actualX - this.lastActualX) * t;
        const dabY = this.lastActualY + (actualY - this.lastActualY) * t;

        let color = this.hexToRgb(this.settings.color);

        if (this.settings.colorMixing > 0 && this.settings.smudgeLength > 0) {
          const smudged = this.sampleColor(
            dabX,
            dabY,
            dynamics.radius * this.settings.smudgeRadius
          );
          const smudgeFactor =
            this.settings.smudgeLength * this.settings.colorMixing;
          color = {
            r: color.r * (1 - smudgeFactor) + smudged.r * smudgeFactor,
            g: color.g * (1 - smudgeFactor) + smudged.g * smudgeFactor,
            b: color.b * (1 - smudgeFactor) + smudged.b * smudgeFactor,
            a: 1,
          };
          this.states.smudgeColor = { ...color };
        }

        if (this.settings.slowTrackingPerDab > 0) {
          const dabSlowFactor = Math.exp(
            -1 / Math.max(1, this.settings.slowTrackingPerDab)
          );
          this.states.actualX +=
            (dabX - this.states.actualX) * (1 - dabSlowFactor);
          this.states.actualY +=
            (dabY - this.states.actualY) * (1 - dabSlowFactor);
          this.drawDab(
            this.states.actualX,
            this.states.actualY,
            dynamics,
            color
          );
        } else {
          this.drawDab(dabX, dabY, dynamics, color);
        }
      }
    }

    if (this.settings.dabsPerSecond > 0) {
      const targetDabs = this.settings.dabsPerSecond * dt;
      const currentDabs = actualDistance / spacing;
      if (currentDabs < targetDabs) {
        const extraDabs = Math.floor(targetDabs - currentDabs);
        for (let i = 0; i < extraDabs; i++) {
          const color = this.hexToRgb(this.settings.color);
          this.drawDab(actualX, actualY, dynamics, color);
        }
      }
    }

    this.states.x = point.x;
    this.states.y = point.y;
    this.states.actualX = actualX;
    this.states.actualY = actualY;
    this.lastActualX = actualX;
    this.lastActualY = actualY;
  }

  public endStroke(): void {
    this.isDrawing = false;
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  public cleanup(): void {
    this.endStroke();
    this.dabTextures.forEach((texture) => texture.destroy());
    this.dabTextures.clear();
    this.renderTexture = null;
  }

  public adjustBrushSize(delta: number): void {
    const newRadius = Math.max(1, Math.min(100, this.settings.radius + delta));
    this.updateSettings({ ...this.settings, radius: newRadius });
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
