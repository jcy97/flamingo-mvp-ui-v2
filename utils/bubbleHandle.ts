import * as PIXI from "pixi.js";
import { SpeechBubbleData } from "@/types/speechBubble";
import { BubbleUtils } from "./bubble";

interface BubbleHandle {
  graphic: PIXI.Graphics;
  type: "resize" | "tail" | "rotate" | "move";
  position: string;
}

export class BubbleHandleManager {
  private handles: BubbleHandle[] = [];
  private activeLayer: PIXI.Container | null = null;
  private isDragging = false;
  private dragType: string | null = null;
  private dragStartPoint: { x: number; y: number } | null = null;
  private originalBubbleData: SpeechBubbleData | null = null;

  constructor(activeLayer: PIXI.Container | null) {
    this.activeLayer = activeLayer;
  }

  setActiveLayer(layer: PIXI.Container | null): void {
    this.activeLayer = layer;
  }

  createHandles(
    bubbleData: SpeechBubbleData,
    onHandleDrag: (
      event: any,
      type: string,
      position: string,
      bubbleData: SpeechBubbleData
    ) => void
  ): void {
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
      const handle = this.createResizeHandle(corner, bubbleData, onHandleDrag);
      if (handle && this.activeLayer) {
        this.activeLayer.addChild(handle.graphic);
        this.handles.push(handle);
      }
    });

    if (bubbleData.settings.tailStyle !== "none") {
      const tailHandle = this.createTailHandle(bubbleData, onHandleDrag);
      if (tailHandle && this.activeLayer) {
        this.activeLayer.addChild(tailHandle.graphic);
        this.handles.push(tailHandle);
      }
    }
  }

  private createResizeHandle(
    corner: { x: number; y: number; type: string },
    bubbleData: SpeechBubbleData,
    onHandleDrag: (
      event: any,
      type: string,
      position: string,
      bubbleData: SpeechBubbleData
    ) => void
  ): BubbleHandle | null {
    const handle = new PIXI.Graphics();
    handle.rect(-4, -4, 8, 8);
    handle.fill({ color: 0x00ff00, alpha: 0.8 });
    handle.stroke({ color: 0xffffff, width: 1 });
    handle.x = bubbleData.x + corner.x;
    handle.y = bubbleData.y + corner.y;
    handle.eventMode = "static";
    handle.cursor = this.getCursorForHandle(corner.type);

    handle.on("pointerdown", (event) => {
      onHandleDrag(event, "resize", corner.type, bubbleData);
    });

    return {
      graphic: handle,
      type: "resize",
      position: corner.type,
    };
  }

  private createTailHandle(
    bubbleData: SpeechBubbleData,
    onHandleDrag: (
      event: any,
      type: string,
      position: string,
      bubbleData: SpeechBubbleData
    ) => void
  ): BubbleHandle | null {
    const tailStart = BubbleUtils.getTailStartPoint(
      bubbleData.x,
      bubbleData.y,
      bubbleData.width,
      bubbleData.height,
      bubbleData.settings
    );
    const tailEnd = BubbleUtils.getTailEndPoint(tailStart, bubbleData.settings);

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
      onHandleDrag(event, "tail", "tail", bubbleData);
    });

    tailHandle.on("pointerup", () => {
      tailHandle.cursor = "grab";
    });

    tailHandle.on("pointerupoutside", () => {
      tailHandle.cursor = "grab";
    });

    return {
      graphic: tailHandle,
      type: "tail",
      position: "tail",
    };
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

  clearHandles(): void {
    this.handles.forEach((handle) => {
      if (handle.graphic.parent) {
        handle.graphic.parent.removeChild(handle.graphic);
      }
      handle.graphic.destroy();
    });
    this.handles = [];
  }

  startDrag(
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

  handleMove(
    point: { x: number; y: number },
    bubbleData: SpeechBubbleData
  ): boolean {
    if (
      !this.isDragging ||
      !this.dragType ||
      !this.originalBubbleData ||
      !this.dragStartPoint
    ) {
      return false;
    }

    const dx = point.x - this.dragStartPoint.x;
    const dy = point.y - this.dragStartPoint.y;

    if (this.dragType === "tail") {
      this.handleTailMove(point, bubbleData);
    } else {
      this.handleResize(
        this.dragType,
        dx,
        dy,
        bubbleData,
        this.originalBubbleData
      );
    }

    return true;
  }

  private handleTailMove(
    point: { x: number; y: number },
    bubbleData: SpeechBubbleData
  ): void {
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
  }

  endDrag(): boolean {
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

    return !wasResizing;
  }

  get isDraggingHandle(): boolean {
    return this.isDragging;
  }

  destroy(): void {
    this.clearHandles();
  }
}
