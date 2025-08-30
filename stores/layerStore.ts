import { atom } from "jotai";
import * as PIXI from "pixi.js";
import { Layer, LayerData, LayerType } from "@/types/layer";
import { BlendMode } from "@/constants/blendModes";
import sampleData from "@/samples/data";
import { currentCanvasIdAtom } from "./canvasStore";
import {
  pixiStateAtom,
  getCanvasContainerAtom,
  switchLayerAtom,
  createLayerGraphicAtom,
} from "./pixiStore";
import { selectedToolIdAtom } from "./toolsbarStore";

export const layersAtom = atom<Layer[]>(sampleData.layers);

export const layersForCurrentCanvasAtom = atom((get) => {
  const layers = get(layersAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  if (!currentCanvasId) return [];
  return layers
    .filter((layer) => layer.canvasId === currentCanvasId)
    .sort((a, b) => b.order - a.order);
});

export const activeLayerIdAtom = atom<string | null>(null);

export const currentActiveLayerAtom = atom((get) => {
  const layers = get(layersForCurrentCanvasAtom);
  const activeLayerId = get(activeLayerIdAtom);

  if (activeLayerId) {
    const activeLayer = layers.find((layer) => layer.id === activeLayerId);
    if (activeLayer) return activeLayer;
  }

  return layers[0] || null;
});

export const currentActiveLayerSpriteAtom = atom((get) => {
  const activeLayer = get(currentActiveLayerAtom);
  return activeLayer?.data.pixiSprite || null;
});

export const currentActiveLayerRenderTextureAtom = atom((get) => {
  const activeLayer = get(currentActiveLayerAtom);
  return activeLayer?.data.renderTexture || null;
});

const updateCanvasLayerOrder = (get: any, currentCanvasId: string) => {
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);

  if (!canvasContainer || !currentCanvasId) return;

  canvasContainer.removeChildren();

  const sortedLayers = [...layersForCurrentCanvas].sort(
    (a, b) => a.order - b.order
  );

  sortedLayers.forEach((layer) => {
    const layerGraphic = pixiState.layerGraphics[currentCanvasId]?.[layer.id];
    if (layerGraphic?.pixiSprite) {
      canvasContainer.addChild(layerGraphic.pixiSprite);
      layerGraphic.pixiSprite.visible = layer.isVisible;
      layerGraphic.pixiSprite.alpha = layer.opacity;
      try {
        layerGraphic.pixiSprite.blendMode = layer.blendMode as any;
      } catch (error) {
        console.warn("블렌드모드 설정 실패:", layer.blendMode, error);
        layerGraphic.pixiSprite.blendMode = "normal";
      }
    }
  });
};

export const addLayerAtom = atom(null, (get, set) => {
  const currentCanvasId = get(currentCanvasIdAtom);
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);
  const selectedToolId = get(selectedToolIdAtom);

  if (!currentCanvasId) {
    console.warn("현재 캔버스가 선택되지 않았습니다.");
    return;
  }

  if (!pixiState.app || !pixiState.isInitialized) {
    console.warn("PIXI App이 초기화되지 않았습니다.");
    return;
  }

  if (!canvasContainer) {
    console.warn("캔버스 컨테이너가 준비되지 않았습니다.");
    return;
  }

  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const newLayerId = `layer-${String(Date.now()).slice(-3)}`;

  try {
    const newOrder =
      layersForCurrentCanvas.length > 0
        ? Math.max(...layersForCurrentCanvas.map((l) => l.order)) + 1
        : 0;

    let layerType: LayerType = "brush";
    let layerName = `레이어 ${layersForCurrentCanvas.length + 1}`;

    if (selectedToolId === "speechBubble") {
      layerType = "speechBubble";
      const speechBubbleLayers = layersForCurrentCanvas.filter(
        (l) => l.type === "speechBubble"
      );
      layerName = `말풍선 ${speechBubbleLayers.length + 1}`;
    } else if (selectedToolId === "text") {
      layerType = "text";
      const textLayers = layersForCurrentCanvas.filter(
        (l) => l.type === "text"
      );
      layerName = `텍스트 ${textLayers.length + 1}`;
    }

    const newLayer: Layer = {
      id: newLayerId,
      canvasId: currentCanvasId,
      name: layerName,
      order: newOrder,
      type: layerType,
      blendMode: "normal",
      opacity: 1,
      isVisible: true,
      isLocked: false,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, newLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    set(createLayerGraphicAtom, {
      canvasId: currentCanvasId,
      layerId: newLayerId,
    });

    const updatedPixiState = get(pixiStateAtom);
    const newLayerGraphic =
      updatedPixiState.layerGraphics?.[currentCanvasId]?.[newLayerId];

    if (newLayerGraphic?.pixiSprite && newLayerGraphic?.renderTexture) {
      canvasContainer.addChild(newLayerGraphic.pixiSprite);

      const finalUpdatedLayers = get(layersAtom).map((layer) =>
        layer.id === newLayerId
          ? {
              ...layer,
              data: {
                pixiSprite: newLayerGraphic.pixiSprite,
                renderTexture: newLayerGraphic.renderTexture,
              },
            }
          : layer
      );
      sampleData.layers = finalUpdatedLayers;
      set(layersAtom, finalUpdatedLayers);
    }

    updateCanvasLayerOrder(get, currentCanvasId);

    set(setActiveLayerAtom, newLayerId);

    console.log(`레이어 생성 완료: ${newLayerId}`);
  } catch (error) {
    console.error("레이어 생성 실패:", error);
  }
});

export const duplicateLayerAtom = atom(
  null,
  async (get, set, layerId: string) => {
    const layers = get(layersAtom);
    const pixiState = get(pixiStateAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const { duplicatePixiLayer, generateUniqueId } = await import(
      "@/utils/pixiDuplication"
    );

    const originalLayer = layers.find((l) => l.id === layerId);
    if (!originalLayer || !currentCanvasId) return;

    const newLayerId = generateUniqueId("layer");
    const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);

    const duplicatedLayer: Layer = {
      ...originalLayer,
      id: newLayerId,
      name: `${originalLayer.name}-복사본`,
      order: Math.max(...layersForCurrentCanvas.map((l) => l.order)) + 1,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, duplicatedLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    await set(createLayerGraphicAtom, {
      canvasId: currentCanvasId,
      layerId: newLayerId,
    });

    if (pixiState.app) {
      const originalLayerGraphic =
        pixiState.layerGraphics[currentCanvasId]?.[layerId];

      if (originalLayerGraphic) {
        const duplicatedLayerData = await duplicatePixiLayer({
          originalLayerData: originalLayerGraphic,
          pixiApp: pixiState.app,
          targetCanvasId: currentCanvasId,
          targetLayerId: newLayerId,
        });

        if (duplicatedLayerData) {
          const { pixiStateAtom } = await import("./pixiStore");
          const currentState = get(pixiStateAtom);
          set(pixiStateAtom, {
            ...currentState,
            layerGraphics: {
              ...currentState.layerGraphics,
              [currentCanvasId]: {
                ...currentState.layerGraphics[currentCanvasId],
                [newLayerId]: duplicatedLayerData,
              },
            },
          });
        }
      }
    }

    updateCanvasLayerOrder(get, currentCanvasId);
    set(setActiveLayerAtom, newLayerId);
  }
);

export const addTextLayerAtom = atom(null, (get, set) => {
  const currentCanvasId = get(currentCanvasIdAtom);
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);

  if (!currentCanvasId) {
    console.warn("현재 캔버스가 선택되지 않았습니다.");
    return;
  }

  if (!pixiState.app || !pixiState.isInitialized) {
    console.warn("PIXI App이 초기화되지 않았습니다.");
    return;
  }

  if (!canvasContainer) {
    console.warn("캔버스 컨테이너가 준비되지 않았습니다.");
    return;
  }

  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const newLayerId = `text-layer-${String(Date.now()).slice(-3)}`;

  try {
    const newOrder =
      layersForCurrentCanvas.length > 0
        ? Math.max(...layersForCurrentCanvas.map((l) => l.order)) + 1
        : 0;

    const newLayer: Layer = {
      id: newLayerId,
      canvasId: currentCanvasId,
      name: `텍스트 레이어 ${
        layersForCurrentCanvas.filter((l) => l.type === "text").length + 1
      }`,
      order: newOrder,
      type: "text",
      blendMode: "normal",
      opacity: 1,
      isVisible: true,
      isLocked: false,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, newLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    set(createLayerGraphicAtom, {
      canvasId: currentCanvasId,
      layerId: newLayerId,
    });

    const updatedPixiState = get(pixiStateAtom);
    const newLayerGraphic =
      updatedPixiState.layerGraphics?.[currentCanvasId]?.[newLayerId];

    if (newLayerGraphic?.pixiSprite && newLayerGraphic?.renderTexture) {
      canvasContainer.addChild(newLayerGraphic.pixiSprite);

      const finalUpdatedLayers = get(layersAtom).map((layer) =>
        layer.id === newLayerId
          ? {
              ...layer,
              data: {
                pixiSprite: newLayerGraphic.pixiSprite,
                renderTexture: newLayerGraphic.renderTexture,
              },
            }
          : layer
      );
      sampleData.layers = finalUpdatedLayers;
      set(layersAtom, finalUpdatedLayers);
    }

    updateCanvasLayerOrder(get, currentCanvasId);

    set(setActiveLayerAtom, newLayerId);

    console.log(`텍스트 레이어 생성 완료: ${newLayerId}`);
    return newLayerId;
  } catch (error) {
    console.error("텍스트 레이어 생성 실패:", error);
    return null;
  }
});

export const autoCreateTextLayerAtom = atom(null, (get, set) => {
  const currentActiveLayer = get(currentActiveLayerAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);

  if (!currentCanvasId) return null;
  if (!pixiState.app || !pixiState.isInitialized) return null;
  if (!canvasContainer) return null;

  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const newLayerId = `text-layer-${String(Date.now()).slice(-3)}`;

  try {
    const newLayer: Layer = {
      id: newLayerId,
      canvasId: currentCanvasId,
      name: `Text${
        layersForCurrentCanvas.filter((l) => l.type === "text").length + 1
      }`,
      order:
        layersForCurrentCanvas.length > 0
          ? Math.max(...layersForCurrentCanvas.map((l) => l.order)) + 1
          : 0,
      type: "text",
      blendMode: "normal",
      opacity: 1,
      isVisible: true,
      isLocked: false,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, newLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    set(createLayerGraphicAtom, {
      canvasId: currentCanvasId,
      layerId: newLayerId,
    });

    const updatedPixiState = get(pixiStateAtom);
    const newLayerGraphic =
      updatedPixiState.layerGraphics?.[currentCanvasId]?.[newLayerId];

    if (newLayerGraphic?.pixiSprite && newLayerGraphic?.renderTexture) {
      canvasContainer.addChild(newLayerGraphic.pixiSprite);

      const finalUpdatedLayers = get(layersAtom).map((layer) =>
        layer.id === newLayerId
          ? {
              ...layer,
              data: {
                pixiSprite: newLayerGraphic.pixiSprite,
                renderTexture: newLayerGraphic.renderTexture,
              },
            }
          : layer
      );
      sampleData.layers = finalUpdatedLayers;
      set(layersAtom, finalUpdatedLayers);
    }

    updateCanvasLayerOrder(get, currentCanvasId);

    set(setActiveLayerAtom, newLayerId);

    return newLayerId;
  } catch {
    return null;
  }
});

export const updateLayerAtom = atom(
  null,
  (
    get,
    set,
    { layerId, updates }: { layerId: string; updates: Partial<Layer> }
  ) => {
    const layers = get(layersAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const pixiState = get(pixiStateAtom);

    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const updatedLayer = { ...layer, ...updates, updatedAt: new Date() };

        const layerGraphic =
          pixiState.layerGraphics[currentCanvasId!]?.[layer.id];
        if (layerGraphic?.pixiSprite) {
          if (updates.opacity !== undefined) {
            layerGraphic.pixiSprite.alpha = updates.opacity;
          }
          if (updates.isVisible !== undefined) {
            layerGraphic.pixiSprite.visible = updates.isVisible;
          }
          if (updates.blendMode !== undefined) {
            try {
              layerGraphic.pixiSprite.blendMode = updates.blendMode as any;
            } catch (error) {
              console.warn("블렌드모드 설정 실패:", updates.blendMode, error);
              layerGraphic.pixiSprite.blendMode = "normal";
            }
          }
        }

        return updatedLayer;
      }
      return layer;
    });

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    if (
      currentCanvasId &&
      (updates.order !== undefined || updates.isVisible !== undefined)
    ) {
      updateCanvasLayerOrder(get, currentCanvasId);
    }
  }
);

export const deleteLayerAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const targetLayer = layers.find((layer) => layer.id === layerId);
  const activeLayerId = get(activeLayerIdAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  if (layersForCurrentCanvas.length <= 1) {
    console.warn("마지막 레이어는 삭제할 수 없습니다.");
    return;
  }

  if (targetLayer?.data.pixiSprite) {
    if (targetLayer.data.pixiSprite.parent) {
      targetLayer.data.pixiSprite.parent.removeChild(
        targetLayer.data.pixiSprite
      );
    }

    if (targetLayer.data.renderTexture) {
      targetLayer.data.renderTexture.destroy();
    }

    targetLayer.data.pixiSprite.destroy();

    console.log(`레이어 PIXI 리소스 정리 완료: ${layerId}`);
  }

  const updatedLayers = layers.filter((layer) => layer.id !== layerId);
  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);

  if (activeLayerId === layerId) {
    const remainingLayers = updatedLayers.filter(
      (layer) => layer.canvasId === targetLayer?.canvasId
    );
    set(setActiveLayerAtom, remainingLayers[0]?.id || null);
  }
});

export const toggleLayerVisibilityAtom = atom(
  null,
  (get, set, layerId: string) => {
    const layers = get(layersAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const pixiState = get(pixiStateAtom);

    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const newVisibility = !layer.isVisible;

        const layerGraphic =
          pixiState.layerGraphics[currentCanvasId!]?.[layer.id];
        if (layerGraphic?.pixiSprite) {
          layerGraphic.pixiSprite.visible = newVisibility;
        }

        return {
          ...layer,
          isVisible: newVisibility,
          updatedAt: new Date(),
        };
      }
      return layer;
    });

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    if (currentCanvasId) {
      updateCanvasLayerOrder(get, currentCanvasId);
    }
  }
);

export const toggleLayerLockAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const updatedLayers = layers.map((layer) =>
    layer.id === layerId
      ? { ...layer, isLocked: !layer.isLocked, updatedAt: new Date() }
      : layer
  );

  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);
});

export const reorderLayersAtom = atom(
  null,
  (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const layers = get(layersAtom);
    const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const canvasContainer = get(getCanvasContainerAtom);

    if (!currentCanvasId || !canvasContainer || dragIndex === hoverIndex)
      return;

    const reorderedLayers = [...layersForCurrentCanvas];
    const [draggedLayer] = reorderedLayers.splice(dragIndex, 1);
    reorderedLayers.splice(hoverIndex, 0, draggedLayer);

    const layersWithUpdatedOrder = reorderedLayers.map((layer, index) => ({
      ...layer,
      order: layersForCurrentCanvas.length - 1 - index,
      updatedAt: new Date(),
    }));

    const otherCanvasLayers = layers.filter(
      (layer) => layer.canvasId !== currentCanvasId
    );

    const allUpdatedLayers = [...otherCanvasLayers, ...layersWithUpdatedOrder];

    set(layersAtom, allUpdatedLayers);
    sampleData.layers = allUpdatedLayers;

    updateCanvasLayerOrder(get, currentCanvasId);
  }
);

export const setActiveLayerAtom = atom(
  null,
  (get, set, layerId: string | null) => {
    const currentActiveLayerId = get(activeLayerIdAtom);

    if (currentActiveLayerId === layerId) return;

    set(activeLayerIdAtom, layerId);

    if (layerId) {
      set(switchLayerAtom, layerId);

      const currentCanvasId = get(currentCanvasIdAtom);
      if (currentCanvasId) {
        updateCanvasLayerOrder(get, currentCanvasId);
      }
    }

    console.log(`활성 레이어 변경: ${layerId}`);
  }
);

export const autoSelectFirstLayerAtom = atom(null, (get, set) => {
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const currentActiveLayerId = get(activeLayerIdAtom);

  if (layersForCurrentCanvas.length > 0) {
    const bottomLayer =
      layersForCurrentCanvas[layersForCurrentCanvas.length - 1];
    if (currentActiveLayerId !== bottomLayer.id) {
      set(setActiveLayerAtom, bottomLayer.id);
    }
  } else {
    set(setActiveLayerAtom, null);
  }
});

export const setLayerOpacityAtom = atom(
  null,
  (get, set, { layerId, opacity }: { layerId: string; opacity: number }) => {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    set(updateLayerAtom, { layerId, updates: { opacity: clampedOpacity } });
  }
);

export const setLayerBlendModeAtom = atom(
  null,
  (
    get,
    set,
    { layerId, blendMode }: { layerId: string; blendMode: BlendMode }
  ) => {
    set(updateLayerAtom, { layerId, updates: { blendMode } });
  }
);

export const renameLayerAtom = atom(
  null,
  (get, set, { layerId, name }: { layerId: string; name: string }) => {
    set(updateLayerAtom, { layerId, updates: { name } });
  }
);

export const cleanupCanvasLayersAtom = atom(
  null,
  (get, set, canvasId: string) => {
    const layers = get(layersAtom);
    const canvasLayers = layers.filter((layer) => layer.canvasId === canvasId);

    canvasLayers.forEach((layer) => {
      if (layer.data.pixiSprite) {
        if (layer.data.pixiSprite.parent) {
          layer.data.pixiSprite.parent.removeChild(layer.data.pixiSprite);
        }

        if (layer.data.renderTexture) {
          layer.data.renderTexture.destroy();
        }

        layer.data.pixiSprite.destroy();
      }
    });

    const updatedLayers = layers.filter((layer) => layer.canvasId !== canvasId);
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    console.log(
      `캔버스 레이어 정리 완료: ${canvasId}, 정리된 레이어 수: ${canvasLayers.length}`
    );
  }
);

export const debugLayerStateAtom = atom((get) => {
  const layers = get(layersForCurrentCanvasAtom);
  const activeLayerId = get(activeLayerIdAtom);

  return {
    totalLayers: layers.length,
    activeLayerId,
    layersWithPixi: layers.filter((layer) => !!layer.data.pixiSprite).length,
    visibleLayers: layers.filter((layer) => layer.isVisible).length,
    lockedLayers: layers.filter((layer) => layer.isLocked).length,
  };
});
