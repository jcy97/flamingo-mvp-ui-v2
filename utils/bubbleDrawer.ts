import * as PIXI from "pixi.js";
import {
  SpeechBubbleSettings,
  BubblePoint,
  SpeechBubbleData,
} from "@/types/speechBubble";
import { BubbleUtils } from "./bubble";

export class BubbleDrawer {
  private graphics: PIXI.Graphics;

  constructor() {
    this.graphics = new PIXI.Graphics();
  }

  drawBubbleShape(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    switch (settings.style) {
      case "speech":
        this.graphics.roundRect(x, y, width, height, settings.cornerRadius);
        break;
      case "thought":
        this.drawThoughtBubble(x, y, width, height);
        break;
      case "shout":
        this.drawShoutBubble(x, y, width, height);
        break;
      case "whisper":
        this.graphics.roundRect(x, y, width, height, settings.cornerRadius);
        break;
      case "cloud":
        this.drawCloudBubble(x, y, width, height);
        break;
      case "jagged":
        this.drawJaggedBubble(x, y, width, height);
        break;
      case "flash":
        this.drawFlashBubble(x, y, width, height, settings);
        break;
      case "rectangle":
        this.graphics.roundRect(x, y, width, height, settings.cornerRadius);
        break;
      case "ellipse":
        this.graphics.ellipse(
          x + width / 2,
          y + height / 2,
          width / 2,
          height / 2
        );
        break;
      default:
        this.graphics.roundRect(x, y, width, height, settings.cornerRadius);
    }
  }

  drawTail(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const tailStart = BubbleUtils.getTailStartPoint(
      x,
      y,
      width,
      height,
      settings
    );
    const tailEnd = BubbleUtils.getTailEndPoint(tailStart, settings);

    switch (settings.tailStyle) {
      case "pointed":
        this.drawPointedTail(tailStart, tailEnd, settings);
        break;
      case "curved":
        this.drawCurvedTail(tailStart, tailEnd, settings);
        break;
      case "wavy":
        this.drawWavyTail(tailStart, tailEnd, settings);
        break;
      case "bubble":
        this.drawBubbleTail(tailStart, tailEnd, settings);
        break;
      case "double":
        this.drawDoubleTail(tailStart, tailEnd, settings);
        break;
    }
  }

  private drawThoughtBubble(
    x: number,
    y: number,
    width: number,
    height: number
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
      this.graphics.circle(bx, by, bubbleRadius);
    }
  }

  private drawShoutBubble(
    x: number,
    y: number,
    width: number,
    height: number
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

    this.graphics.poly(path);
  }

  private drawCloudBubble(
    x: number,
    y: number,
    width: number,
    height: number
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
      this.graphics.circle(cx, cy, cloudRadius);
    }
  }

  private drawJaggedBubble(
    x: number,
    y: number,
    width: number,
    height: number
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

    this.graphics.poly(path);
  }

  private drawFlashBubble(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.7;
    const numRays = 96;

    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
    }
    this.graphics.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  }

  private drawPointedTail(
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

    this.graphics.poly([
      start.x - perpX,
      start.y - perpY,
      end.x,
      end.y,
      start.x + perpX,
      start.y + perpY,
    ]);
  }

  private drawCurvedTail(
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    this.drawPointedTail(start, end, settings);
  }

  private drawWavyTail(
    start: BubblePoint,
    end: BubblePoint,
    settings: SpeechBubbleSettings
  ): void {
    this.drawPointedTail(start, end, settings);
  }

  private drawBubbleTail(
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
      this.graphics.circle(x, y, radius);
    }
  }

  private drawDoubleTail(
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

    this.graphics.poly([
      start.x - perpX * 2,
      start.y - perpY * 2,
      end.x - perpX,
      end.y - perpY,
      start.x - perpX,
      start.y - perpY,
    ]);

    this.graphics.poly([
      start.x + perpX,
      start.y + perpY,
      end.x + perpX,
      end.y + perpY,
      start.x + perpX * 2,
      start.y + perpY * 2,
    ]);
  }

  renderBubble(
    app: PIXI.Application,
    bubbleData: SpeechBubbleData,
    renderTexture: PIXI.RenderTexture,
    container: PIXI.Container
  ): void {
    this.graphics.clear();

    if (bubbleData.settings.tailAngle === undefined) {
      bubbleData.settings.tailAngle = BubbleUtils.getTailAngleFromPosition(
        bubbleData.settings.tailPosition
      );
    }

    if (
      bubbleData.settings.autoSize &&
      bubbleData.settings.text &&
      bubbleData.settings.text.trim() !== ""
    ) {
      const metrics = BubbleUtils.calculateTextMetrics(
        bubbleData.settings.text,
        bubbleData.settings,
        PIXI
      );
      bubbleData.width = metrics.width;
      bubbleData.height = metrics.height;
    }

    if (bubbleData.settings.tailStyle !== "none") {
      this.drawTail(
        bubbleData.x,
        bubbleData.y,
        bubbleData.width,
        bubbleData.height,
        bubbleData.settings
      );

      this.graphics.fill({
        color: BubbleUtils.hexToNumber(bubbleData.settings.backgroundColor),
        alpha: 1,
      });

      if (bubbleData.settings.borderWidth > 0) {
        this.graphics.stroke({
          color: BubbleUtils.hexToNumber(bubbleData.settings.borderColor),
          width: bubbleData.settings.borderWidth,
          alpha: 1,
        });
      }
    }

    this.drawBubbleShape(
      bubbleData.x,
      bubbleData.y,
      bubbleData.width,
      bubbleData.height,
      bubbleData.settings
    );

    this.graphics.fill({
      color: BubbleUtils.hexToNumber(bubbleData.settings.backgroundColor),
      alpha: 1,
    });

    if (bubbleData.settings.borderWidth > 0) {
      this.graphics.stroke({
        color: BubbleUtils.hexToNumber(bubbleData.settings.borderColor),
        width: bubbleData.settings.borderWidth,
        alpha: 1,
      });
    }

    this.graphics.alpha = bubbleData.settings.opacity;
    container.addChild(this.graphics);

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
      const availableWidth = bubbleData.width - bubbleData.settings.padding * 2;
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

      container.addChild(text);
    }

    app.renderer.render({
      container: container,
      target: renderTexture,
      clear: true,
    });
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
