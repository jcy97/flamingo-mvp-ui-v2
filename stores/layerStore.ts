import { atom } from "jotai";
import * as PIXI from "pixi.js";
import { Layer, LayerData, LayerType, BrushStroke } from "@/types/layer";
import { BlendMode } from "@/constants/blendModes";
import { currentCanvasIdAtom } from "./canvasStore";
import {
  pixiStateAtom,
  getCanvasContainerAtom,
  switchLayerAtom,
  createLayerGraphicAtom,
  refreshCanvasThumbnailAtom,
} from "./pixiStore";
import { selectedToolIdAtom } from "./toolsbarStore";

export const layersAtom = atom<Layer[]>([]);

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

const updateThumbnail = (set: any, canvasId: string) => {
  setTimeout(() => {
    set(refreshCanvasThumbnailAtom, canvasId);
  }, 50);
};

export const addLayerAtom = atom(null, async (get, set) => {
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

  try {
    const { currentProjectIdAtom, currentPageIdAtom } = await import(
      "./pageStore"
    );
    const currentProjectId = get(currentProjectIdAtom) || "proj-webtoon-001";
    const currentPageId = get(currentPageIdAtom);

    if (!currentPageId) {
      console.warn("현재 페이지가 선택되지 않았습니다.");
      return;
    }

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

    const { layerApi } = await import("@/lib/api/layer");

    const layerResponse = await layerApi.createLayer(
      currentProjectId,
      currentPageId,
      currentCanvasId,
      {
        name: layerName,
        layer_data: {
          brushStrokes: [],
          contentBounds: { x: 0, y: 0, width: 0, height: 0 },
        },
      }
    );

    if (!layerResponse.success) {
      throw new Error("레이어 생성 실패");
    }

    const newLayer: Layer = {
      id: layerResponse.data.id,
      canvasId: layerResponse.data.canvas_id,
      name: layerResponse.data.name,
      order: layerResponse.data.order_index,
      type: layerType,
      blendMode: layerResponse.data.blend_mode as any,
      opacity: layerResponse.data.opacity,
      isVisible: layerResponse.data.visible,
      isLocked: layerResponse.data.locked,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(layerResponse.data.created_at),
      updatedAt: new Date(layerResponse.data.updated_at),
    };

    const updatedLayers = [...layers, newLayer];
    set(layersAtom, updatedLayers);

    await set(createLayerGraphicAtom, {
      canvasId: currentCanvasId,
      layerId: newLayer.id,
    });

    const updatedPixiState = get(pixiStateAtom);
    const newLayerGraphic =
      updatedPixiState.layerGraphics?.[currentCanvasId]?.[newLayer.id];

    if (newLayerGraphic?.pixiSprite && newLayerGraphic?.renderTexture) {
      canvasContainer.addChild(newLayerGraphic.pixiSprite);

      const finalUpdatedLayers = get(layersAtom).map((layer) =>
        layer.id === newLayer.id
          ? {
              ...layer,
              data: {
                pixiSprite: newLayerGraphic.pixiSprite,
                renderTexture: newLayerGraphic.renderTexture,
              },
            }
          : layer
      );
      set(layersAtom, finalUpdatedLayers);
    }

    updateCanvasLayerOrder(get, currentCanvasId);
    set(setActiveLayerAtom, newLayer.id);
    updateThumbnail(set, currentCanvasId);
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

    setTimeout(() => {
      set(refreshCanvasThumbnailAtom, currentCanvasId);
    }, 50);
  }
);

export const addTextLayerAtom = atom(null, async (get, set) => {
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
    set(layersAtom, updatedLayers);

    await set(createLayerGraphicAtom, {
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
      set(layersAtom, finalUpdatedLayers);
    }

    updateCanvasLayerOrder(get, currentCanvasId);
    set(setActiveLayerAtom, newLayerId);

    return newLayerId;
  } catch (error) {
    console.error("텍스트 레이어 생성 실패:", error);
    return null;
  }
});

export const autoCreateTextLayerAtom = atom(null, async (get, set) => {
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
    set(layersAtom, updatedLayers);

    await set(createLayerGraphicAtom, {
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
  async (
    get,
    set,
    { layerId, updates }: { layerId: string; updates: Partial<Layer> }
  ) => {
    const layers = get(layersAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const pixiState = get(pixiStateAtom);
    const originalLayer = layers.find((l) => l.id === layerId);

    if (!originalLayer || !currentCanvasId) return;

    try {
      const { currentProjectIdAtom, currentPageIdAtom } = await import(
        "./pageStore"
      );
      const currentProjectId = get(currentProjectIdAtom);
      const currentPageId = get(currentPageIdAtom);

      if (!currentProjectId || !currentPageId) return;

      const { layerApi } = await import("@/lib/api/layer");

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.isVisible !== undefined)
        updateData.visible = updates.isVisible;
      if (updates.isLocked !== undefined) updateData.locked = updates.isLocked;
      if (updates.opacity !== undefined) updateData.opacity = updates.opacity;
      if (updates.blendMode !== undefined)
        updateData.blend_mode = updates.blendMode;
      if (updates.order !== undefined) updateData.order = updates.order;

      const response = await layerApi.updateLayer(
        currentProjectId,
        currentPageId,
        currentCanvasId,
        layerId,
        updateData
      );

      if (!response.success) {
        throw new Error("레이어 수정 실패");
      }

      const updatedLayers = layers.map((layer) => {
        if (layer.id === layerId) {
          const updatedLayer = {
            ...layer,
            name: response.data.name,
            isVisible: response.data.visible,
            isLocked: response.data.locked,
            opacity: response.data.opacity,
            blendMode: response.data.blend_mode as any,
            order: response.data.order_index,
            updatedAt: new Date(response.data.updated_at),
          };

          const layerGraphic =
            pixiState.layerGraphics[currentCanvasId!]?.[layer.id];
          if (layerGraphic?.pixiSprite) {
            layerGraphic.pixiSprite.alpha = updatedLayer.opacity;
            layerGraphic.pixiSprite.visible = updatedLayer.isVisible;
            try {
              layerGraphic.pixiSprite.blendMode = updatedLayer.blendMode as any;
            } catch (error) {
              console.warn(
                "블렌드모드 설정 실패:",
                updatedLayer.blendMode,
                error
              );
              layerGraphic.pixiSprite.blendMode = "normal";
            }
          }

          return updatedLayer;
        }
        return layer;
      });

      set(layersAtom, updatedLayers);

      if (
        currentCanvasId &&
        (updates.order !== undefined || updates.isVisible !== undefined)
      ) {
        updateCanvasLayerOrder(get, currentCanvasId);
      }

      const updatedLayer = layers.find((l) => l.id === layerId);
      if (
        updatedLayer &&
        (updates.opacity !== undefined ||
          updates.isVisible !== undefined ||
          updates.blendMode !== undefined)
      ) {
        updateThumbnail(set, updatedLayer.canvasId);
      }
    } catch (error) {
      console.error("레이어 수정 실패:", error);
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
  }

  const updatedLayers = layers.filter((layer) => layer.id !== layerId);
  set(layersAtom, updatedLayers);

  if (activeLayerId === layerId) {
    const remainingLayers = updatedLayers.filter(
      (layer) => layer.canvasId === targetLayer?.canvasId
    );
    set(setActiveLayerAtom, remainingLayers[0]?.id || null);
  }

  if (targetLayer) {
    updateThumbnail(set, targetLayer.canvasId);
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

    set(layersAtom, updatedLayers);

    const targetLayer = layers.find((l) => l.id === layerId);
    if (targetLayer) {
      updateCanvasLayerOrder(get, targetLayer.canvasId);
      updateThumbnail(set, targetLayer.canvasId);
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

  set(layersAtom, updatedLayers);
});

export const reorderLayersAtom = atom(
  null,
  async (
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

    try {
      const { currentProjectIdAtom, currentPageIdAtom } = await import(
        "./pageStore"
      );
      const currentProjectId = get(currentProjectIdAtom);
      const currentPageId = get(currentPageIdAtom);

      if (!currentProjectId || !currentPageId) return;

      const { layerApi } = await import("@/lib/api/layer");

      for (let i = 0; i < layersWithUpdatedOrder.length; i++) {
        const layer = layersWithUpdatedOrder[i];
        const originalLayer = layersForCurrentCanvas.find(
          (l) => l.id === layer.id
        );
        if (originalLayer && layer.order !== originalLayer.order) {
          await layerApi.updateLayer(
            currentProjectId,
            currentPageId,
            currentCanvasId,
            layer.id,
            { order: layer.order }
          );
        }
      }

      const otherCanvasLayers = layers.filter(
        (layer) => layer.canvasId !== currentCanvasId
      );

      const allUpdatedLayers = [
        ...otherCanvasLayers,
        ...layersWithUpdatedOrder,
      ];

      set(layersAtom, allUpdatedLayers);

      updateCanvasLayerOrder(get, currentCanvasId);
      updateThumbnail(set, currentCanvasId);
    } catch (error) {
      console.error("레이어 순서 변경 실패:", error);
      set(layersAtom, layers);
    }
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
  async (get, set, { layerId, name }: { layerId: string; name: string }) => {
    await set(updateLayerAtom, { layerId, updates: { name } });
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
    set(layersAtom, updatedLayers);
  }
);

export const addBrushStrokeAtom = atom(
  null,
  async (
    get,
    set,
    { layerId, strokeData }: { layerId: string; strokeData: BrushStroke }
  ) => {
    const layers = get(layersAtom);

    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const currentPersistentData = layer.data.persistentData || {
          brushStrokes: [],
          contentBounds: { x: 0, y: 0, width: 0, height: 0 },
        };

        const updatedPersistentData = {
          ...currentPersistentData,
          brushStrokes: [...currentPersistentData.brushStrokes, strokeData],
        };

        return {
          ...layer,
          data: {
            ...layer.data,
            persistentData: updatedPersistentData,
          },
          updatedAt: new Date(),
        };
      }
      return layer;
    });

    set(layersAtom, updatedLayers);

    try {
      const { currentProjectIdAtom, currentPageIdAtom } = await import(
        "./pageStore"
      );
      const { currentCanvasIdAtom } = await import("./canvasStore");

      const currentProjectId = get(currentProjectIdAtom);
      const currentPageId = get(currentPageIdAtom);
      const currentCanvasId = get(currentCanvasIdAtom);

      if (currentProjectId && currentPageId && currentCanvasId) {
        const { layerApi } = await import("@/lib/api/layer");
        const layer = updatedLayers.find((l) => l.id === layerId);

        if (layer && layer.data.persistentData) {
          await layerApi.updateLayer(
            currentProjectId,
            currentPageId,
            currentCanvasId,
            layerId,
            {
              layer_data: layer.data.persistentData,
            }
          );
        }
      }
    } catch (error) {
      console.error("스트로크 저장 실패:", error);
    }
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
