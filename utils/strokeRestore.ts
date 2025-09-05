import * as PIXI from "pixi.js";
import {
  BrushEngine,
  DrawingPoint,
} from "@/components/Workspace/Stage/BrushEngine";
import { EraserEngine } from "@/components/Workspace/Stage/EraserEngine";
import { BrushStroke, LayerPersistentData } from "@/types/layer";
import { BrushSettings } from "@/types/brush";
import { EraserSettings } from "@/types/eraser";

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
  strokeDuration: 4.0,
  slowTracking: 0,
  slowTrackingPerDab: 0,
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
  pressure: true,
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

  const tempBrushEngine = new BrushEngine(
    app,
    DEFAULT_BRUSH_SETTINGS,
    () => {}
  );
  const tempEraserEngine = new EraserEngine(app, DEFAULT_ERASER_SETTINGS);

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

  tempBrushEngine.setSharedRenderTexture(renderTexture);
  tempEraserEngine.setSharedRenderTexture(renderTexture);

  for (const stroke of persistentData.brushStrokes) {
    if (stroke.points.length === 0) continue;

    const isEraser = stroke.brushSettings.eraser === 1;

    if (isEraser) {
      const eraserSettings: EraserSettings = {
        size: stroke.brushSettings.radius,
        opacity: stroke.brushSettings.opacity,
        hardness: stroke.brushSettings.hardness,
        pressure: stroke.brushSettings.pressureOpacity > 0,
      };
      tempEraserEngine.updateSettings(eraserSettings);

      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const drawingPoint: DrawingPoint = {
          x: point.x,
          y: point.y,
          pressure: point.pressure,
          timestamp: point.timestamp,
        };

        if (i === 0) {
          tempEraserEngine.startStroke(drawingPoint);
        } else if (i === stroke.points.length - 1) {
          tempEraserEngine.continueStroke(drawingPoint);
          tempEraserEngine.endStroke();
        } else {
          tempEraserEngine.continueStroke(drawingPoint);
        }
      }
    } else {
      tempBrushEngine.updateSettings(stroke.brushSettings);

      for (let i = 0; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const drawingPoint: DrawingPoint = {
          x: point.x,
          y: point.y,
          pressure: point.pressure,
          timestamp: point.timestamp,
        };

        if (i === 0) {
          tempBrushEngine.startStroke(drawingPoint);
        } else if (i === stroke.points.length - 1) {
          tempBrushEngine.continueStroke(drawingPoint);
          tempBrushEngine.endStroke();
        } else {
          tempBrushEngine.continueStroke(drawingPoint);
        }
      }
    }
  }

  tempBrushEngine.cleanup();
  tempEraserEngine.cleanup();
};
