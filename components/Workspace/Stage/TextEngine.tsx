import { Layer } from "@/types/layer";
import { TextSettings } from "@/types/text";
import * as PIXI from "pixi.js";
import { worldToScreen, worldToScreenPoint } from "@/utils/coordinate";

export interface TextPoint {
  x: number;
  y: number;
}

export class TextEngine {
  private app: PIXI.Application;
  private activeTextInput: HTMLTextAreaElement | null = null;
  private editingTextLayer: PIXI.Text | null = null;
  private currentTextLayer: PIXI.Text | null = null;
  private settings: TextSettings;
  private activeLayer: Layer | null = null;
  private renderTexture: PIXI.RenderTexture | null = null;
  private onTextLayerCreated?: (textLayer: PIXI.Text) => void;
  private onLayerDelete?: (layerId: string) => void;
  private onThumbnailUpdate?: () => void;
  private textObjects: PIXI.Text[] = [];
  private isProcessing: boolean = false;
  private layerTexts: Record<string, PIXI.Text[]> = {};
  private currentLayerId: string | null = null;
  private originalPosition: { x: number; y: number } | null = null;
  private newlyCreatedLayerId: string | null = null;

  constructor(app: PIXI.Application, initialSettings: TextSettings) {
    this.app = app;
    this.settings = { ...initialSettings };
  }

  public updateSettings(newSettings: TextSettings): void {
    this.settings = { ...newSettings };
    if (this.currentTextLayer && !this.editingTextLayer) {
      this.updateTextLayerStyle(this.currentTextLayer);
    }
  }

  public setActiveLayer(layer: Layer): void {
    if (this.currentLayerId && this.currentLayerId !== layer.id) {
      this.layerTexts[this.currentLayerId] = [...this.textObjects];
    }

    this.activeLayer = layer;
    this.currentLayerId = layer.id;

    this.textObjects = this.layerTexts[layer.id] || [];
  }

  public setSharedRenderTexture(
    renderTexture: PIXI.RenderTexture | null
  ): void {
    this.renderTexture = renderTexture;
  }

  public setOnTextLayerCreated(callback: (textLayer: PIXI.Text) => void): void {
    this.onTextLayerCreated = callback;
  }

  public setOnLayerDelete(callback: (layerId: string) => void): void {
    this.onLayerDelete = callback;
  }

  public setOnThumbnailUpdate(callback: () => void): void {
    this.onThumbnailUpdate = callback;
  }

  public getTextAtPosition(x: number, y: number): PIXI.Text | null {
    for (const textObj of this.textObjects) {
      if (!textObj.visible || !textObj.text) continue;

      try {
        const bounds = textObj.getBounds();
        if (!bounds || bounds.width === 0 || bounds.height === 0) {
          continue;
        }

        if (
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        ) {
          return textObj;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  private setupTextInteraction(): void {
    if (!this.activeLayer) return;
  }

  public startTextInput(point: TextPoint, newLayerId?: string): void {
    if (this.activeTextInput) {
      this.completeTextInput();
    }

    this.newlyCreatedLayerId = newLayerId || null;

    const { x: screenX, y: screenY } = worldToScreenPoint(this.app, point);

    const textarea = document.createElement("textarea");
    textarea.style.position = "absolute";
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.minWidth = "100px";
    textarea.style.minHeight = "20px";
    textarea.style.background = "transparent";
    textarea.style.border = "1px dashed #007acc";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.fontSize = `${this.settings.fontSize}px`;
    textarea.style.fontFamily = this.settings.fontFamily;
    textarea.style.color = this.settings.fill;
    textarea.style.fontWeight = this.settings.fontWeight;
    textarea.style.fontStyle = this.settings.fontStyle;
    textarea.style.letterSpacing = `${this.settings.letterSpacing}px`;
    textarea.style.lineHeight = `${this.settings.lineHeight}`;
    textarea.style.textAlign = this.settings.align as any;
    textarea.style.zIndex = "10000";
    textarea.style.overflow = "hidden";
    textarea.style.whiteSpace = "pre-wrap";

    document.body.appendChild(textarea);
    textarea.focus();

    this.activeTextInput = textarea;
    this.activeTextInput.dataset.originalX = point.x.toString();
    this.activeTextInput.dataset.originalY = point.y.toString();

    textarea.addEventListener("blur", () => {
      if (!this.isProcessing) {
        this.completeTextInput();
      }
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelTextInput();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.completeTextInput();
        return;
      }
      e.stopPropagation();
    });

    textarea.addEventListener("input", () => this.adjustTextareaSize());

    this.adjustTextareaSize();
  }

  public editExistingText(textLayer: PIXI.Text): void {
    if (this.activeTextInput) {
      this.completeTextInput();
    }

    this.newlyCreatedLayerId = null;

    this.editingTextLayer = textLayer;
    this.originalPosition = { x: textLayer.x, y: textLayer.y };
    textLayer.visible = false;
    this.renderAllTextsToTexture();

    const { x: screenX, y: screenY } = worldToScreen(
      this.app,
      textLayer.x,
      textLayer.y
    );

    const fillColor = this.getFillColorAsString(textLayer.style.fill);

    const textarea = document.createElement("textarea");
    textarea.value = textLayer.text;
    textarea.style.position = "absolute";
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.background = "transparent";
    textarea.style.border = "1px dashed #007acc";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.fontSize = `${textLayer.style.fontSize}px`;
    textarea.style.fontFamily = Array.isArray(textLayer.style.fontFamily)
      ? textLayer.style.fontFamily[0]
      : (textLayer.style.fontFamily as string);
    textarea.style.color = fillColor;
    textarea.style.fontWeight =
      (textLayer.style.fontWeight as string) || "normal";
    textarea.style.fontStyle =
      (textLayer.style.fontStyle as string) || "normal";
    textarea.style.letterSpacing = `${textLayer.style.letterSpacing || 0}px`;
    const lineHeightRatio =
      (textLayer.style.lineHeight as number) /
      (textLayer.style.fontSize as number);
    textarea.style.lineHeight = `${lineHeightRatio}`;
    textarea.style.textAlign = (textLayer.style.align as string) || "left";
    textarea.style.zIndex = "10000";
    textarea.style.overflow = "hidden";
    textarea.style.whiteSpace = "pre-wrap";

    document.body.appendChild(textarea);

    this.activeTextInput = textarea;
    this.adjustTextareaSize();
    textarea.scrollLeft = 0;
    textarea.focus();
    textarea.select();

    textarea.addEventListener("blur", () => {
      if (!this.isProcessing) {
        this.completeTextEdit();
      }
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelTextEdit();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.completeTextEdit();
        return;
      }
      e.stopPropagation();
    });

    textarea.addEventListener("input", () => this.adjustTextareaSize());
  }

  private getFillColorAsString(fill: any): string {
    if (typeof fill === "string") {
      return fill;
    }
    if (typeof fill === "number") {
      return `#${fill.toString(16).padStart(6, "0")}`;
    }
    if (Array.isArray(fill)) {
      const firstFill = fill[0];
      if (typeof firstFill === "string") {
        return firstFill;
      }
      if (typeof firstFill === "number") {
        return `#${firstFill.toString(16).padStart(6, "0")}`;
      }
    }
    return "#000000";
  }

  private adjustTextareaSize(): void {
    if (!this.activeTextInput) return;
    const textarea = this.activeTextInput;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(20, textarea.scrollHeight + 4)}px`;

    let ruler = document.getElementById("textarea-ruler") as HTMLSpanElement;
    if (!ruler) {
      ruler = document.createElement("span");
      ruler.id = "textarea-ruler";
      ruler.style.position = "absolute";
      ruler.style.visibility = "hidden";
      ruler.style.whiteSpace = "pre";
      document.body.appendChild(ruler);
    }

    ruler.style.fontSize = textarea.style.fontSize;
    ruler.style.fontFamily = textarea.style.fontFamily;
    ruler.style.fontWeight = textarea.style.fontWeight;
    ruler.style.fontStyle = textarea.style.fontStyle;
    ruler.style.letterSpacing = textarea.style.letterSpacing;
    ruler.style.lineHeight = textarea.style.lineHeight;

    ruler.textContent = textarea.value || " ";
    const minWidth = 150;
    const rulerWidth = ruler.offsetWidth;

    textarea.style.width = `${Math.max(minWidth, rulerWidth + 12)}px`;
    textarea.style.maxWidth = "none";
  }

  private completeTextInput(): void {
    if (!this.activeTextInput || this.isProcessing) return;
    this.isProcessing = true;

    const text = this.activeTextInput.value;
    const originalX = parseFloat(this.activeTextInput.dataset.originalX || "0");
    const originalY = parseFloat(this.activeTextInput.dataset.originalY || "0");

    if (text.trim()) {
      const textLayer = this.createTextLayer(text, originalX, originalY);
      if (this.activeLayer) {
        this.textObjects.push(textLayer);
        if (this.currentLayerId) {
          this.layerTexts[this.currentLayerId] = [...this.textObjects];
        }
        this.renderAllTextsToTexture();
        this.scheduleThumbnailUpdate();
      }
      this.currentTextLayer = textLayer;
      this.onTextLayerCreated?.(textLayer);
    } else {
      if (this.newlyCreatedLayerId && this.onLayerDelete) {
        this.onLayerDelete(this.newlyCreatedLayerId);
      }
    }

    this.removeTextInput();
  }

  private completeTextEdit(): void {
    if (!this.activeTextInput || !this.editingTextLayer || this.isProcessing)
      return;
    this.isProcessing = true;

    const newText = this.activeTextInput.value.replace(/^\s*|\s*$/g, "");
    if (newText) {
      this.editingTextLayer.text = newText;
      if (this.originalPosition) {
        this.editingTextLayer.x = this.originalPosition.x;
        this.editingTextLayer.y = this.originalPosition.y;
      }
      this.editingTextLayer.visible = true;
      this.updateTextLayerStyle(this.editingTextLayer);
      if (this.currentLayerId) {
        this.layerTexts[this.currentLayerId] = [...this.textObjects];
      }
      this.renderAllTextsToTexture();
      this.scheduleThumbnailUpdate();
    } else {
      if (this.editingTextLayer.parent) {
        this.editingTextLayer.parent.removeChild(this.editingTextLayer);
      }
      this.textObjects = this.textObjects.filter(
        (t) => t !== this.editingTextLayer
      );
      if (this.currentLayerId) {
        this.layerTexts[this.currentLayerId] = [...this.textObjects];
      }
      this.editingTextLayer.destroy();
      this.renderAllTextsToTexture();
      this.scheduleThumbnailUpdate();
    }

    this.removeTextInput();
    this.editingTextLayer = null;
    this.originalPosition = null;
  }

  private cancelTextInput(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.newlyCreatedLayerId && this.onLayerDelete) {
      this.onLayerDelete(this.newlyCreatedLayerId);
    }

    this.removeTextInput();
  }

  private cancelTextEdit(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.editingTextLayer) {
      if (this.originalPosition) {
        this.editingTextLayer.x = this.originalPosition.x;
        this.editingTextLayer.y = this.originalPosition.y;
      }
      this.editingTextLayer.visible = true;
      this.renderAllTextsToTexture();
    }
    this.removeTextInput();
    this.editingTextLayer = null;
    this.originalPosition = null;
  }

  private removeTextInput(): void {
    if (this.activeTextInput && this.activeTextInput.parentNode) {
      this.activeTextInput.remove();
    }
    this.activeTextInput = null;
    this.newlyCreatedLayerId = null;
    this.isProcessing = false;
  }

  private createTextLayer(text: string, x: number, y: number): PIXI.Text {
    const textStyle = new PIXI.TextStyle({
      fontSize: this.settings.fontSize,
      fontFamily: this.settings.fontFamily,
      fill: this.settings.fill,
      letterSpacing: this.settings.letterSpacing,
      lineHeight: this.settings.fontSize * this.settings.lineHeight,
      fontWeight: this.settings.fontWeight,
      fontStyle: this.settings.fontStyle,
      align: this.settings.align,
      wordWrap: this.settings.wordWrap,
      wordWrapWidth: this.settings.wordWrap
        ? this.settings.wordWrapWidth
        : 100000,
      breakWords: this.settings.wordWrap,
    });

    const pixiText = new PIXI.Text(text, textStyle);

    pixiText.x = x;
    pixiText.y = y;
    pixiText.eventMode = "static";
    pixiText.cursor = "pointer";

    return pixiText;
  }

  private updateTextLayerStyle(textLayer: PIXI.Text): void {
    if (!textLayer || !textLayer.style) return;

    textLayer.style.fontSize = this.settings.fontSize;
    textLayer.style.fontFamily = this.settings.fontFamily;
    textLayer.style.fill = this.settings.fill;
    textLayer.style.letterSpacing = this.settings.letterSpacing;
    textLayer.style.lineHeight =
      this.settings.fontSize * this.settings.lineHeight;
    textLayer.style.fontWeight = this.settings.fontWeight;
    textLayer.style.fontStyle = this.settings.fontStyle;
    textLayer.style.align = this.settings.align;
    textLayer.style.wordWrap = this.settings.wordWrap;
    textLayer.style.wordWrapWidth = this.settings.wordWrap
      ? this.settings.wordWrapWidth
      : 100000;
    textLayer.style.breakWords = this.settings.wordWrap;
  }

  private renderAllTextsToTexture(): void {
    if (
      !this.renderTexture ||
      !this.activeLayer ||
      this.activeLayer.type !== "text"
    )
      return;

    this.app.renderer.render({
      container: new PIXI.Container(),
      target: this.renderTexture,
      clear: true,
    });

    for (const textObj of this.textObjects) {
      if (!textObj.visible) continue;

      try {
        const textSprite = new PIXI.Text(textObj.text, textObj.style);
        textSprite.x = textObj.x;
        textSprite.y = textObj.y;

        this.app.renderer.render({
          container: textSprite,
          target: this.renderTexture,
          clear: false,
          transform: undefined,
        });

        textSprite.destroy();
      } catch (error) {}
    }
  }

  private renderTextToTexture(textLayer: PIXI.Text): void {
    if (
      !this.renderTexture ||
      !this.activeLayer ||
      this.activeLayer.type !== "text"
    )
      return;

    try {
      const textSprite = new PIXI.Text(textLayer.text, textLayer.style);
      textSprite.x = textLayer.x;
      textSprite.y = textLayer.y;

      this.app.renderer.render({
        container: textSprite,
        target: this.renderTexture,
        clear: false,
        transform: undefined,
      });

      textSprite.destroy();
    } catch (error) {
      console.error("텍스트 렌더링 실패:", error);
    }
  }

  private scheduleThumbnailUpdate(): void {
    if (this.onThumbnailUpdate) {
      setTimeout(() => {
        this.onThumbnailUpdate!();
      }, 100);
    }
  }

  public selectTextLayer(textLayer: PIXI.Text): void {
    this.currentTextLayer = textLayer;
  }

  public getCurrentTextLayer(): PIXI.Text | null {
    return this.currentTextLayer;
  }

  public isCurrentlyEditing(): boolean {
    return this.activeTextInput !== null;
  }

  public cleanup(): void {
    this.removeTextInput();
    this.editingTextLayer = null;
    this.currentTextLayer = null;
    this.activeLayer = null;
    this.renderTexture = null;
    this.textObjects.forEach((text) => text.destroy());
    this.textObjects = [];
    this.layerTexts = {};
    this.currentLayerId = null;
    this.originalPosition = null;
    this.newlyCreatedLayerId = null;
  }
}
