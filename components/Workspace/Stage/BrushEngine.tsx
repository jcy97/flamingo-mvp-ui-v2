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
  };

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

  public setActiveLayer(layer: PIXI.Container): void {
    // Layer handling for compatibility
  }

  private generateDabTexture(
    radius: number,
    hardness: number,
    roundness: number
  ): PIXI.Texture {
    const key = `${radius}_${hardness}_${roundness}`;
    if (this.dabTextures.has(key)) {
      return this.dabTextures.get(key)!;
    }

    const minSize = Math.max(4, Math.ceil(radius * 2));
    const canvas = document.createElement("canvas");
    canvas.width = minSize;
    canvas.height = minSize;
    const ctx = canvas.getContext("2d")!;

    const centerX = minSize / 2;
    const centerY = minSize / 2;

    ctx.clearRect(0, 0, minSize, minSize);

    const effectiveRadius = Math.min(radius, minSize / 2 - 1);

    if (hardness >= 0.999) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fill();
    } else {
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        effectiveRadius
      );

      const fadeStart = hardness;
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      if (fadeStart > 0) {
        gradient.addColorStop(fadeStart, "rgba(255,255,255,1)");
      }
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, effectiveRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (roundness < 1 && roundness > 0) {
      const ellipseCanvas = document.createElement("canvas");
      ellipseCanvas.width = minSize;
      ellipseCanvas.height = Math.ceil(minSize * roundness);
      const ellipseCtx = ellipseCanvas.getContext("2d")!;

      ellipseCtx.save();
      ellipseCtx.scale(1, roundness);
      ellipseCtx.drawImage(canvas, 0, 0);
      ellipseCtx.restore();

      const texture = PIXI.Texture.from(ellipseCanvas);
      this.dabTextures.set(key, texture);
      return texture;
    }

    const texture = PIXI.Texture.from(canvas);
    this.dabTextures.set(key, texture);

    if (this.dabTextures.size > 100) {
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

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  }

  private calculateDynamics(
    pressure: number,
    speed: number,
    dt: number
  ): { opacity: number; radius: number; hardness: number } {
    const dynamics = {
      opacity: this.settings.opacity,
      radius: this.settings.radius,
      hardness: this.settings.hardness,
    };

    if (this.settings.pressureOpacity > 0) {
      dynamics.opacity *=
        1 -
        this.settings.pressureOpacity +
        pressure * this.settings.pressureOpacity;
    }

    if (this.settings.pressureSize > 0) {
      dynamics.radius *=
        1 - this.settings.pressureSize + pressure * this.settings.pressureSize;
    }

    if (this.settings.speedSize !== 0) {
      const speedFactor = Math.min(speed / 1000, 1);
      if (this.settings.speedSize > 0) {
        dynamics.radius *= 1 + speedFactor * this.settings.speedSize;
      } else {
        dynamics.radius *= 1 - speedFactor * Math.abs(this.settings.speedSize);
      }
    }

    dynamics.opacity = Math.max(0, Math.min(1, dynamics.opacity));
    dynamics.radius = Math.max(0.5, Math.min(200, dynamics.radius));
    dynamics.hardness = Math.max(0, Math.min(1, dynamics.hardness));

    return dynamics;
  }

  private drawDab(
    x: number,
    y: number,
    dynamics: { opacity: number; radius: number; hardness: number },
    color: { r: number; g: number; b: number; a: number }
  ): void {
    if (!this.renderTexture) return;

    const dabTexture = this.generateDabTexture(
      dynamics.radius,
      dynamics.hardness,
      this.settings.roundness
    );

    const dab = new PIXI.Sprite(dabTexture);
    dab.anchor.set(0.5);
    dab.x = x;
    dab.y = y;

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    dab.tint = (r << 16) + (g << 8) + b;
    dab.alpha = dynamics.opacity;

    if (this.settings.angle !== 0) {
      dab.rotation = (this.settings.angle * Math.PI) / 180;
    }

    if (this.settings.jitter > 0) {
      const jitterAmount = this.settings.jitter * dynamics.radius * 0.01;
      dab.x += (Math.random() - 0.5) * jitterAmount * 2;
      dab.y += (Math.random() - 0.5) * jitterAmount * 2;
    }

    this.app.renderer.render({
      container: dab,
      target: this.renderTexture,
      clear: false,
    });

    dab.destroy();
  }

  public startStroke(point: DrawingPoint): void {
    if (!this.renderTexture) return;

    this.isDrawing = true;
    this.states.x = point.x;
    this.states.y = point.y;
    this.states.actualX = point.x;
    this.states.actualY = point.y;
    this.states.distance = 0;
    this.states.strokeTime = 0;
    this.states.dabCount = 0;
    this.states.pressure = point.pressure || 0.5;
    this.lastTime = performance.now();

    const color = this.hexToRgb(this.settings.color);
    this.states.smudgeColor = { ...color, a: 1 };
  }

  public continueStroke(point: DrawingPoint): void {
    if (!this.isDrawing || !this.renderTexture) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (dt <= 0) return;

    const dx = point.x - this.states.x;
    const dy = point.y - this.states.y;
    const distance = Math.hypot(dx, dy);
    const speed = distance / dt;

    this.states.dx = dx;
    this.states.dy = dy;
    this.states.speed = speed;
    this.states.direction = Math.atan2(dy, dx);
    this.states.distance += distance;
    this.states.time += dt;
    this.states.strokeTime += dt;
    this.states.pressure = point.pressure || 0.5;

    const dynamics = this.calculateDynamics(this.states.pressure, speed, dt);
    const minSpacing = Math.max(1, dynamics.radius * this.settings.spacing);

    const maxDabsPerSegment = 50;

    if (distance > 0) {
      const steps = Math.min(
        maxDabsPerSegment,
        Math.max(1, Math.floor(distance / minSpacing))
      );
      const actualSpacing = distance / steps;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const dabX = this.states.x + dx * t;
        const dabY = this.states.y + dy * t;

        const smoothing = 0.5;
        this.states.actualX += (dabX - this.states.actualX) * smoothing;
        this.states.actualY += (dabY - this.states.actualY) * smoothing;

        let color = this.hexToRgb(this.settings.color);
        if (this.settings.smudgeLength > 0) {
          const smudged = this.sampleColor(
            this.states.actualX,
            this.states.actualY,
            dynamics.radius * this.settings.smudgeRadius
          );

          const smudgeFactor = this.settings.smudgeLength;
          color = {
            r: color.r * (1 - smudgeFactor) + smudged.r * smudgeFactor,
            g: color.g * (1 - smudgeFactor) + smudged.g * smudgeFactor,
            b: color.b * (1 - smudgeFactor) + smudged.b * smudgeFactor,
          };

          this.states.smudgeColor = { ...color, a: 1 };
        }

        this.drawDab(this.states.actualX, this.states.actualY, dynamics, {
          ...color,
          a: 1,
        });
        this.states.dabCount++;
      }
    }

    this.states.x = point.x;
    this.states.y = point.y;
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
