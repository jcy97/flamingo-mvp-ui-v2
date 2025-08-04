import { atom } from "jotai";
import * as PIXI from "pixi.js";
import { Layer, BlendMode } from "@/types/layer";
import sampleData from "@/samples/data";
import { currentCanvasIdAtom } from "./canvasStore";
import { pixiStateAtom, getCanvasContainerAtom } from "./pixiStore";

export const layersAtom = atom<Layer[]>(sampleData.layers);

export const layersForCurrentCanvasAtom = atom((get) => {
  const layers = get(layersAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  if (!currentCanvasId) return [];
  return layers
    .filter((layer) => layer.canvasId === currentCanvasId)
    .sort((a, b) => a.order - b.order);
});

// 현재 활성 레이어 ID
export const activeLayerIdAtom = atom<string | null>(null);

// 현재 활성 레이어
export const currentActiveLayerAtom = atom((get) => {
  const layers = get(layersForCurrentCanvasAtom);
  const activeLayerId = get(activeLayerIdAtom);

  if (activeLayerId) {
    const activeLayer = layers.find((layer) => layer.id === activeLayerId);
    if (activeLayer) return activeLayer;
  }

  // 활성 레이어가 없으면 첫 번째 레이어 반환
  return layers[0] || null;
});

// 현재 활성 레이어의 PIXI Sprite
export const currentActiveLayerSpriteAtom = atom((get) => {
  const activeLayer = get(currentActiveLayerAtom);
  return activeLayer?.data.pixiSprite || null;
});

// 현재 활성 레이어의 RenderTexture
export const currentActiveLayerRenderTextureAtom = atom((get) => {
  const activeLayer = get(currentActiveLayerAtom);
  return activeLayer?.data.renderTexture || null;
});

// 레이어 추가
export const addLayerAtom = atom(null, (get, set) => {
  const currentCanvasId = get(currentCanvasIdAtom);
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);

  if (!currentCanvasId) {
    console.warn("현재 캔버스가 선택되지 않았습니다.");
    return;
  }

  if (!pixiState.app || !canvasContainer) {
    console.warn("PIXI App 또는 캔버스 컨테이너가 준비되지 않았습니다.");
    return;
  }

  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const newLayerId = `layer-${String(Date.now()).slice(-3)}`;

  try {
    // PIXI RenderTexture와 Sprite 생성
    const renderTexture = PIXI.RenderTexture.create({
      width: 800,
      height: 600,
      resolution: window.devicePixelRatio || 1,
    });

    const sprite = new PIXI.Sprite(renderTexture);
    sprite.name = `layer-${newLayerId}`;

    // 캔버스 컨테이너에 스프라이트 추가 (순서는 나중에 조정)
    canvasContainer.addChild(sprite);

    const newLayer: Layer = {
      id: newLayerId,
      canvasId: currentCanvasId,
      name: `새 레이어 ${layersForCurrentCanvas.length + 1}`,
      order: layersForCurrentCanvas.length,
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

    // 새로 생성된 레이어를 활성 레이어로 설정
    set(activeLayerIdAtom, newLayerId);

    console.log(`레이어 생성 완료: ${newLayerId}`);
  } catch (error) {
    console.error("레이어 생성 실패:", error);
  }
});

// 레이어 업데이트
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

        // PIXI 속성 업데이트
        if (layer.data.pixiSprite) {
          if (updates.opacity !== undefined) {
            layer.data.pixiSprite.alpha = updates.opacity;
          }
          if (updates.isVisible !== undefined) {
            layer.data.pixiSprite.visible = updates.isVisible;
          }
          if (updates.blendMode !== undefined) {
            // PIXI v8 블렌드모드 적용
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

// 레이어 삭제
export const deleteLayerAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const targetLayer = layers.find((layer) => layer.id === layerId);
  const activeLayerId = get(activeLayerIdAtom);

  // 마지막 레이어는 삭제할 수 없음
  if (layersForCurrentCanvas.length <= 1) {
    console.warn("마지막 레이어는 삭제할 수 없습니다.");
    return;
  }

  // PIXI 리소스 정리
  if (targetLayer?.data.pixiSprite) {
    // 컨테이너에서 제거
    if (targetLayer.data.pixiSprite.parent) {
      targetLayer.data.pixiSprite.parent.removeChild(
        targetLayer.data.pixiSprite
      );
    }

    // RenderTexture 정리
    if (targetLayer.data.renderTexture) {
      targetLayer.data.renderTexture.destroy();
    }

    // Sprite 정리
    targetLayer.data.pixiSprite.destroy();

    console.log(`레이어 PIXI 리소스 정리 완료: ${layerId}`);
  }

  const updatedLayers = layers.filter((layer) => layer.id !== layerId);
  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);

  // 삭제된 레이어가 활성 레이어였다면 다른 레이어로 전환
  if (activeLayerId === layerId) {
    const remainingLayers = updatedLayers.filter(
      (layer) => layer.canvasId === targetLayer?.canvasId
    );
    set(activeLayerIdAtom, remainingLayers[0]?.id || null);
  }
});

// 레이어 가시성 토글
export const toggleLayerVisibilityAtom = atom(
  null,
  (get, set, layerId: string) => {
    const layers = get(layersAtom);
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const newVisibility = !layer.isVisible;

        // PIXI Sprite 가시성 업데이트
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

// 레이어 잠금 토글
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

// 레이어 순서 변경
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

    if (!currentCanvasId || !canvasContainer) return;

    const draggedLayer = layersForCurrentCanvas[dragIndex];
    const newLayersForCanvas = [...layersForCurrentCanvas];

    newLayersForCanvas.splice(dragIndex, 1);
    newLayersForCanvas.splice(hoverIndex, 0, draggedLayer);

    const reorderedLayersForCanvas = newLayersForCanvas.map((layer, index) => ({
      ...layer,
      order: index,
    }));

    // PIXI Container에서도 순서 변경
    reorderedLayersForCanvas.forEach((layer, index) => {
      if (
        layer.data.pixiSprite &&
        layer.data.pixiSprite.parent === canvasContainer
      ) {
        canvasContainer.setChildIndex(layer.data.pixiSprite, index);
      }
    });

    const otherLayers = layers.filter(
      (layer) => layer.canvasId !== currentCanvasId
    );
    const updatedLayers = [...otherLayers, ...reorderedLayersForCanvas];

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);
  }
);

// 활성 레이어 설정
export const setActiveLayerAtom = atom(
  null,
  (get, set, layerId: string | null) => {
    set(activeLayerIdAtom, layerId);

    // PIXI Store의 활성 레이어도 업데이트
    const pixiState = get(pixiStateAtom);
    set(pixiStateAtom, {
      ...pixiState,
      activeLayerId: layerId,
    });

    console.log(`활성 레이어 변경: ${layerId}`);
  }
);

// 캔버스 변경 시 첫 번째 레이어를 활성으로 설정
export const autoSelectFirstLayerAtom = atom(null, (get, set) => {
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  if (layersForCurrentCanvas.length > 0) {
    set(setActiveLayerAtom, layersForCurrentCanvas[0].id);
  } else {
    set(setActiveLayerAtom, null);
  }
});

// 레이어 불투명도 설정
export const setLayerOpacityAtom = atom(
  null,
  (get, set, { layerId, opacity }: { layerId: string; opacity: number }) => {
    const clampedOpacity = Math.max(0, Math.min(1, opacity));
    set(updateLayerAtom, { layerId, updates: { opacity: clampedOpacity } });
  }
);

// 레이어 블렌드 모드 설정
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

// 레이어 이름 변경
export const renameLayerAtom = atom(
  null,
  (get, set, { layerId, name }: { layerId: string; name: string }) => {
    set(updateLayerAtom, { layerId, updates: { name } });
  }
);

// 캔버스의 모든 레이어 정리 (캔버스 삭제 시 사용)
export const cleanupCanvasLayersAtom = atom(
  null,
  (get, set, canvasId: string) => {
    const layers = get(layersAtom);
    const canvasLayers = layers.filter((layer) => layer.canvasId === canvasId);

    // PIXI 리소스 정리
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

    // 레이어 데이터에서 제거
    const updatedLayers = layers.filter((layer) => layer.canvasId !== canvasId);
    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);

    console.log(
      `캔버스 레이어 정리 완료: ${canvasId}, 정리된 레이어 수: ${canvasLayers.length}`
    );
  }
);

// 디버그용 레이어 상태 출력
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
