import * as PIXI from "pixi.js";
import {
  SpeechBubbleSettings,
  BubblePoint,
  TailPosition,
  SpeechBubbleData,
} from "@/types/speechBubble";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

interface BubbleHandle {
  graphic: PIXI.Graphics;
  type: "resize" | "tail" | "rotate" | "move";
  position: string;
}

export class SpeechBubbleEngine {
  private app: PIXI.Application;
  private settings: SpeechBubbleSettings;
  private renderTexture: PIXI.RenderTexture | null = null;
  private activeLayer: PIXI.Container | null = null;
  private isDrawing = false;
  private startPoint: DrawingPoint | null = null;
  private handles: BubbleHandle[] = [];
  private activeBubbles: Map<string, SpeechBubbleData> = new Map();
  private selectedBubbleId: string | null = null;
  private isDragging = false;
  private dragType: string | null = null;
  private dragStartPoint: { x: number; y: number } | null = null;
  private originalBubbleData: SpeechBubbleData | null = null;
  private isEditMode = false;
  private bubbleContainer: PIXI.Container | null = null;
  private currentLayerId: string | null = null;
  private onSelectionChange:
    | ((settings: SpeechBubbleSettings | null) => void)
    | null = null;

  constructor(app: PIXI.Application, initialSettings: SpeechBubbleSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    this.bubbleContainer = new PIXI.Container();
  }

  public setOnSelectionChange(
    callback: (settings: SpeechBubbleSettings | null) => void
  ): void {
    this.onSelectionChange = callback;
  }

  public updateSettings(newSettings: SpeechBubbleSettings): void {
    this.settings = { ...newSettings };

    if (this.selectedBubbleId) {
      const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
      if (bubbleData) {
        bubbleData.settings = { ...newSettings };
        bubbleData.width = newSettings.width;
        bubbleData.height = newSettings.height;
        this.redrawAll();
        if (this.isEditMode) {
          this.createHandles(bubbleData);
        }
      }
    } else {
      this.redrawAll();
    }
  }

  public setSharedRenderTexture(
    renderTexture: PIXI.RenderTexture | null
  ): void {
    this.renderTexture = renderTexture;
  }

  public setActiveLayer(layer: PIXI.Container): void {
    this.activeLayer = layer;
  }

  public setCurrentLayerId(layerId: string | null): void {
    this.currentLayerId = layerId;
    if (!layerId) {
      this.clearHandles();
      this.selectedBubbleId = null;
      this.isEditMode = false;
    }
  }

  private generateBubbleId(): string {
    return `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTailAngleFromPosition(position: TailPosition): number {
    const angleMap: Record<TailPosition, number> = {
      right: 0,
      "bottom-right": 45,
      "bottom-center": 90,
      "bottom-left": 135,
      left: 180,
      "top-left": 225,
      "top-center": 270,
      "top-right": 315,
    };
    return angleMap[position] || 90;
  }

  private calculateTextMetrics(
    text: string,
    settings: SpeechBubbleSettings
  ): { width: number; height: number } {
    if (!text || text.trim() === "") {
      return { width: settings.width, height: settings.height };
    }

    const tempText = new PIXI.Text(text, {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      fill: settings.textColor,
      wordWrap: true,
      wordWrapWidth: settings.width - settings.padding * 2,
      lineHeight: settings.fontSize * 1.4,
    });

    const bounds = tempText.getBounds();
    tempText.destroy();

    return {
      width:
        Math.round(
          Math.max(
            settings.minWidth || 100,
            bounds.width + settings.padding * 2
          ) * 100
        ) / 100,
      height:
        Math.round(
          Math.max(
            settings.minHeight || 50,
            bounds.height + settings.padding * 2
          ) * 100
        ) / 100,
    };
  }

  private drawBubbleShape(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    switch (settings.style) {
      case "speech":
        graphics.roundRect(x, y, width, height, settings.cornerRadius);
        break;
      case "thought":
        this.drawThoughtBubble(graphics, x, y, width, height, settings);
        break;
      case "shout":
        this.drawShoutBubble(graphics, x, y, width, height, settings);
        break;
      case "whisper":
        this.drawWhisperBubble(graphics, x, y, width, height, settings);
        break;
      case "cloud":
        this.drawCloudBubble(graphics, x, y, width, height, settings);
        break;
      case "jagged":
        this.drawJaggedBubble(graphics, x, y, width, height, settings);
        break;
      case "rectangle":
        graphics.roundRect(x, y, width, height, settings.cornerRadius);
        break;
      case "ellipse":
        graphics.ellipse(x + width / 2, y + height / 2, width / 2, height / 2);
        break;
      default:
        graphics.roundRect(x, y, width, height, settings.cornerRadius);
    }
  }

  private drawThoughtBubble(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const numBubbles = 16;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    for (let i = 0; i < numBubbles; i++) {
      const angle = (i / numBubbles) * Math.PI * 2;
      const bubbleRadius = 15 + Math.sin(i * 0.8) * 5;
      const bx = centerX + Math.cos(angle) * (radiusX - bubbleRadius);
      const by = centerY + Math.sin(angle) * (radiusY - bubbleRadius);
      graphics.circle(bx, by, bubbleRadius);
    }
  }

  private drawShoutBubble(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const points = 20;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const path: number[] = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius =
        i % 2 === 0 ? Math.max(width, height) / 2 : Math.max(width, height) / 3;
      const px =
        centerX + Math.cos(angle) * radius * (width / Math.max(width, height));
      const py =
        centerY + Math.sin(angle) * radius * (height / Math.max(width, height));
      path.push(px, py);
    }

    graphics.poly(path);
  }

  private drawWhisperBubble(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    graphics.roundRect(x, y, width, height, settings.cornerRadius);
  }

  private drawCloudBubble(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const numClouds = 10;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    for (let i = 0; i < numClouds; i++) {
      const angle = (i / numClouds) * Math.PI * 2;
      const radiusVar = 0.7 + Math.sin(i * 1.3) * 0.3;
      const cloudRadius = 20 + Math.sin(i * 2) * 10;
      const cx = centerX + Math.cos(angle) * (width / 2.5) * radiusVar;
      const cy = centerY + Math.sin(angle) * (height / 2.5) * radiusVar;
      graphics.circle(cx, cy, cloudRadius);
    }
  }

  private drawJaggedBubble(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const points = 24;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const path: number[] = [];
    const seed = 12345;

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radiusVar = 0.7 + Math.sin(seed + i * 2.7) * 0.3;
      const px = centerX + Math.cos(angle) * (width / 2) * radiusVar;
      const py = centerY + Math.sin(angle) * (height / 2) * radiusVar;
      path.push(px, py);
    }

    graphics.poly(path);
  }

  private drawTail(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const tailStart = this.getTailStartPoint(x, y, width, height, settings);
    const tailEnd = this.getTailEndPoint(tailStart, settings);

    switch (settings.tailStyle) {
      case "pointed":
        this.drawPointedTail(graphics, tailStart, tailEnd, settings);
        break;
      case "curved":
        this.drawCurvedTail(graphics, tailStart, tailEnd, settings);
        break;
      case "wavy":
        this.drawWavyTail(graphics, tailStart, tailEnd, settings);
        break;
      case "bubble":
        this.drawBubbleTail(graphics, tailStart, tailEnd, settings);
        break;
      case "double":
        this.drawDoubleTail(graphics, tailStart, tailEnd, settings);
        break;
    }
  }

  private getTailStartPoint(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): BubblePoint {
    if (settings.tailAngle !== undefined) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const angleRad = (settings.tailAngle * Math.PI) / 180;

      const radiusX = width / 2;
      const radiusY = height / 2;

      const edgeX = centerX + Math.cos(angleRad) * radiusX;
      const edgeY = centerY + Math.sin(angleRad) * radiusY;

      return { x: edgeX, y: edgeY };
    }

    const positions: Record<TailPosition, BubblePoint> = {
      "bottom-left": { x: x + width * 0.25, y: y + height },
      "bottom-center": { x: x + width * 0.5, y: y + height },
      "bottom-right": { x: x + width * 0.75, y: y + height },
      "top-left": { x: x + width * 0.25, y: y },
      "top-center": { x: x + width * 0.5, y: y },
      "top-right": { x: x + width * 0.75, y: y },
      left: { x: x, y: y + height * 0.5 },
      right: { x: x + width, y: y + height * 0.5 },
    };

    return positions[settings.tailPosition] || positions["bottom-center"];
  }

  private getTailEndPoint(
    start: BubblePoint,
    settings: SpeechBubbleSettings
  ): BubblePoint {
    if (settings.tailAngle !== undefined) {
      const angleRad = (settings.tailAngle * Math.PI) / 180;
      const length = settings.tailLength;

      return {
        x: start.x + Math.cos(angleRad) * length,
        y: start.y + Math.sin(angleRad) * length,
      };
    }

    const length = settings.tailLength;
    const directions: Record<TailPosition, { dx: number; dy: number }> = {
      "bottom-left": { dx: -length * 0.3, dy: length },
      "bottom-center": { dx: 0, dy: length },
      "bottom-right": { dx: length * 0.3, dy: length },
      "top-left": { dx: -length * 0.3, dy: -length },
      "top-center": { dx: 0, dy: -length },
      "top-right": { dx: length * 0.3, dy: -length },
      left: { dx: -length, dy: 0 },
      right: { dx: length, dy: 0 },
    };

    const dir =
      directions[settings.tailPosition] || directions["bottom-center"];
    return { x: start.x + dir.dx, y: start.y + dir.dy };
  }

  private drawPointedTail(
    graphics: PIXI.Graphics,
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    const width = settings.tailWidth;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const perpX = ((-dy / len) * width) / 2;
    const perpY = ((dx / len) * width) / 2;

    graphics.poly([
      start.x - perpX,
      start.y - perpY,
      end.x,
      end.y,
      start.x + perpX,
      start.y + perpY,
    ]);
  }

  private drawCurvedTail(
    graphics: PIXI.Graphics,
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    const width = settings.tailWidth;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const perpX = ((-dy / len) * width) / 2;
    const perpY = ((dx / len) * width) / 2;

    graphics.poly([
      start.x - perpX,
      start.y - perpY,
      end.x,
      end.y,
      start.x + perpX,
      start.y + perpY,
    ]);
  }

  private drawWavyTail(
    graphics: PIXI.Graphics,
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    const width = settings.tailWidth;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const perpX = ((-dy / len) * width) / 2;
    const perpY = ((dx / len) * width) / 2;

    graphics.poly([
      start.x - perpX,
      start.y - perpY,
      end.x,
      end.y,
      start.x + perpX,
      start.y + perpY,
    ]);
  }

  private drawBubbleTail(
    graphics: PIXI.Graphics,
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    const numBubbles = 3;
    const dx = (end.x - start.x) / (numBubbles + 1);
    const dy = (end.y - start.y) / (numBubbles + 1);

    for (let i = 1; i <= numBubbles; i++) {
      const x = start.x + dx * i;
      const y = start.y + dy * i;
      const radius = (settings.tailWidth / 2) * (1 - i / (numBubbles + 1));
      graphics.circle(x, y, radius);
    }
  }

  private drawDoubleTail(
    graphics: PIXI.Graphics,
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    const width = settings.tailWidth;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const perpX = ((-dy / len) * width) / 3;
    const perpY = ((dx / len) * width) / 3;

    graphics.poly([
      start.x - perpX * 2,
      start.y - perpY * 2,
      end.x - perpX,
      end.y - perpY,
      start.x - perpX,
      start.y - perpY,
    ]);

    graphics.poly([
      start.x + perpX,
      start.y + perpY,
      end.x + perpX,
      end.y + perpY,
      start.x + perpX * 2,
      start.y + perpY * 2,
    ]);
  }

  private createHandles(bubbleData: SpeechBubbleData): void {
    this.clearHandles();

    const corners = [
      { x: 0, y: 0, type: "nw" },
      { x: bubbleData.width, y: 0, type: "ne" },
      { x: bubbleData.width, y: bubbleData.height, type: "se" },
      { x: 0, y: bubbleData.height, type: "sw" },
      { x: bubbleData.width / 2, y: 0, type: "n" },
      { x: bubbleData.width, y: bubbleData.height / 2, type: "e" },
      { x: bubbleData.width / 2, y: bubbleData.height, type: "s" },
      { x: 0, y: bubbleData.height / 2, type: "w" },
    ];

    corners.forEach((corner) => {
      const handle = new PIXI.Graphics();
      handle.rect(-4, -4, 8, 8);
      handle.fill({ color: 0x00ff00, alpha: 0.8 });
      handle.stroke({ color: 0xffffff, width: 1 });
      handle.x = bubbleData.x + corner.x;
      handle.y = bubbleData.y + corner.y;
      handle.eventMode = "static";
      handle.cursor = this.getCursorForHandle(corner.type);

      handle.on("pointerdown", (event) => {
        this.startHandleDrag(event, "resize", corner.type, bubbleData);
      });

      if (this.activeLayer) {
        this.activeLayer.addChild(handle);
      }

      this.handles.push({
        graphic: handle,
        type: "resize",
        position: corner.type,
      });
    });

    if (bubbleData.settings.tailStyle !== "none") {
      const tailStart = this.getTailStartPoint(
        bubbleData.x,
        bubbleData.y,
        bubbleData.width,
        bubbleData.height,
        bubbleData.settings
      );
      const tailEnd = this.getTailEndPoint(tailStart, bubbleData.settings);

      const tailHandle = new PIXI.Graphics();
      tailHandle.circle(0, 0, 15);
      tailHandle.fill({ color: 0xff9900, alpha: 0.0 });
      tailHandle.circle(0, 0, 8);
      tailHandle.fill({ color: 0xff9900, alpha: 0.9 });
      tailHandle.stroke({ color: 0xffffff, width: 2 });

      tailHandle.x = tailEnd.x;
      tailHandle.y = tailEnd.y;
      tailHandle.eventMode = "static";
      tailHandle.cursor = "grab";

      tailHandle.on("pointerdown", (event) => {
        tailHandle.cursor = "grabbing";
        this.startHandleDrag(event, "tail", "tail", bubbleData);
      });

      tailHandle.on("pointerup", () => {
        tailHandle.cursor = "grab";
      });

      tailHandle.on("pointerupoutside", () => {
        tailHandle.cursor = "grab";
      });

      if (this.activeLayer) {
        this.activeLayer.addChild(tailHandle);
      }

      this.handles.push({
        graphic: tailHandle,
        type: "tail",
        position: "tail",
      });
    }
  }

  private getCursorForHandle(position: string): string {
    const cursors: Record<string, string> = {
      nw: "nw-resize",
      ne: "ne-resize",
      se: "se-resize",
      sw: "sw-resize",
      n: "n-resize",
      e: "e-resize",
      s: "s-resize",
      w: "w-resize",
    };
    return cursors[position] || "move";
  }

  private clearHandles(): void {
    this.handles.forEach((handle) => {
      if (handle.graphic.parent) {
        handle.graphic.parent.removeChild(handle.graphic);
      }
      handle.graphic.destroy();
    });
    this.handles = [];
  }

  private startHandleDrag(
    event: any,
    type: string,
    position: string,
    bubbleData: SpeechBubbleData
  ): void {
    event.stopPropagation();
    this.isDragging = true;
    this.dragType = position;
    this.dragStartPoint = { x: event.global.x, y: event.global.y };
    this.originalBubbleData = {
      ...bubbleData,
      settings: { ...bubbleData.settings },
    };
  }

  public handlePointerMove(point: DrawingPoint): void {
    if (
      this.isDragging &&
      this.dragType &&
      this.originalBubbleData &&
      this.selectedBubbleId
    ) {
      const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
      if (!bubbleData || !this.dragStartPoint) return;

      const dx = point.x - this.dragStartPoint.x;
      const dy = point.y - this.dragStartPoint.y;

      if (this.dragType === "tail") {
        const centerX = bubbleData.x + bubbleData.width / 2;
        const centerY = bubbleData.y + bubbleData.height / 2;
        const tailX = point.x - centerX;
        const tailY = point.y - centerY;

        const angle = Math.atan2(tailY, tailX);
        const distance = Math.sqrt(tailX * tailX + tailY * tailY);

        const minDistance = Math.min(bubbleData.width, bubbleData.height) / 3;
        const effectiveDistance = Math.max(0, distance - minDistance);

        bubbleData.settings.tailLength = Math.min(
          200,
          Math.max(5, effectiveDistance * 0.8)
        );

        const angleDeg = (angle * 180) / Math.PI;
        bubbleData.settings.tailAngle = (angleDeg + 360) % 360;
      } else {
        this.handleResize(
          this.dragType,
          dx,
          dy,
          bubbleData,
          this.originalBubbleData
        );
      }

      this.redrawAll();
      this.createHandles(bubbleData);
    }
  }

  private handleResize(
    handle: string,
    dx: number,
    dy: number,
    bubbleData: SpeechBubbleData,
    original: SpeechBubbleData
  ): void {
    switch (handle) {
      case "nw":
        bubbleData.x = original.x + dx;
        bubbleData.y = original.y + dy;
        bubbleData.width = original.width - dx;
        bubbleData.height = original.height - dy;
        break;
      case "ne":
        bubbleData.y = original.y + dy;
        bubbleData.width = original.width + dx;
        bubbleData.height = original.height - dy;
        break;
      case "se":
        bubbleData.width = original.width + dx;
        bubbleData.height = original.height + dy;
        break;
      case "sw":
        bubbleData.x = original.x + dx;
        bubbleData.width = original.width - dx;
        bubbleData.height = original.height + dy;
        break;
      case "n":
        bubbleData.y = original.y + dy;
        bubbleData.height = original.height - dy;
        break;
      case "e":
        bubbleData.width = original.width + dx;
        break;
      case "s":
        bubbleData.height = original.height + dy;
        break;
      case "w":
        bubbleData.x = original.x + dx;
        bubbleData.width = original.width - dx;
        break;
    }

    bubbleData.width = Math.max(50, Math.round(bubbleData.width * 100) / 100);
    bubbleData.height = Math.max(30, Math.round(bubbleData.height * 100) / 100);

    bubbleData.settings.width = bubbleData.width;
    bubbleData.settings.height = bubbleData.height;
    bubbleData.settings.autoSize = false;

    this.redrawAll();
  }

  public handlePointerUp(): void {
    const wasResizing =
      this.isDragging && this.dragType && this.dragType !== "tail";

    this.isDragging = false;
    this.dragType = null;
    this.dragStartPoint = null;
    this.originalBubbleData = null;

    this.handles.forEach((handle) => {
      if (handle.type === "tail") {
        handle.graphic.cursor = "grab";
      }
    });

    if (wasResizing && this.selectedBubbleId && this.onSelectionChange) {
      const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
      if (bubbleData) {
        this.onSelectionChange(bubbleData.settings);
      }
    }
  }

  private redrawAll(): void {
    if (!this.renderTexture || !this.currentLayerId) return;

    if (this.bubbleContainer) {
      this.bubbleContainer.removeChildren();
    } else {
      this.bubbleContainer = new PIXI.Container();
    }

    for (const [id, bubbleData] of this.activeBubbles) {
      if (bubbleData.layerId !== this.currentLayerId) continue;
      if (bubbleData.settings.tailAngle === undefined) {
        bubbleData.settings.tailAngle = this.getTailAngleFromPosition(
          bubbleData.settings.tailPosition
        );
      }

      if (
        bubbleData.settings.autoSize &&
        bubbleData.settings.text &&
        bubbleData.settings.text.trim() !== ""
      ) {
        const metrics = this.calculateTextMetrics(
          bubbleData.settings.text,
          bubbleData.settings
        );
        bubbleData.width = metrics.width;
        bubbleData.height = metrics.height;
      } else if (
        bubbleData.settings.autoSize &&
        (!bubbleData.settings.text || bubbleData.settings.text.trim() === "")
      ) {
        bubbleData.width = bubbleData.settings.width;
        bubbleData.height = bubbleData.settings.height;
      }

      const bubbleGraphics = new PIXI.Graphics();

      if (bubbleData.settings.tailStyle !== "none") {
        this.drawTail(
          bubbleGraphics,
          bubbleData.x,
          bubbleData.y,
          bubbleData.width,
          bubbleData.height,
          bubbleData.settings
        );

        bubbleGraphics.fill({
          color: this.hexToNumber(bubbleData.settings.backgroundColor),
          alpha: 1,
        });

        if (bubbleData.settings.borderWidth > 0) {
          bubbleGraphics.stroke({
            color: this.hexToNumber(bubbleData.settings.borderColor),
            width: bubbleData.settings.borderWidth,
            alpha: 1,
          });
        }
      }

      this.drawBubbleShape(
        bubbleGraphics,
        bubbleData.x,
        bubbleData.y,
        bubbleData.width,
        bubbleData.height,
        bubbleData.settings
      );

      bubbleGraphics.fill({
        color: this.hexToNumber(bubbleData.settings.backgroundColor),
        alpha: 1,
      });

      if (bubbleData.settings.borderWidth > 0) {
        bubbleGraphics.stroke({
          color: this.hexToNumber(bubbleData.settings.borderColor),
          width: bubbleData.settings.borderWidth,
          alpha: 1,
        });
      }

      bubbleGraphics.alpha = bubbleData.settings.opacity;
      this.bubbleContainer.addChild(bubbleGraphics);

      if (bubbleData.settings.text && bubbleData.settings.text.trim() !== "") {
        const text = new PIXI.Text(bubbleData.settings.text, {
          fontFamily: bubbleData.settings.fontFamily,
          fontSize: bubbleData.settings.fontSize,
          fill: bubbleData.settings.textColor,
          wordWrap: true,
          wordWrapWidth: bubbleData.width - bubbleData.settings.padding * 2,
          lineHeight: bubbleData.settings.fontSize * 1.4,
          align: "center",
        });

        const textBounds = text.getBounds();
        const availableWidth =
          bubbleData.width - bubbleData.settings.padding * 2;
        const availableHeight =
          bubbleData.height - bubbleData.settings.padding * 2;

        text.x =
          bubbleData.x +
          bubbleData.settings.padding +
          (availableWidth - textBounds.width) / 2;
        text.y =
          bubbleData.y +
          bubbleData.settings.padding +
          (availableHeight - textBounds.height) / 2;
        text.alpha = bubbleData.settings.opacity;

        this.bubbleContainer.addChild(text);
      }
    }

    this.app.renderer.render({
      container: this.bubbleContainer,
      target: this.renderTexture,
      clear: true,
    });
  }

  public startDrawing(point: DrawingPoint): void {
    if (!this.renderTexture || !this.activeLayer || !this.currentLayerId)
      return;

    this.isDrawing = true;
    this.startPoint = point;
    this.isEditMode = false;

    const bubbleId = this.generateBubbleId();
    const bubbleData: SpeechBubbleData = {
      id: bubbleId,
      x: point.x,
      y: point.y,
      width: this.settings.width,
      height: this.settings.height,
      layerId: this.currentLayerId,
      settings: {
        ...this.settings,
        tailAngle:
          this.settings.tailAngle ||
          this.getTailAngleFromPosition(this.settings.tailPosition),
      },
    };

    this.activeBubbles.set(bubbleId, bubbleData);
    this.selectedBubbleId = bubbleId;

    this.redrawAll();
  }

  public continueDrawing(point: DrawingPoint): void {
    if (!this.isDrawing || !this.startPoint || !this.selectedBubbleId) return;

    const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
    if (!bubbleData) return;

    bubbleData.width =
      Math.round(Math.abs(point.x - this.startPoint.x) * 100) / 100;
    bubbleData.height =
      Math.round(Math.abs(point.y - this.startPoint.y) * 100) / 100;
    bubbleData.x = Math.round(Math.min(this.startPoint.x, point.x) * 100) / 100;
    bubbleData.y = Math.round(Math.min(this.startPoint.y, point.y) * 100) / 100;

    bubbleData.settings.width = bubbleData.width;
    bubbleData.settings.height = bubbleData.height;
    bubbleData.settings.autoSize = false;

    this.redrawAll();
  }

  public endDrawing(): void {
    if (!this.isDrawing || !this.selectedBubbleId) return;

    this.isDrawing = false;
    const bubbleData = this.activeBubbles.get(this.selectedBubbleId);

    if (bubbleData) {
      if (bubbleData.width < 20 || bubbleData.height < 20) {
        bubbleData.width = this.settings.width;
        bubbleData.height = this.settings.height;
        bubbleData.settings.width = this.settings.width;
        bubbleData.settings.height = this.settings.height;
        bubbleData.settings.autoSize = true;
      }

      this.isEditMode = true;
      this.redrawAll();
      this.createHandles(bubbleData);

      if (this.onSelectionChange) {
        this.onSelectionChange(bubbleData.settings);
      }
    }

    this.startPoint = null;
  }

  public selectBubbleAt(point: DrawingPoint): boolean {
    for (const [id, bubble] of this.activeBubbles) {
      if (bubble.layerId !== this.currentLayerId) continue;

      const margin = 20;
      if (
        point.x >= bubble.x - margin &&
        point.x <= bubble.x + bubble.width + margin &&
        point.y >= bubble.y - margin &&
        point.y <= bubble.y + bubble.height + margin
      ) {
        this.selectedBubbleId = id;
        this.isEditMode = true;
        this.createHandles(bubble);

        if (this.onSelectionChange) {
          this.onSelectionChange(bubble.settings);
        }

        return true;
      }
    }

    if (this.selectedBubbleId && this.isEditMode) {
      const selectedBubble = this.activeBubbles.get(this.selectedBubbleId);
      if (selectedBubble && selectedBubble.layerId === this.currentLayerId) {
        const handleMargin = 30;
        if (
          point.x >= selectedBubble.x - handleMargin &&
          point.x <= selectedBubble.x + selectedBubble.width + handleMargin &&
          point.y >= selectedBubble.y - handleMargin &&
          point.y <= selectedBubble.y + selectedBubble.height + handleMargin
        ) {
          return true;
        }

        if (selectedBubble.settings.tailStyle !== "none") {
          const tailStart = this.getTailStartPoint(
            selectedBubble.x,
            selectedBubble.y,
            selectedBubble.width,
            selectedBubble.height,
            selectedBubble.settings
          );
          const tailEnd = this.getTailEndPoint(
            tailStart,
            selectedBubble.settings
          );
          const tailDistance = Math.sqrt(
            Math.pow(point.x - tailEnd.x, 2) + Math.pow(point.y - tailEnd.y, 2)
          );
          // 꼬리 핸들 클릭 영역 확장 (20 -> 30)
          if (tailDistance <= 30) {
            return true;
          }
        }
      }
    }

    this.clearHandles();
    this.selectedBubbleId = null;
    this.isEditMode = false;

    if (this.onSelectionChange) {
      this.onSelectionChange(null);
    }

    return false;
  }

  public updateLayerSelection(layerId: string | null): void {
    this.setCurrentLayerId(layerId);

    if (!layerId) {
      this.clearHandles();
      this.selectedBubbleId = null;
      this.isEditMode = false;

      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
      return;
    }

    let foundBubble = false;
    for (const [id, bubble] of this.activeBubbles) {
      if (bubble.layerId === layerId) {
        if (!foundBubble) {
          this.selectedBubbleId = id;
          this.isEditMode = true;
          this.createHandles(bubble);
          foundBubble = true;

          if (this.onSelectionChange) {
            this.onSelectionChange(bubble.settings);
          }
        }
      }
    }

    if (!foundBubble) {
      this.clearHandles();
      this.selectedBubbleId = null;
      this.isEditMode = false;

      if (this.onSelectionChange) {
        this.onSelectionChange(null);
      }
    }
  }

  public deleteSelectedBubble(): void {
    if (!this.selectedBubbleId) return;

    this.activeBubbles.delete(this.selectedBubbleId);
    this.clearHandles();
    this.selectedBubbleId = null;
    this.isEditMode = false;

    this.redrawAll();

    if (this.onSelectionChange) {
      this.onSelectionChange(null);
    }
  }

  public getSelectedBubbleSettings(): SpeechBubbleSettings | null {
    if (!this.selectedBubbleId) return null;
    const bubble = this.activeBubbles.get(this.selectedBubbleId);
    return bubble ? bubble.settings : null;
  }

  public isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  public clearAll(): void {
    this.clearHandles();
    this.activeBubbles.clear();
    this.selectedBubbleId = null;
    this.isEditMode = false;

    if (this.renderTexture && this.bubbleContainer) {
      this.bubbleContainer.removeChildren();
      this.app.renderer.render({
        container: this.bubbleContainer,
        target: this.renderTexture,
        clear: true,
      });
    }
  }

  public cleanup(): void {
    this.clearHandles();
    this.activeBubbles.clear();

    if (this.bubbleContainer) {
      this.bubbleContainer.destroy(true);
      this.bubbleContainer = null;
    }

    this.renderTexture = null;
    this.activeLayer = null;
  }

  private hexToNumber(hex: string): number {
    return parseInt(hex.replace("#", ""), 16);
  }
}
