import { SpeechBubbleSettings, TailPosition } from "@/types/speechBubble";

export class BubbleUtils {
  static hexToNumber(hex: string): number {
    return parseInt(hex.replace("#", ""), 16);
  }

  static getTailAngleFromPosition(position: TailPosition): number {
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

  static calculateTextMetrics(
    text: string,
    settings: SpeechBubbleSettings,
    PIXI: any
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

  static getTailStartPoint(
    x: number,
    y: number,
    width: number,
    height: number,
    settings: SpeechBubbleSettings
  ) {
    if (settings.tailAngle !== undefined) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const angleRad = (settings.tailAngle * Math.PI) / 180;
      const radiusX = width / 2;
      const radiusY = height / 2;
      return {
        x: centerX + Math.cos(angleRad) * radiusX,
        y: centerY + Math.sin(angleRad) * radiusY,
      };
    }

    const positions: Record<TailPosition, { x: number; y: number }> = {
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

  static getTailEndPoint(
    start: { x: number; y: number },
    settings: SpeechBubbleSettings
  ) {
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
}
