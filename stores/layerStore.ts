import { atom } from "jotai";
import * as PIXI from "pixi.js";
import { Layer, BlendMode, LayerData } from "@/types/layer";
import sampleData from "@/samples/data";
import { currentCanvasIdAtom } from "./canvasStore";
import {
  pixiStateAtom,
  getCanvasContainerAtom,
  switchLayerAtom,
  createLayerGraphicAtom,
} from "./pixiStore";

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

export const addLayerAtom = atom(null, (get, set) => {
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
  const newLayerId = `layer-${String(Date.now()).slice(-3)}`;

  try {
    const renderTexture = PIXI.RenderTexture.create({
      width: 800,
      height: 600,
      resolution: window.devicePixelRatio || 1,
    });

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.name = `layer-${newLayerId}`;
    sprite.texture.source.scaleMode = "linear";

    canvasContainer.addChild(sprite);

    const newOrder =
      layersForCurrentCanvas.length > 0
        ? Math.max(...layersForCurrentCanvas.map((l) => l.order)) + 1
        : 0;

    const newLayer: Layer = {
      id: newLayerId,
      canvasId: currentCanvasId,
      name: `새 레이어 ${layersForCurrentCanvas.length + 1}`,
      order: newOrder,
      type: "brush",
      blendMode: "normal",
      opacity: 1,
      isVisible: true,
      isLocked: false,
      data: {
        pixiSprite: sprite,
        renderTexture: renderTexture,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, newLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    set(setActiveLayerAtom, newLayerId);

    console.log(`레이어 생성 완료: ${newLayerId}`);
  } catch (error) {
    console.error("레이어 생성 실패:", error);
  }
});

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
    const renderTexture = PIXI.RenderTexture.create({
      width: 800,
      height: 600,
      resolution: window.devicePixelRatio || 1,
    });

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.name = `text-layer-${newLayerId}`;
    sprite.texture.source.scaleMode = "linear";

    canvasContainer.addChild(sprite);

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
        pixiSprite: sprite,
        renderTexture: renderTexture,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedLayers = [...layers, newLayer];
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

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
  if (currentActiveLayer && currentActiveLayer.type === "text")
    return currentActiveLayer.id;

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

    if (newLayerGraphic?.pixiSprite) {
      canvasContainer.addChild(newLayerGraphic.pixiSprite);
    }

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
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const updatedLayer = { ...layer, ...updates, updatedAt: new Date() };

        if (layer.data.pixiSprite) {
          if (updates.opacity !== undefined) {
            layer.data.pixiSprite.alpha = updates.opacity;
          }
          if (updates.isVisible !== undefined) {
            layer.data.pixiSprite.visible = updates.isVisible;
          }
          if (updates.blendMode !== undefined) {
            try {
              layer.data.pixiSprite.blendMode = updates.blendMode as any;
            } catch (error) {
              console.warn("블렌드모드 설정 실패:", updates.blendMode, error);
            }
          }
        }

        return updatedLayer;
      }
      return layer;
    });

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);
  }
);

export const deleteLayerAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const targetLayer = layers.find((layer) => layer.id === layerId);
  const activeLayerId = get(activeLayerIdAtom);

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
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const newVisibility = !layer.isVisible;

        if (layer.data.pixiSprite) {
          layer.data.pixiSprite.visible = newVisibility;
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

    layersWithUpdatedOrder.forEach((layer) => {
      if (
        layer.data.pixiSprite &&
        layer.data.pixiSprite.parent === canvasContainer
      ) {
        canvasContainer.setChildIndex(layer.data.pixiSprite, layer.order);
      }
    });

    const otherCanvasLayers = layers.filter(
      (layer) => layer.canvasId !== currentCanvasId
    );

    const allUpdatedLayers = [...otherCanvasLayers, ...layersWithUpdatedOrder];

    set(layersAtom, allUpdatedLayers);
    sampleData.layers = allUpdatedLayers;
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
