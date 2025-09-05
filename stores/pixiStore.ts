import { atom } from "jotai";
import * as PIXI from "pixi.js";
import "pixi.js/advanced-blend-modes";
import { layersAtom } from "./layerStore";
import { LayerData } from "@/types/layer";
import { currentPageIdAtom } from "./pageStore";
import { Bounds } from "@/types/common";

export interface PixiState {
  app: PIXI.Application | null;
  isInitialized: boolean;
  isFullyReady: boolean;
  canvasContainers: Record<string, Record<string, PIXI.Container>>;
  layerGraphics: Record<string, Record<string, LayerData>>;
  canvasThumbnails: Record<string, string>;
  activePageId: string | null;
  activeCanvasId: string | null;
  activeLayerId: string | null;
  maxTextureSize: number;
}

export const pixiStateAtom = atom<PixiState>({
  app: null,
  isInitialized: false,
  isFullyReady: false,
  canvasContainers: {},
  layerGraphics: {},
  canvasThumbnails: {},
  activePageId: null,
  activeCanvasId: null,
  activeLayerId: null,
  maxTextureSize: 8192,
});

const getMaxTextureSize = (renderer: PIXI.Renderer): number => {
  try {
    const gl = (renderer as any).context?.gl || (renderer as any).gl;
    if (gl) {
      return Math.min(
        gl.getParameter(gl.MAX_TEXTURE_SIZE),
        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        16384
      );
    }
  } catch (error) {
    console.warn("WebGL 컨텍스트 접근 실패:", error);
  }
  return 8192;
};

const validateTextureSize = (
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number; isValid: boolean } => {
  const maxDimension = Math.max(width, height);
  if (maxDimension <= maxSize && width * height <= maxSize * maxSize * 0.5) {
    return { width, height, isValid: true };
  }

  const aspectRatio = width / height;
  if (width > height) {
    const newWidth = Math.min(width, maxSize);
    const newHeight = Math.min(height, Math.floor(newWidth / aspectRatio));
    return { width: newWidth, height: newHeight, isValid: false };
  } else {
    const newHeight = Math.min(height, maxSize);
    const newWidth = Math.min(width, Math.floor(newHeight * aspectRatio));
    return { width: newWidth, height: newHeight, isValid: false };
  }
};

// 중복 복원 방지를 위한 플래그
let isRestoringStrokes = false;
const restoredLayers = new Set<string>();

export const retryAllStrokeRestorationsAtom = atom(null, async (get, set) => {
  if (isRestoringStrokes) {
    return;
  }
  const state = get(pixiStateAtom);
  if (!state.app) {
    return;
  }

  isRestoringStrokes = true;
  console.log("전체 복원 시작");

  const { layersAtom } = await import("./layerStore");
  const layers = get(layersAtom);
  const { restoreLayerFromBrushData, restoreTextFromData } = await import(
    "@/utils/strokeRestore"
  );
  const restoredCanvasIds = new Set<string>();

  for (const layer of layers) {
    console.log(`레이어 복원 체크 ${layer.id}:`, {
      hasPersistentData: !!layer.data.persistentData,
      strokeCount: layer.data.persistentData?.brushStrokes?.length || 0,
      textCount: layer.data.persistentData?.textObjects?.length || 0,
      isAlreadyRestored: restoredLayers.has(layer.id),
      canvasId: layer.canvasId,
    });

    if (
      layer.data.persistentData?.brushStrokes?.length! > 0 &&
      !restoredLayers.has(layer.id)
    ) {
      const layerGraphic = state.layerGraphics[layer.canvasId]?.[layer.id];
      console.log(`레이어 ${layer.id} 그래픽 상태:`, {
        hasGraphic: !!layerGraphic,
        hasRenderTexture: !!layerGraphic?.renderTexture,
      });

      if (layerGraphic?.renderTexture) {
        try {
          console.log(`레이어 ${layer.id} 복원 시작`);
          await restoreLayerFromBrushData(
            state.app,
            layer.data.persistentData!,
            layerGraphic.renderTexture
          );

          if (layerGraphic.pixiSprite) {
            layerGraphic.pixiSprite.texture = layerGraphic.renderTexture;
            console.log(`레이어 ${layer.id} 스프라이트 텍스처 업데이트 완료`);
          }

          restoredLayers.add(layer.id);
          restoredCanvasIds.add(layer.canvasId);
          console.log(`레이어 ${layer.id} 복원 성공`);
        } catch (error) {
          console.error(`레이어 ${layer.id} 복원 실패:`, error);
        }
      }
    }

    if (
      layer.data.persistentData?.textObjects?.length! > 0 &&
      !restoredLayers.has(layer.id)
    ) {
      const layerGraphic = state.layerGraphics[layer.canvasId]?.[layer.id];

      if (layerGraphic?.renderTexture) {
        try {
          console.log(`레이어 ${layer.id} 텍스트 복원 시작`);
          await restoreTextFromData(
            state.app,
            layer.data.persistentData!.textObjects,
            layerGraphic.renderTexture
          );

          if (layerGraphic.pixiSprite) {
            layerGraphic.pixiSprite.texture = layerGraphic.renderTexture;
            console.log(
              `레이어 ${layer.id} 텍스트 스프라이트 텍스처 업데이트 완료`
            );
          }

          restoredLayers.add(layer.id);
          restoredCanvasIds.add(layer.canvasId);
          console.log(`레이어 ${layer.id} 텍스트 복원 성공`);
        } catch (error) {
          console.error(`레이어 ${layer.id} 텍스트 복원 실패:`, error);
        }
      }
    }
  }

  isRestoringStrokes = false;
  console.log("전체 복원 완료");

  if (restoredCanvasIds.size > 0) {
    console.log(
      "복원된 캔버스들의 썸네일 업데이트 시작:",
      Array.from(restoredCanvasIds)
    );

    const { canvasesAtom } = await import("./canvasStore");
    const canvases = get(canvasesAtom);

    await new Promise((resolve) => setTimeout(resolve, 100));

    for (const canvasId of restoredCanvasIds) {
      const canvas = canvases.find((c) => c.id === canvasId);
      if (canvas) {
        try {
          console.log(`캔버스 ${canvasId} 썸네일 업데이트 시작`);
          await set(generateCanvasThumbnailAtom, {
            canvasId: canvasId,
            pageId: canvas.pageId,
          });
          console.log(`캔버스 ${canvasId} 썸네일 업데이트 완료`);
        } catch (error) {
          console.error(`캔버스 ${canvasId} 썸네일 업데이트 실패:`, error);
        }
      }
    }

    console.log("모든 복원된 캔버스 썸네일 업데이트 완료");
  } else {
    console.log("복원된 캔버스가 없어 썸네일 업데이트 건너뜀");
  }
});

export const generateCanvasThumbnailAtom = atom(
  null,
  async (
    get,
    set,
    { canvasId, pageId }: { canvasId: string; pageId: string }
  ) => {
    const state = get(pixiStateAtom);
    if (!state.app || !state.canvasContainers[pageId]?.[canvasId]) {
      console.log(`썸네일 생성 실패: 캔버스 컨테이너 없음 ${canvasId}`);
      return;
    }
    const { canvasesAtom } = await import("./canvasStore");
    const canvases = get(canvasesAtom);
    const canvas = canvases.find((c) => c.id === canvasId);
    if (!canvas) {
      console.log(`썸네일 생성 실패: 캔버스 데이터 없음 ${canvasId}`);
      return;
    }

    const container = state.canvasContainers[pageId][canvasId];
    console.log(`썸네일 생성: 컨테이너 자식 수 ${container.children.length}`);

    const fixedWidth = 400;
    const fixedHeight = 300;

    const renderTexture = PIXI.RenderTexture.create({
      width: canvas.width,
      height: canvas.height,
      resolution: 1,
    });

    state.app.renderer.render({
      container: container,
      target: renderTexture,
      clear: true,
    });

    const tempCanvas = state.app.renderer.extract.canvas(
      renderTexture
    ) as HTMLCanvasElement;

    const thumbnailCanvas = document.createElement("canvas");
    thumbnailCanvas.width = fixedWidth;
    thumbnailCanvas.height = fixedHeight;
    const ctx = thumbnailCanvas.getContext("2d")!;

    const bgColor =
      canvas.backgroundColor === "TRANSPARENT"
        ? "#f8f8f8"
        : canvas.backgroundColor || "#FFFFFF";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, fixedWidth, fixedHeight);

    if (canvas.backgroundColor === "TRANSPARENT") {
      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = 20;
      patternCanvas.height = 20;
      const patternCtx = patternCanvas.getContext("2d")!;
      patternCtx.fillStyle = "#f8f8f8";
      patternCtx.fillRect(0, 0, 20, 20);
      patternCtx.fillStyle = "#ccc";
      patternCtx.fillRect(0, 0, 10, 10);
      patternCtx.fillRect(10, 10, 10, 10);

      const pattern = ctx.createPattern(patternCanvas, "repeat")!;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, fixedWidth, fixedHeight);
    }

    const canvasAspect = canvas.width / canvas.height;
    const fixedAspect = fixedWidth / fixedHeight;

    let drawWidth,
      drawHeight,
      offsetX = 0,
      offsetY = 0;

    if (canvasAspect > fixedAspect) {
      drawWidth = fixedWidth;
      drawHeight = fixedWidth / canvasAspect;
      offsetY = (fixedHeight - drawHeight) / 2;
    } else {
      drawHeight = fixedHeight;
      drawWidth = fixedHeight * canvasAspect;
      offsetX = (fixedWidth - drawWidth) / 2;
    }

    ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);

    const base64 = thumbnailCanvas.toDataURL("image/png", 0.8);

    renderTexture.destroy();

    const currentState = get(pixiStateAtom);

    set(pixiStateAtom, {
      ...currentState,
      canvasThumbnails: {
        ...currentState.canvasThumbnails,
        [canvasId]: base64,
      },
    });
  }
);

export const updateAllThumbnailsAtom = atom(null, async (get, set) => {
  const state = get(pixiStateAtom);
  if (!state.app || !state.isFullyReady) return;

  const { canvasesAtom } = await import("./canvasStore");
  const canvases = get(canvasesAtom);

  const thumbnailPromises = canvases.map((canvas) =>
    set(generateCanvasThumbnailAtom, {
      canvasId: canvas.id,
      pageId: canvas.pageId,
    })
  );

  await Promise.all(thumbnailPromises);
});

export const initPixiAppAtom = atom(null, async (get, set) => {
  const state = get(pixiStateAtom);
  const currentPageId = get(currentPageIdAtom);

  if (state.isInitialized || state.app) return;

  try {
    const { canvasesAtom, currentCanvasIdAtom } = await import("./canvasStore");
    const canvases = get(canvasesAtom);
    const currentCanvasId = get(currentCanvasIdAtom);
    const currentCanvas = canvases.find((c) => c.id === currentCanvasId);
    const app = new PIXI.Application();
    await app.init({
      width: currentCanvas?.width || 1920,
      height: currentCanvas?.height || 1080,
      backgroundColor: currentCanvas?.backgroundColor,
      antialias: true,
      resolution: 1,
      autoDensity: false,
      useBackBuffer: true,
      powerPreference: "high-performance",
    });
    const maxTextureSize = getMaxTextureSize(app.renderer);

    set(pixiStateAtom, {
      ...state,
      app,
      isInitialized: true,
      activePageId: currentPageId,
      activeCanvasId: currentCanvasId,
      maxTextureSize,
    });

    const containerPromises = canvases.map(async (canvas) => {
      await set(createCanvasContainerAtom, {
        pageId: canvas.pageId,
        canvasId: canvas.id,
      });
    });

    await Promise.all(containerPromises);

    const updatedState = get(pixiStateAtom);
    set(pixiStateAtom, {
      ...updatedState,
      isFullyReady: true,
    });

    setTimeout(() => {
      console.log("PIXI 초기화 완료 후 복원 시작");
      set(retryAllStrokeRestorationsAtom);
    }, 1000);

    await set(updateAllThumbnailsAtom);
  } catch (error) {
    console.error("PIXI Application 초기화 실패:", error);
  }
});

export const createCanvasContainerAtom = atom(
  null,
  async (
    get,
    set,
    { pageId, canvasId }: { pageId: string; canvasId: string }
  ) => {
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

    const layers = get(layersAtom);
    const layersInCanvas = layers.filter(
      (layer) => layer.canvasId === canvasId
    );

    for (const layer of layersInCanvas) {
      await set(createLayerGraphicAtom, { canvasId, layerId: layer.id });
    }
  }
);

export const resizeCanvasAndLayersAtom = atom(
  null,
  async (
    get,
    set,
    {
      canvasId,
      width,
      height,
    }: { canvasId: string; width: number; height: number }
  ) => {
    const state = get(pixiStateAtom);
    const layers = get(layersAtom);

    const validatedSize = validateTextureSize(
      width,
      height,
      state.maxTextureSize
    );
    if (!validatedSize.isValid) {
      console.warn(
        `텍스처 크기가 제한을 초과했습니다. ${width}x${height} -> ${validatedSize.width}x${validatedSize.height}`
      );
      width = validatedSize.width;
      height = validatedSize.height;
    }

    if (state.app) {
      state.app.renderer.resize(width, height);
    }

    const layersInCanvas = layers.filter(
      (layer) => layer.canvasId === canvasId
    );

    layersInCanvas.forEach((layer) => {
      const layerGraphic = state.layerGraphics[canvasId]?.[layer.id];
      if (layerGraphic?.renderTexture && layerGraphic?.pixiSprite) {
        try {
          const oldTexture = layerGraphic.renderTexture;

          const newRenderTexture = PIXI.RenderTexture.create({
            width,
            height,
            resolution: 1,
          });

          const tempSprite = new PIXI.Sprite(oldTexture);
          if (state.app?.renderer) {
            state.app.renderer.render({
              container: tempSprite,
              target: newRenderTexture,
            });
          }

          layerGraphic.pixiSprite.texture = newRenderTexture;
          oldTexture.destroy();

          const updatedState = get(pixiStateAtom);
          set(pixiStateAtom, {
            ...updatedState,
            layerGraphics: {
              ...updatedState.layerGraphics,
              [canvasId]: {
                ...updatedState.layerGraphics[canvasId],
                [layer.id]: {
                  pixiSprite: layerGraphic.pixiSprite,
                  renderTexture: newRenderTexture,
                },
              },
            },
          });

          const updatedLayers = get(layersAtom).map((l) =>
            l.id === layer.id
              ? {
                  ...l,
                  data: {
                    pixiSprite: layerGraphic.pixiSprite,
                    renderTexture: newRenderTexture,
                  },
                }
              : l
          );
          set(layersAtom, updatedLayers);

          tempSprite.destroy();
        } catch (error) {
          console.error(`레이어 리사이즈 실패 ${layer.id}:`, error);
        }
      }
    });

    const canvas = layers.find((l) => l.canvasId === canvasId);
    if (canvas) {
      const { canvasesAtom } = await import("./canvasStore");
      const canvases = get(canvasesAtom);
      const canvasData = canvases.find((c) => c.id === canvasId);
      if (canvasData) {
        setTimeout(() => {
          set(generateCanvasThumbnailAtom, {
            canvasId,
            pageId: canvasData.pageId,
          });
        }, 100);
      }
    }
  }
);

export const createLayerGraphicAtom = atom(
  null,
  async (
    get,
    set,
    {
      canvasId,
      layerId,
      width,
      height,
      layerData,
    }: {
      canvasId: string;
      layerId: string;
      width?: number;
      height?: number;
      layerData?: any;
    }
  ) => {
    const state = get(pixiStateAtom);
    const currentLayerGraphics = state.layerGraphics || {};
    const layerOfCanvas = currentLayerGraphics[canvasId] || {};

    if (layerOfCanvas[layerId]) {
      console.warn(`해당 그래픽이 이미 생성됨: ${canvasId}/${layerId}`);
      return;
    }

    try {
      const { canvasesAtom } = await import("./canvasStore");
      const canvases = get(canvasesAtom);
      const canvas = canvases.find((c) => c.id === canvasId);
      let textureWidth = width || canvas?.width || 1920;
      let textureHeight = height || canvas?.height || 1080;
      const validatedSize = validateTextureSize(
        textureWidth,
        textureHeight,
        state.maxTextureSize
      );
      if (!validatedSize.isValid) {
        console.warn(
          `레이어 텍스처 크기가 제한을 초과했습니다. ${textureWidth}x${textureHeight} -> ${validatedSize.width}x${validatedSize.height}`
        );
        textureWidth = validatedSize.width;
        textureHeight = validatedSize.height;
      }

      const renderTexture = PIXI.RenderTexture.create({
        width: textureWidth,
        height: textureHeight,
        resolution: 1,
      });

      if (state.app) {
        const clearContainer = new PIXI.Container();
        const clearGraphics = new PIXI.Graphics();
        clearGraphics.beginFill(0x000000, 0);
        clearGraphics.drawRect(0, 0, textureWidth, textureHeight);
        clearGraphics.endFill();
        clearContainer.addChild(clearGraphics);

        state.app.renderer.render({
          container: clearContainer,
          target: renderTexture,
          clear: true,
        });

        clearContainer.destroy({ children: true });
      }

      const pixiSprite = new PIXI.Sprite(renderTexture);
      pixiSprite.name = `layer-${layerId}`;
      pixiSprite.texture.source.scaleMode = "linear";
      pixiSprite.blendMode = "normal";
      const updatedState = get(pixiStateAtom);
      const updatedLayerGraphics = updatedState.layerGraphics || {};
      const updatedLayerOfCanvas = updatedLayerGraphics[canvasId] || {};

      set(pixiStateAtom, {
        ...updatedState,
        layerGraphics: {
          ...updatedLayerGraphics,
          [canvasId]: {
            ...updatedLayerOfCanvas,
            [layerId]: {
              pixiSprite,
              renderTexture,
            },
          },
        },
      });

      let targetLayerData = layerData;

      if (!targetLayerData) {
        const { layersAtom } = await import("./layerStore");
        const layers = get(layersAtom);
        const layer = layers.find((l) => l.id === layerId);
        targetLayerData = layer?.data;
      }

      // 즉시 복원은 제거 - 오직 retryAllStrokeRestorationsAtom에서만 복원
    } catch (error) {
      console.error(`레이어 그래픽 생성 실패 ${canvasId}/${layerId}:`, error);

      const fallbackTexture = PIXI.RenderTexture.create({
        width: 1920,
        height: 1080,
        resolution: 1,
      });

      const fallbackSprite = new PIXI.Sprite(fallbackTexture);
      fallbackSprite.name = `layer-${layerId}`;

      const updatedState = get(pixiStateAtom);
      const updatedLayerGraphics = updatedState.layerGraphics || {};
      const updatedLayerOfCanvas = updatedLayerGraphics[canvasId] || {};

      set(pixiStateAtom, {
        ...updatedState,
        layerGraphics: {
          ...updatedLayerGraphics,
          [canvasId]: {
            ...updatedLayerOfCanvas,
            [layerId]: {
              pixiSprite: fallbackSprite,
              renderTexture: fallbackTexture,
            },
          },
        },
      });
    }
  }
);

export const switchPageAtom = atom(null, async (get, set, pageId: string) => {
  const state = get(pixiStateAtom);
  if (!state.app || state.activePageId === pageId) return;

  state.app.stage.removeChildren();

  const { currentCanvasIdAtom } = await import("./canvasStore");
  const currentCanvasId = get(currentCanvasIdAtom);

  if (currentCanvasId) {
    const canvasContainer = state.canvasContainers[pageId]?.[currentCanvasId];
    if (canvasContainer) {
      state.app.stage.addChild(canvasContainer);
    }
  }

  set(pixiStateAtom, {
    ...state,
    activePageId: pageId,
    activeCanvasId: currentCanvasId,
  });
});

export const switchCanvasAtom = atom(
  null,
  async (get, set, canvasId: string) => {
    const state = get(pixiStateAtom);
    if (!state.app || !state.activePageId) return;

    state.app.stage.removeChildren();

    const canvasContainer =
      state.canvasContainers[state.activePageId]?.[canvasId];
    if (canvasContainer) {
      state.app.stage.addChild(canvasContainer);
    }

    set(pixiStateAtom, {
      ...state,
      activeCanvasId: canvasId,
    });

    const { currentCanvasIdAtom } = await import("./canvasStore");
    set(currentCanvasIdAtom, canvasId);
  }
);

export const switchLayerAtom = atom(null, (get, set, layerId: string) => {
  const state = get(pixiStateAtom);
  set(pixiStateAtom, {
    ...state,
    activeLayerId: layerId,
  });
});

export const getCanvasContainerAtom = atom((get) => {
  const state = get(pixiStateAtom);
  if (!state.activePageId || !state.activeCanvasId) return null;

  return (
    state.canvasContainers[state.activePageId]?.[state.activeCanvasId] || null
  );
});

export const refreshCanvasThumbnailAtom = atom(
  null,
  async (get, set, canvasId: string) => {
    const { canvasesAtom } = await import("./canvasStore");
    const canvases = get(canvasesAtom);
    const canvas = canvases.find((c) => c.id === canvasId);
    if (!canvas) return;
    await set(generateCanvasThumbnailAtom, {
      canvasId,
      pageId: canvas.pageId,
    });
  }
);

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
    });
  }

  const newcanvasContainers = { ...state.canvasContainers };
  delete newcanvasContainers[pageId];

  const newThumbnails = { ...state.canvasThumbnails };
  if (canvasContainers) {
    Object.keys(canvasContainers).forEach((canvasId) => {
      delete newThumbnails[canvasId];
    });
  }

  set(pixiStateAtom, {
    ...state,
    canvasContainers: newcanvasContainers,
    canvasThumbnails: newThumbnails,
    activePageId: state.activePageId === pageId ? null : state.activePageId,
  });
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

    const newThumbnails = { ...state.canvasThumbnails };
    delete newThumbnails[canvasId];

    set(pixiStateAtom, {
      ...state,
      canvasContainers: newcanvasContainers,
      canvasThumbnails: newThumbnails,
      activeCanvasId:
        state.activeCanvasId === canvasId ? null : state.activeCanvasId,
    });
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
  }

  set(pixiStateAtom, {
    app: null,
    isInitialized: false,
    isFullyReady: false,
    canvasContainers: {},
    layerGraphics: {},
    canvasThumbnails: {},
    activePageId: null,
    activeCanvasId: null,
    activeLayerId: null,
    maxTextureSize: 8192,
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
    thumbnailsCount: Object.keys(state.canvasThumbnails).length,
    activePageId: state.activePageId,
    activeCanvasId: state.activeCanvasId,
    activeLayerId: state.activeLayerId,
    maxTextureSize: state.maxTextureSize,
  };
});

export const transformLayerContentAtom = atom(
  null,
  async (
    get,
    set,
    {
      layerId,
      scale,
      rotation,
      pivot,
      newBounds,
    }: {
      layerId: string;
      scale: { x: number; y: number };
      rotation: number;
      pivot: { x: number; y: number };
      newBounds: Bounds;
    }
  ) => {
    const state = get(pixiStateAtom);
    const layer = get(layersAtom).find((l) => l.id === layerId);
    const canvasId = layer?.canvasId;

    if (!state.app || !canvasId || !layer) return;

    const layerGraphic = state.layerGraphics[canvasId]?.[layerId];
    if (!layerGraphic?.renderTexture || !layerGraphic.pixiSprite) return;

    const originalTexture = layerGraphic.renderTexture;
    const { width, height } = originalTexture;
    const newRenderTexture = PIXI.RenderTexture.create({
      width,
      height,
      resolution: 1,
    });
    const tempSprite = new PIXI.Sprite(originalTexture);

    tempSprite.pivot.set(pivot.x, pivot.y);
    tempSprite.position.set(width / 2, height / 2);
    tempSprite.scale.copyFrom(scale);
    tempSprite.rotation = (rotation * Math.PI) / 180;

    state.app.renderer.render({
      container: tempSprite,
      target: newRenderTexture,
      clear: true,
    });

    const mainSprite = layerGraphic.pixiSprite;
    mainSprite.texture = newRenderTexture;

    const finalCenterX = newBounds.minX + (newBounds.maxX - newBounds.minX) / 2;
    const finalCenterY = newBounds.minY + (newBounds.maxY - newBounds.minY) / 2;

    mainSprite.pivot.set(width / 2, height / 2);
    mainSprite.position.set(finalCenterX, finalCenterY);
    mainSprite.scale.set(1, 1);
    mainSprite.rotation = 0;

    tempSprite.destroy();
    originalTexture.destroy(true);

    const currentState = get(pixiStateAtom);
    set(pixiStateAtom, {
      ...currentState,
      layerGraphics: {
        ...currentState.layerGraphics,
        [canvasId]: {
          ...currentState.layerGraphics[canvasId],
          [layerId]: {
            ...layerGraphic,
            renderTexture: newRenderTexture,
          },
        },
      },
    });

    set(refreshCanvasThumbnailAtom, canvasId);
  }
);
