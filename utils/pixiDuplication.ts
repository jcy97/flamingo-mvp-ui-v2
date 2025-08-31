import * as PIXI from "pixi.js";
import { LayerData } from "@/types/layer";

export interface DuplicatePixiLayerParams {
  originalLayerData: LayerData;
  pixiApp: PIXI.Application;
  targetCanvasId: string;
  targetLayerId: string;
}

export const duplicatePixiLayer = async (
  params: DuplicatePixiLayerParams
): Promise<LayerData | null> => {
  const { originalLayerData, pixiApp, targetCanvasId, targetLayerId } = params;

  if (!originalLayerData.renderTexture || !originalLayerData.pixiSprite) {
    return null;
  }

  try {
    const { width, height } = originalLayerData.renderTexture;

    const newRenderTexture = PIXI.RenderTexture.create({
      width,
      height,
      resolution: 1,
    });

    const tempSprite = new PIXI.Sprite(originalLayerData.renderTexture);
    pixiApp.renderer.render({
      container: tempSprite,
      target: newRenderTexture,
      clear: true,
    });
    const newPixiSprite = new PIXI.Sprite(newRenderTexture);
    newPixiSprite.name = `layer-${targetLayerId}`;
    newPixiSprite.texture.source.scaleMode = "linear";
    newPixiSprite.blendMode = originalLayerData.pixiSprite.blendMode;
    newPixiSprite.alpha = originalLayerData.pixiSprite.alpha;
    newPixiSprite.visible = originalLayerData.pixiSprite.visible;

    tempSprite.destroy();

    return {
      pixiSprite: newPixiSprite,
      renderTexture: newRenderTexture,
    };
    return null;
  } catch (error) {
    console.error(`레이어 그래픽 복사 실패 ${targetLayerId}:`, error);
    return null;
  }
};

export interface DuplicatePixiCanvasParams {
  originalCanvasId: string;
  newCanvasId: string;
  layerIdMap: Map<string, string>;
  pixiState: any;
  pixiApp: PIXI.Application;
  setPixiState: (updater: (prev: any) => any) => void;
  newPageId: string;
  duplicatedLayers: any[];
}

export const duplicatePixiCanvasLayers = async (
  params: DuplicatePixiCanvasParams
): Promise<void> => {
  const {
    originalCanvasId,
    newCanvasId,
    layerIdMap,
    pixiState,
    pixiApp,
    setPixiState,
    newPageId,
    duplicatedLayers,
  } = params;
  const originalLayerGraphics = pixiState.layerGraphics[originalCanvasId];
  if (!originalLayerGraphics) return;

  const newLayerGraphics: Record<string, any> = {};

  for (const [originalLayerId, newLayerId] of layerIdMap.entries()) {
    const originalLayerData = originalLayerGraphics[originalLayerId];
    if (!originalLayerData) continue;

    const duplicatedLayerData = await duplicatePixiLayer({
      originalLayerData,
      pixiApp,
      targetCanvasId: newCanvasId,
      targetLayerId: newLayerId,
    });

    if (duplicatedLayerData) {
      newLayerGraphics[newLayerId] = duplicatedLayerData;
    }
  }

  if (Object.keys(newLayerGraphics).length > 0) {
    setPixiState((prev: any) => ({
      ...prev,
      layerGraphics: {
        ...prev.layerGraphics,
        [newCanvasId]: {
          ...prev.layerGraphics[newCanvasId],
          ...newLayerGraphics,
        },
      },
    }));

    const canvasContainer =
      pixiState.canvasContainers[newPageId]?.[newCanvasId];
    if (canvasContainer) {
      canvasContainer.removeChildren();

      const canvasLayers = duplicatedLayers
        .filter((layer) => layer.canvasId === newCanvasId)
        .sort((a, b) => a.order - b.order);

      canvasLayers.forEach((layer) => {
        const layerGraphic = newLayerGraphics[layer.id];
        if (layerGraphic?.pixiSprite) {
          canvasContainer.addChild(layerGraphic.pixiSprite);
          layerGraphic.pixiSprite.visible = layer.isVisible;
          layerGraphic.pixiSprite.alpha = layer.opacity;
          try {
            layerGraphic.pixiSprite.blendMode = layer.blendMode as any;
          } catch (error) {
            layerGraphic.pixiSprite.blendMode = "normal";
          }
        }
      });

      pixiApp.renderer.render(canvasContainer);
    }
  }
};

export const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${String(Date.now() + Math.random()).slice(-6)}`;
};

export interface IdMaps {
  canvasIdMap: Map<string, string>;
  layerIdMap: Map<string, string>;
}

export const createIdMaps = (
  originalCanvases: any[],
  originalLayers: any[]
): IdMaps => {
  const canvasIdMap = new Map<string, string>();
  const layerIdMap = new Map<string, string>();

  originalCanvases.forEach((canvas) => {
    canvasIdMap.set(canvas.id, generateUniqueId("canvas"));
  });

  originalLayers.forEach((layer) => {
    layerIdMap.set(layer.id, generateUniqueId("layer"));
  });

  return { canvasIdMap, layerIdMap };
};
