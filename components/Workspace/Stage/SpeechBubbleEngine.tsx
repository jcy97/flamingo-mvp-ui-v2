import * as PIXI from "pixi.js";
import { SpeechBubbleSettings, SpeechBubbleData } from "@/types/speechBubble";
import { BubbleDrawer } from "@/utils/bubbleDrawer";
import { BubbleHandleManager } from "@/utils/bubbleHandle";
import { BubbleUtils } from "@/utils/bubble";

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export class SpeechBubbleEngine {
  private app: PIXI.Application;
  private settings: SpeechBubbleSettings;
  private renderTexture: PIXI.RenderTexture | null = null;
  private activeLayer: PIXI.Container | null = null;
  private isDrawing = false;
  private startPoint: DrawingPoint | null = null;
  private activeBubbles: Map<string, SpeechBubbleData> = new Map();
  private selectedBubbleId: string | null = null;
  private isEditMode = false;
  private bubbleContainer: PIXI.Container | null = null;
  private currentLayerId: string | null = null;
  private onSelectionChange:
    | ((settings: SpeechBubbleSettings | null) => void)
    | null = null;

  private drawer: BubbleDrawer;
  private handleManager: BubbleHandleManager;

  constructor(app: PIXI.Application, initialSettings: SpeechBubbleSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
    this.bubbleContainer = new PIXI.Container();
    this.drawer = new BubbleDrawer();
    this.handleManager = new BubbleHandleManager(null);
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
    this.handleManager.setActiveLayer(layer);
  }

  public setCurrentLayerId(layerId: string | null): void {
    this.currentLayerId = layerId;
    if (!layerId) {
      this.handleManager.clearHandles();
      this.selectedBubbleId = null;
      this.isEditMode = false;
    }
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
          BubbleUtils.getTailAngleFromPosition(this.settings.tailPosition),
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
      if (this.isPointInBubble(point, bubble, margin)) {
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
        if (this.isPointInHandleArea(point, selectedBubble)) {
          return true;
        }
      }
    }

    this.clearSelection();
    return false;
  }

  public handlePointerMove(point: DrawingPoint): void {
    if (this.handleManager.isDraggingHandle && this.selectedBubbleId) {
      const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
      if (bubbleData) {
        this.handleManager.handleMove(point, bubbleData);
        this.redrawAll();
        this.createHandles(bubbleData);
      }
    }
  }

  public handlePointerUp(): void {
    const wasResizing = this.handleManager.endDrag();

    if (wasResizing && this.selectedBubbleId && this.onSelectionChange) {
      const bubbleData = this.activeBubbles.get(this.selectedBubbleId);
      if (bubbleData) {
        this.onSelectionChange(bubbleData.settings);
      }
    }
  }

  public updateLayerSelection(layerId: string | null): void {
    this.setCurrentLayerId(layerId);

    if (!layerId) {
      this.clearSelection();
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
      this.clearSelection();
    }
  }

  public deleteSelectedBubble(): void {
    if (!this.selectedBubbleId) return;

    this.activeBubbles.delete(this.selectedBubbleId);
    this.clearSelection();
    this.redrawAll();
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
    this.handleManager.clearHandles();
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
    this.handleManager.destroy();
    this.drawer.destroy();
    this.activeBubbles.clear();

    if (this.bubbleContainer) {
      this.bubbleContainer.destroy(true);
      this.bubbleContainer = null;
    }

    this.renderTexture = null;
    this.activeLayer = null;
  }

  private generateBubbleId(): string {
    return `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createHandles(bubbleData: SpeechBubbleData): void {
    this.handleManager.createHandles(
      bubbleData,
      (event, type, position, data) => {
        this.handleManager.startDrag(event, type, position, data);
      }
    );
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
      this.drawer.renderBubble(
        this.app,
        bubbleData,
        this.renderTexture,
        this.bubbleContainer
      );
    }
  }

  private isPointInBubble(
    point: DrawingPoint,
    bubble: SpeechBubbleData,
    margin: number = 0
  ): boolean {
    return (
      point.x >= bubble.x - margin &&
      point.x <= bubble.x + bubble.width + margin &&
      point.y >= bubble.y - margin &&
      point.y <= bubble.y + bubble.height + margin
    );
  }

  private isPointInHandleArea(
    point: DrawingPoint,
    bubble: SpeechBubbleData
  ): boolean {
    const handleMargin = 30;
    if (this.isPointInBubble(point, bubble, handleMargin)) {
      return true;
    }

    if (bubble.settings.tailStyle !== "none") {
      const tailStart = BubbleUtils.getTailStartPoint(
        bubble.x,
        bubble.y,
        bubble.width,
        bubble.height,
        bubble.settings
      );
      const tailEnd = BubbleUtils.getTailEndPoint(tailStart, bubble.settings);
      const tailDistance = Math.sqrt(
        Math.pow(point.x - tailEnd.x, 2) + Math.pow(point.y - tailEnd.y, 2)
      );
      if (tailDistance <= 30) {
        return true;
      }
    }

    return false;
  }

  private clearSelection(): void {
    this.handleManager.clearHandles();
    this.selectedBubbleId = null;
    this.isEditMode = false;

    if (this.onSelectionChange) {
      this.onSelectionChange(null);
    }
  }
}
