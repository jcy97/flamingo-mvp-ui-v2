import { atom } from "jotai";
import * as PIXI from "pixi.js";
import { canvasesAtom, currentCanvasIdAtom } from "./canvasStore";
import { layersAtom } from "./layerStore";
import { LayerData } from "@/types/layer";
import { currentPageIdAtom } from "./pageStore";

export interface PixiState {
  app: PIXI.Application | null;
  isInitialized: boolean;
  canvasContainers: Record<string, Record<string, PIXI.Container>>;
  layerGraphics: Record<string, Record<string, LayerData>>;
  activePageId: string | null;
  activeCanvasId: string | null;
  activeLayerId: string | null;
}

export const pixiStateAtom = atom<PixiState>({
  app: null,
  isInitialized: false,
  canvasContainers: {},
  layerGraphics: {},
  activePageId: null,
  activeCanvasId: null,
  activeLayerId: null,
});

export const initPixiAppAtom = atom(null, async (get, set) => {
  const state = get(pixiStateAtom);
  const canvases = get(canvasesAtom);
  const currentPageId = get(currentPageIdAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  if (state.isInitialized || state.app) return;
  try {
    const app = new PIXI.Application();
    await app.init({
      width: 800,
      height: 600,
      backgroundColor: 0xffffff,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    set(pixiStateAtom, {
      ...state,
      app,
      isInitialized: true,
      activePageId: currentPageId,
      activeCanvasId: currentCanvasId,
    });

    console.log("PIXI Application 초기화 완료");

    canvases.forEach((canvas) => {
      set(createCanvasContainerAtom, {
        pageId: canvas.pageId,
        canvasId: canvas.id,
      });
    });
  } catch (error) {
    console.error("PIXI Application 초기화 실패:", error);
  }
});

export const createCanvasContainerAtom = atom(
  null,
  (get, set, { pageId, canvasId }: { pageId: string; canvasId: string }) => {
    const state = get(pixiStateAtom);
    if (!state.app) {
      console.warn("PIXI App이 초기화되지 않았습니다.");
      return;
    }

    if (state.canvasContainers[pageId]?.[canvasId]) {
      console.warn(`캔버스 컨테이너가 이미 존재합니다: ${pageId}/${canvasId}`);
      return;
    }

    if (!state.canvasContainers[pageId]) {
      set(pixiStateAtom, {
        ...state,
        canvasContainers: {
          ...state.canvasContainers,
          [pageId]: {},
        },
      });
    }

    const container = new PIXI.Container();
    container.name = `canvas-${canvasId}`;
    const currentState = get(pixiStateAtom);
    set(pixiStateAtom, {
      ...currentState,
      canvasContainers: {
        ...currentState.canvasContainers,
        [pageId]: {
          ...currentState.canvasContainers[pageId],
          [canvasId]: container,
        },
      },
    });

    console.log(`캔버스 컨테이너 생성: ${pageId}/${canvasId}`);

    const layers = get(layersAtom);
    const layersInCanvas = layers.filter(
      (layer) => layer.canvasId === canvasId
    );
    layersInCanvas.forEach((layer) => {
      set(createLayerGraphicAtom, { canvasId, layerId: layer.id });
    });
  }
);

export const createLayerGraphicAtom = atom(
  null,
  (get, set, { canvasId, layerId }: { canvasId: string; layerId: string }) => {
    const state = get(pixiStateAtom);
    const currentLayerGraphics = state.layerGraphics || {};
    const layerOfCanvas = currentLayerGraphics[canvasId] || {};

    if (layerOfCanvas[layerId]) {
      console.warn(`해당 그래픽이 이미 생성됨: ${canvasId}/${layerId}`);
      return;
    }

    const renderTexture = PIXI.RenderTexture.create({
      width: 800,
      height: 600,
      resolution: 1,
    });

    const pixiSprite = new PIXI.Sprite(renderTexture);
    pixiSprite.name = `layer-${layerId}`;
    pixiSprite.texture.source.scaleMode = "linear";

    set(pixiStateAtom, {
      ...state,
      layerGraphics: {
        ...currentLayerGraphics,
        [canvasId]: {
          ...layerOfCanvas,
          [layerId]: {
            pixiSprite,
            renderTexture,
          },
        },
      },
    });

    console.log(`레이어 그래픽 초기화 완료: ${canvasId}/${layerId}`);
  }
);

export const switchPageAtom = atom(null, (get, set, pageId: string) => {
  const state = get(pixiStateAtom);
  if (!state.app || state.activePageId === pageId) return;

  state.app.stage.removeChildren();

  const canvasContainers = state.canvasContainers[pageId];
  if (canvasContainers) {
    Object.values(canvasContainers).forEach((container) => {
      state.app!.stage.addChild(container);
    });
    console.log(
      `페이지 전환: ${pageId}, 컨테이너 ${
        Object.keys(canvasContainers).length
      }개 로드`
    );
  } else {
    console.warn(`페이지 컨테이너를 찾을 수 없습니다: ${pageId}`);
  }

  set(pixiStateAtom, {
    ...state,
    activePageId: pageId,
  });
});

export const switchCanvasAtom = atom(null, (get, set, canvasId: string) => {
  const state = get(pixiStateAtom);

  set(pixiStateAtom, {
    ...state,
    activeCanvasId: canvasId,
  });

  console.log(`캔버스 전환: ${canvasId}`);
});

export const switchLayerAtom = atom(null, (get, set, layerId: string) => {
  const state = get(pixiStateAtom);
  console.log(state);
  set(pixiStateAtom, {
    ...state,
    activeLayerId: layerId,
  });

  console.log(`레이어 전환: ${layerId}`);
});

export const getCanvasContainerAtom = atom((get) => {
  const state = get(pixiStateAtom);
  if (!state.activePageId || !state.activeCanvasId) return null;

  return (
    state.canvasContainers[state.activePageId]?.[state.activeCanvasId] || null
  );
});

export const cleanupPageAtom = atom(null, (get, set, pageId: string) => {
  const state = get(pixiStateAtom);

  const canvasContainers = state.canvasContainers[pageId];
  if (canvasContainers) {
    Object.entries(canvasContainers).forEach(([canvasId, container]) => {
      if (container.parent) {
        container.parent.removeChild(container);
      }

      container.destroy({
        children: true,
        texture: true,
      });

      console.log(`캔버스 컨테이너 정리: ${pageId}/${canvasId}`);
    });
  }

  const newcanvasContainers = { ...state.canvasContainers };
  delete newcanvasContainers[pageId];

  set(pixiStateAtom, {
    ...state,
    canvasContainers: newcanvasContainers,
    activePageId: state.activePageId === pageId ? null : state.activePageId,
  });

  console.log(`페이지 정리 완료: ${pageId}`);
});

export const cleanupCanvasAtom = atom(
  null,
  (get, set, { pageId, canvasId }: { pageId: string; canvasId: string }) => {
    const state = get(pixiStateAtom);

    const container = state.canvasContainers[pageId]?.[canvasId];
    if (container) {
      if (container.parent) {
        container.parent.removeChild(container);
      }

      container.destroy({
        children: true,
        texture: true,
      });
    }

    const newcanvasContainers = { ...state.canvasContainers };
    if (newcanvasContainers[pageId]) {
      const newCanvases = { ...newcanvasContainers[pageId] };
      delete newCanvases[canvasId];
      newcanvasContainers[pageId] = newCanvases;
    }

    set(pixiStateAtom, {
      ...state,
      canvasContainers: newcanvasContainers,
      activeCanvasId:
        state.activeCanvasId === canvasId ? null : state.activeCanvasId,
    });

    console.log(`캔버스 정리 완료: ${pageId}/${canvasId}`);
  }
);

export const destroyPixiAppAtom = atom(null, (get, set) => {
  const state = get(pixiStateAtom);

  if (state.app) {
    Object.keys(state.canvasContainers).forEach((pageId) => {
      Object.keys(state.canvasContainers[pageId]).forEach((canvasId) => {
        const container = state.canvasContainers[pageId][canvasId];
        container?.destroy({
          children: true,
          texture: true,
        });
      });
    });

    state.app.destroy();
    console.log("PIXI Application 정리 완료");
  }

  set(pixiStateAtom, {
    app: null,
    isInitialized: false,
    canvasContainers: {},
    layerGraphics: {},
    activePageId: null,
    activeCanvasId: null,
    activeLayerId: null,
  });
});

export const debugPixiStateAtom = atom((get) => {
  const state = get(pixiStateAtom);
  return {
    isInitialized: state.isInitialized,
    appExists: !!state.app,
    pagesCount: Object.keys(state.canvasContainers).length,
    canvasesCount: Object.values(state.canvasContainers).reduce(
      (total, page) => total + Object.keys(page).length,
      0
    ),
    activePageId: state.activePageId,
    activeCanvasId: state.activeCanvasId,
    activeLayerId: state.activeLayerId,
  };
});
