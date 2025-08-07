import { TextSettings } from "@/types/text";
import * as PIXI from "pixi.js";

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
  private activeLayer: PIXI.Container | null = null;
  private renderTexture: PIXI.RenderTexture | null = null;
  private onTextLayerCreated?: (textLayer: PIXI.Text) => void;

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

  public setActiveLayer(layer: PIXI.Container): void {
    this.activeLayer = layer;
  }

  public setSharedRenderTexture(renderTexture: PIXI.RenderTexture): void {
    this.renderTexture = renderTexture;
  }

  public setOnTextLayerCreated(callback: (textLayer: PIXI.Text) => void): void {
    this.onTextLayerCreated = callback;
  }

  public startTextInput(point: TextPoint): void {
    if (this.activeTextInput) {
      this.finishTextInput();
    }

    const canvas = this.app.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    const textarea = document.createElement("textarea");
    textarea.style.position = "absolute";
    textarea.style.left = `${rect.left + point.x}px`;
    textarea.style.top = `${rect.top + point.y}px`;
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

    document.body.appendChild(textarea);
    textarea.focus();

    this.activeTextInput = textarea;
    this.activeTextInput.dataset.originalX = point.x.toString();
    this.activeTextInput.dataset.originalY = point.y.toString();

    textarea.addEventListener("blur", () => this.finishTextInput());
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelTextInput();
      }
      e.stopPropagation();
    });
    textarea.addEventListener("input", () => this.adjustTextareaSize());

    this.adjustTextareaSize();
  }

  public editExistingText(textLayer: PIXI.Text): void {
    if (this.activeTextInput) {
      this.finishTextInput();
    }

    this.editingTextLayer = textLayer;
    textLayer.visible = false;

    const globalPos = textLayer.toGlobal(new PIXI.Point(0, 0));
    const canvas = this.app.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    const fillColor = this.getFillColorAsString(textLayer.style.fill);

    const textarea = document.createElement("textarea");
    textarea.value = textLayer.text;
    textarea.style.position = "absolute";
    textarea.style.left = `${rect.left + globalPos.x}px`;
    textarea.style.top = `${rect.top + globalPos.y}px`;
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
    textarea.style.lineHeight = `${textLayer.style.lineHeight || 1}`;
    textarea.style.textAlign = (textLayer.style.align as string) || "left";
    textarea.style.zIndex = "10000";
    textarea.style.overflow = "hidden";

    const bounds = textLayer.getBounds();
    textarea.style.width = `${Math.max(bounds.width, 100)}px`;
    textarea.style.height = `${Math.max(bounds.height, 20)}px`;

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    this.activeTextInput = textarea;

    textarea.addEventListener("blur", () => this.finishTextEdit());
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelTextEdit();
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
    textarea.style.width = "auto";

    const minWidth = 100;
    const minHeight = 20;
    const maxWidth = 400;

    textarea.style.width = `${Math.max(
      minWidth,
      Math.min(maxWidth, textarea.scrollWidth + 10)
    )}px`;
    textarea.style.height = `${Math.max(
      minHeight,
      textarea.scrollHeight + 2
    )}px`;
  }

  private finishTextInput(): void {
    if (!this.activeTextInput) return;

    const text = this.activeTextInput.value.trim();
    const originalX = parseFloat(this.activeTextInput.dataset.originalX || "0");
    const originalY = parseFloat(this.activeTextInput.dataset.originalY || "0");

    if (text) {
      const textLayer = this.createTextLayer(text, originalX, originalY);
      if (this.activeLayer) {
        this.activeLayer.addChild(textLayer);
      }
      this.currentTextLayer = textLayer;
      this.onTextLayerCreated?.(textLayer);
    }

    this.removeTextInput();
  }

  private finishTextEdit(): void {
    if (!this.activeTextInput || !this.editingTextLayer) return;

    const newText = this.activeTextInput.value.trim();

    if (newText) {
      this.editingTextLayer.text = newText;
      this.editingTextLayer.visible = true;
      this.updateTextLayerStyle(this.editingTextLayer);
    } else {
      if (this.editingTextLayer.parent) {
        this.editingTextLayer.parent.removeChild(this.editingTextLayer);
      }
      this.editingTextLayer.destroy();
    }

    this.removeTextInput();
    this.editingTextLayer = null;
  }

  private cancelTextInput(): void {
    this.removeTextInput();
  }

  private cancelTextEdit(): void {
    if (this.editingTextLayer) {
      this.editingTextLayer.visible = true;
    }
    this.removeTextInput();
    this.editingTextLayer = null;
  }

  private removeTextInput(): void {
    if (this.activeTextInput) {
      this.activeTextInput.remove();
      this.activeTextInput = null;
    }
  }

  private createTextLayer(text: string, x: number, y: number): PIXI.Text {
    const textStyle = new PIXI.TextStyle({
      fontSize: this.settings.fontSize,
      fontFamily: this.settings.fontFamily,
      fill: this.settings.fill,
      letterSpacing: this.settings.letterSpacing,
      lineHeight: this.settings.lineHeight,
      fontWeight: this.settings.fontWeight,
      fontStyle: this.settings.fontStyle,
      align: this.settings.align,
      wordWrap: this.settings.wordWrap,
      wordWrapWidth: this.settings.wordWrapWidth,
    });

    const pixiText = new PIXI.Text(text, textStyle);

    pixiText.x = x;
    pixiText.y = y;
    pixiText.eventMode = "static";
    pixiText.cursor = "pointer";

    pixiText.on("click", (event: PIXI.FederatedPointerEvent) => {
      if (event.detail === 2) {
        this.editExistingText(pixiText);
      }
    });

    return pixiText;
  }

  private updateTextLayerStyle(textLayer: PIXI.Text): void {
    if (!textLayer || !textLayer.style) return;

    textLayer.style.fontSize = this.settings.fontSize;
    textLayer.style.fontFamily = this.settings.fontFamily;
    textLayer.style.fill = this.settings.fill;
    textLayer.style.letterSpacing = this.settings.letterSpacing;
    textLayer.style.lineHeight = this.settings.lineHeight;
    textLayer.style.fontWeight = this.settings.fontWeight;
    textLayer.style.fontStyle = this.settings.fontStyle;
    textLayer.style.align = this.settings.align;
    textLayer.style.wordWrap = this.settings.wordWrap;
    textLayer.style.wordWrapWidth = this.settings.wordWrapWidth;
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
  }
}
