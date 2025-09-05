import * as PIXI from "pixi.js";
import {
  BrushEngine,
  DrawingPoint,
} from "@/components/Workspace/Stage/BrushEngine";
import { EraserEngine } from "@/components/Workspace/Stage/EraserEngine";
import type {
  BrushStroke,
  LayerPersistentData,
  BrushDabData,
  BrushSettings,
  EraserSettings,
  TextObject,
} from "@/types/layer";

const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  radius: 10,
  opacity: 1.0,
  hardness: 0.9,
  color: "#000000",
  pressureOpacity: 1.0,
  pressureSize: 1.0,
  speedSize: 0,
  smudgeLength: 0,
  smudgeRadius: 1.0,
  spacing: 0.045,
  jitter: 0,
  angle: 0,
  roundness: 1,
  dabsPerSecond: 0,
  dabsPerRadius: 2.2,
  speedOpacity: 0,
  randomRadius: 0,
  strokeThreshold: 0,
  strokeDuration: 4,
  slowTracking: 0.65,
  slowTrackingPerDab: 0.8,
  colorMixing: 0,
  eraser: 0,
  lockAlpha: 0,
  colorizeMode: 0,
  snapToPixel: 0,
};

const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  size: 20,
  opacity: 1.0,
  hardness: 0.9,
  pressure: false,
  radius: 10,
};

export const restoreLayerFromBrushData = async (
  app: PIXI.Application,
  persistentData: LayerPersistentData,
  renderTexture: PIXI.RenderTexture
): Promise<void> => {
  if (
    !persistentData.brushStrokes ||
    persistentData.brushStrokes.length === 0
  ) {
    return;
  }

  console.log("복원 시작:", {
    strokeCount: persistentData.brushStrokes.length,
    firstStroke: persistentData.brushStrokes[0],
    hasRenderData: persistentData.brushStrokes[0]?.renderData?.length > 0,
  });

  const clearContainer = new PIXI.Container();
  const clearGraphics = new PIXI.Graphics();
  clearGraphics.clear();
  clearGraphics.rect(0, 0, renderTexture.width, renderTexture.height);
  clearGraphics.fill({ color: 0x000000, alpha: 0 });
  clearContainer.addChild(clearGraphics);

  app.renderer.render({
    container: clearContainer,
    target: renderTexture,
    clear: true,
  });

  clearContainer.destroy({ children: true });

  for (const stroke of persistentData.brushStrokes) {
    console.log("스트로크 복원:", {
      id: stroke.id,
      hasRenderData: !!stroke.renderData,
      renderDataLength: stroke.renderData?.length || 0,
      pointsLength: stroke.points.length,
    });

    if (stroke.renderData && stroke.renderData.length > 0) {
      console.log("renderData 복원 사용");
      restoreFromRenderData(
        app,
        stroke.renderData,
        renderTexture,
        stroke.brushSettings.eraser === 1
      );
    } else if (stroke.points.length > 0) {
      console.log("fallback 복원 사용");
      fallbackRestore(app, stroke, renderTexture);
    }
  }

  console.log("복원 완료");
};

function restoreFromRenderData(
  app: PIXI.Application,
  renderData: BrushDabData[],
  renderTexture: PIXI.RenderTexture,
  isEraser: boolean = false
): void {
  console.log("renderData 복원 시작:", {
    dabCount: renderData.length,
    isEraser,
  });

  for (const dabData of renderData) {
    const graphics = new PIXI.Graphics();

    if (isEraser) {
      graphics.circle(0, 0, dabData.radius);
      graphics.fill({ color: 0xffffff, alpha: 1 });
      graphics.x = dabData.x;
      graphics.y = dabData.y;
      graphics.blendMode = "erase";
      graphics.alpha = dabData.opacity;
    } else {
      const color = parseInt(dabData.color.replace("#", ""), 16);
      graphics.circle(0, 0, dabData.radius);
      graphics.fill({ color, alpha: dabData.opacity });
      graphics.x = dabData.x;
      graphics.y = dabData.y;
    }

    app.renderer.render({
      container: graphics,
      target: renderTexture,
      clear: false,
    });

    graphics.destroy();
  }

  console.log("renderData 복원 완료");
}

function fallbackRestore(
  app: PIXI.Application,
  stroke: BrushStroke,
  renderTexture: PIXI.RenderTexture
): void {
  console.log("fallback 복원 시작:", {
    isEraser: stroke.brushSettings.eraser === 1,
    pointsCount: stroke.points.length,
  });

  const isEraser = stroke.brushSettings.eraser === 1;

  if (isEraser) {
    for (const point of stroke.points) {
      const eraser = new PIXI.Graphics();
      const radius = point.actualRadius || stroke.brushSettings.radius || 10;
      const opacity = point.actualOpacity || stroke.brushSettings.opacity || 1;

      eraser.circle(0, 0, radius);
      eraser.fill({ color: 0xffffff, alpha: 1 });
      eraser.x = point.x;
      eraser.y = point.y;
      eraser.blendMode = "erase";
      eraser.alpha = opacity;

      app.renderer.render({
        container: eraser,
        target: renderTexture,
        clear: false,
      });

      eraser.destroy();
    }
  } else {
    for (const point of stroke.points) {
      const brush = new PIXI.Graphics();
      const color = stroke.brushSettings.color || "#000000";
      const colorInt = parseInt(color.replace("#", ""), 16);
      const radius = point.actualRadius || stroke.brushSettings.radius || 10;
      const opacity = point.actualOpacity || stroke.brushSettings.opacity || 1;

      brush.circle(0, 0, radius);
      brush.fill({ color: colorInt, alpha: opacity });
      brush.x = point.x;
      brush.y = point.y;

      app.renderer.render({
        container: brush,
        target: renderTexture,
        clear: false,
      });

      brush.destroy();
    }
  }

  console.log("fallback 복원 완료");
}

export const restoreTextFromData = async (
  app: PIXI.Application,
  textObjects: TextObject[],
  renderTexture: PIXI.RenderTexture
): Promise<PIXI.Text[]> => {
  const restoredTexts: PIXI.Text[] = [];

  for (const textObj of textObjects) {
    const pixiText = createPixiTextFromData(textObj);

    app.renderer.render({
      container: pixiText,
      target: renderTexture,
      clear: false,
    });

    restoredTexts.push(pixiText);
  }

  return restoredTexts;
};

function createPixiTextFromData(textObj: TextObject): PIXI.Text {
  try {
    const style = new PIXI.TextStyle({
      fontSize: textObj.style.fontSize,
      fontFamily: textObj.style.fontFamily,
      fill: textObj.style.fill,
      letterSpacing: textObj.style.letterSpacing,
      lineHeight: textObj.style.fontSize * textObj.style.lineHeight,
      fontWeight: textObj.style.fontWeight,
      fontStyle: textObj.style.fontStyle,
      align: textObj.style.align,
      wordWrap: textObj.style.wordWrap,
      wordWrapWidth: textObj.style.wordWrapWidth,
      breakWords: textObj.style.wordWrap,
    });

    const pixiText = new PIXI.Text(textObj.content, style);
    pixiText.x = textObj.x;
    pixiText.y = textObj.y;
    pixiText.eventMode = "static";
    pixiText.cursor = "pointer";
    pixiText.name = `text-${textObj.id}`;

    return pixiText;
  } catch (error) {
    console.warn("폰트 로드 실패, fallback 사용:", error);
    const fallbackStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#000000",
    });
    const pixiText = new PIXI.Text(textObj.content, fallbackStyle);
    pixiText.x = textObj.x;
    pixiText.y = textObj.y;
    pixiText.eventMode = "static";
    pixiText.cursor = "pointer";
    pixiText.name = `text-${textObj.id}`;

    return pixiText;
  }
}
