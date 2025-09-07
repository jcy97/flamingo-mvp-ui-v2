import { atom } from "jotai";
import { Canvas } from "@/types/canvas";
import { currentPageIdAtom } from "./pageStore";
import {
  resizeCanvasAndLayersAtom,
  cleanupCanvasAtom,
  switchCanvasAtom,
  generateCanvasThumbnailAtom,
} from "./pixiStore";
import { cleanupCanvasLayersAtom } from "./layerStore";

export const canvasesAtom = atom<Canvas[]>([]);

export const canvasesForCurrentPageAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentPageId = get(currentPageIdAtom);
  if (!currentPageId) return [];
  return canvases
    .filter((canvas) => canvas.pageId === currentPageId)
    .sort((a, b) => a.order - b.order);
});

export const currentCanvasIdAtom = atom<string | null>(null);

export const currentCanvasAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  if (currentCanvasId) {
    const canvas = canvases.find((c) => c.id === currentCanvasId);
    if (canvas) return canvas;
  }

  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  return canvasesForCurrentPage[0] || null;
});

export const setCurrentCanvasAtom = atom(null, (get, set, canvasId: string) => {
  set(currentCanvasIdAtom, canvasId);
  set(switchCanvasAtom, canvasId);
});

export const addCanvasAtom = atom(
  null,
  async (
    get,
    set,
    canvasData: {
      pageId: string;
      name: string;
      width: number;
      height: number;
      backgroundColor?: string;
    }
  ): Promise<string> => {
    try {
      const { currentProjectIdAtom } = await import("./pageStore");
      const currentProjectId = get(currentProjectIdAtom) || "proj-webtoon-001";

      const { canvasApi } = await import("@/lib/api/canvas");
      const { layerApi } = await import("@/lib/api/layer");

      const canvasResponse = await canvasApi.createCanvas(
        currentProjectId,
        canvasData.pageId,
        {
          name: canvasData.name,
          width: canvasData.width,
          height: canvasData.height,
        }
      );

      if (!canvasResponse.success) {
        throw new Error("캔버스 생성 실패");
      }

      const canvases = get(canvasesAtom);
      const newCanvas: Canvas = {
        id: canvasResponse.data.id,
        pageId: canvasResponse.data.page_id,
        name: canvasResponse.data.name,
        order: canvasResponse.data.order_index,
        width: canvasResponse.data.width,
        height: canvasResponse.data.height,
        unit: "px",
        backgroundColor: canvasData.backgroundColor || "#FFFFFF",
        createdAt: new Date(canvasResponse.data.created_at),
        updatedAt: new Date(canvasResponse.data.updated_at),
      };

      const updatedCanvases = [...canvases, newCanvas];
      set(canvasesAtom, updatedCanvases);
      set(currentCanvasIdAtom, newCanvas.id);

      const layerResponse = await layerApi.createLayer(
        currentProjectId,
        canvasData.pageId,
        newCanvas.id,
        {
          name: "레이어 1",
          layer_data: {
            brushStrokes: [],
            contentBounds: { x: 0, y: 0, width: 0, height: 0 },
          },
          type: "brush",
        }
      );

      if (!layerResponse.success) {
        throw new Error("레이어 생성 실패");
      }

      const { layersAtom, activeLayerIdAtom } = await import("./layerStore");
      const layers = get(layersAtom);

      const newLayer = {
        id: layerResponse.data.id,
        canvasId: layerResponse.data.canvas_id,
        name: layerResponse.data.name,
        order: layerResponse.data.order_index,
        type: "brush" as const,
        blendMode: layerResponse.data.blend_mode as any,
        opacity: layerResponse.data.opacity,
        isVisible: layerResponse.data.visible,
        isLocked: layerResponse.data.locked,
        data: {
          pixiSprite: null,
          renderTexture: null,
          contentBounds: null,
        },
        createdAt: new Date(layerResponse.data.created_at),
        updatedAt: new Date(layerResponse.data.updated_at),
      };

      const updatedLayers = [...layers, newLayer];
      set(layersAtom, updatedLayers);
      set(activeLayerIdAtom, newLayer.id);

      const {
        createCanvasContainerAtom,
        generateCanvasThumbnailAtom,
        createLayerGraphicAtom,
      } = await import("./pixiStore");

      await set(createCanvasContainerAtom, {
        pageId: canvasData.pageId,
        canvasId: newCanvas.id,
      });

      await set(createLayerGraphicAtom, {
        canvasId: newCanvas.id,
        layerId: newLayer.id,
      });

      await set(switchCanvasAtom, newCanvas.id);

      setTimeout(() => {
        set(generateCanvasThumbnailAtom, {
          canvasId: newCanvas.id,
          pageId: canvasData.pageId,
        });
      }, 100);

      return newCanvas.id;
    } catch (error) {
      console.error("캔버스 추가 실패:", error);
      return "";
    }
  }
);

export const updateCanvasAtom = atom(
  null,
  async (
    get,
    set,
    {
      canvasId,
      name,
      width,
      height,
      backgroundColor,
    }: {
      canvasId: string;
      name?: string;
      width?: number;
      height?: number;
      backgroundColor?: string;
    }
  ) => {
    const canvases = get(canvasesAtom);
    const originalCanvas = canvases.find((c) => c.id === canvasId);
    if (!originalCanvas) return false;

    const { currentProjectIdAtom } = await import("./pageStore");
    const currentProjectId = get(currentProjectIdAtom);

    if (!currentProjectId) return false;

    try {
      const { canvasApi } = await import("@/lib/api/canvas");

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (width !== undefined) updateData.width = width;
      if (height !== undefined) updateData.height = height;

      const response = await canvasApi.updateCanvas(
        currentProjectId,
        originalCanvas.pageId,
        canvasId,
        updateData
      );

      if (!response.success) {
        throw new Error("캔버스 수정 실패");
      }

      let sizeWarning = false;
      const updatedCanvases = canvases.map((canvas) => {
        if (canvas.id === canvasId) {
          const updatedCanvas = {
            ...canvas,
            name: response.data.name,
            width: response.data.width,
            height: response.data.height,
            ...(backgroundColor && { backgroundColor }),
            updatedAt: new Date(response.data.updated_at),
          };

          if (
            (width && width !== canvas.width) ||
            (height && height !== canvas.height)
          ) {
            setTimeout(() => {
              set(resizeCanvasAndLayersAtom, {
                canvasId,
                width: response.data.width,
                height: response.data.height,
              });
            }, 100);
          }

          return updatedCanvas;
        }
        return canvas;
      });

      set(canvasesAtom, updatedCanvases);
      console.log("업데이트 캔버스");
      setTimeout(() => {
        set(generateCanvasThumbnailAtom, {
          canvasId,
          pageId: originalCanvas.pageId,
        });
      }, 200);

      return sizeWarning;
    } catch (error) {
      console.error("캔버스 수정 실패:", error);
      return false;
    }
  }
);

export const deleteCanvasAtom = atom(
  null,
  async (get, set, canvasId: string) => {
    const canvases = get(canvasesAtom);
    const targetCanvas = canvases.find((canvas) => canvas.id === canvasId);
    const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
    const currentCanvasId = get(currentCanvasIdAtom);

    if (canvasesForCurrentPage.length <= 1) {
      console.warn("마지막 캔버스는 삭제할 수 없습니다.");
      return;
    }

    if (!targetCanvas) return;

    try {
      const { currentProjectIdAtom } = await import("./pageStore");
      const currentProjectId = get(currentProjectIdAtom);

      if (!currentProjectId) return;

      const { canvasApi } = await import("@/lib/api/canvas");

      const response = await canvasApi.deleteCanvas(
        currentProjectId,
        targetCanvas.pageId,
        canvasId
      );

      if (!response.success) {
        throw new Error("캔버스 삭제 실패");
      }

      set(cleanupCanvasAtom, {
        pageId: targetCanvas.pageId,
        canvasId: targetCanvas.id,
      });
      set(cleanupCanvasLayersAtom, canvasId);

      const updatedCanvases = canvases.filter(
        (canvas) => canvas.id !== canvasId
      );
      set(canvasesAtom, updatedCanvases);

      if (currentCanvasId === canvasId) {
        const remainingCanvases = updatedCanvases.filter(
          (canvas) => canvas.pageId === targetCanvas.pageId
        );
        if (remainingCanvases.length > 0) {
          set(setCurrentCanvasAtom, remainingCanvases[0].id);
        }
      }
    } catch (error) {
      console.error("캔버스 삭제 실패:", error);
    }
  }
);

export const duplicateCanvasAtom = atom(
  null,
  async (get, set, canvasId: string) => {
    const canvases = get(canvasesAtom);
    const originalCanvas = canvases.find((c) => c.id === canvasId);
    if (!originalCanvas) return;

    const { layersAtom } = await import("./layerStore");
    const { pixiStateAtom, createCanvasContainerAtom, createLayerGraphicAtom } =
      await import("./pixiStore");
    const { duplicatePixiLayer, generateUniqueId } = await import(
      "@/utils/pixiDuplication"
    );

    const layers = get(layersAtom);
    const pixiState = get(pixiStateAtom);

    const newCanvasId = generateUniqueId("canvas");
    const canvasesForPage = canvases.filter(
      (c) => c.pageId === originalCanvas.pageId
    );

    const originalLayers = layers.filter((l) => l.canvasId === canvasId);

    const duplicatedCanvas: Canvas = {
      ...originalCanvas,
      id: newCanvasId,
      name: `${originalCanvas.name} 복사본`,
      order: Math.max(...canvasesForPage.map((c) => c.order)) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const layerIdMap = new Map<string, string>();
    originalLayers.forEach((layer) => {
      layerIdMap.set(layer.id, generateUniqueId("layer"));
    });

    const duplicatedLayers = originalLayers.map((layer) => ({
      ...layer,
      id: layerIdMap.get(layer.id)!,
      canvasId: newCanvasId,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const updatedCanvases = [...canvases, duplicatedCanvas];
    const updatedLayers = [...layers, ...duplicatedLayers];

    set(canvasesAtom, updatedCanvases);
    set(layersAtom, updatedLayers);

    await set(createCanvasContainerAtom, {
      pageId: originalCanvas.pageId,
      canvasId: newCanvasId,
    });

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 100);
        });
      });
    });

    if (pixiState.app && originalLayers.length > 0) {
      const { duplicatePixiCanvasLayers } = await import(
        "@/utils/pixiDuplication"
      );
      const updatePixiApp = get(pixiStateAtom);
      await duplicatePixiCanvasLayers({
        originalCanvasId: canvasId,
        newCanvasId,
        layerIdMap,
        pixiState: updatePixiApp,
        pixiApp: updatePixiApp.app!,
        setPixiState: (updater) => {
          const currentState = get(pixiStateAtom);
          set(pixiStateAtom, updater(currentState));
        },
        newPageId: originalCanvas.pageId,
        duplicatedLayers,
      });

      const { refreshCanvasThumbnailAtom } = await import("./pixiStore");
      await set(refreshCanvasThumbnailAtom, newCanvasId);
    } else if (originalLayers.length === 0) {
      const { refreshCanvasThumbnailAtom } = await import("./pixiStore");
      setTimeout(() => {
        set(refreshCanvasThumbnailAtom, newCanvasId);
      }, 100);
    }

    return newCanvasId;
  }
);

export const reorderCanvasesAtom = atom(
  null,
  async (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const canvases = get(canvasesAtom);
    const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
    const currentPageId = get(currentPageIdAtom);

    if (!currentPageId || dragIndex === hoverIndex) return;

    const reorderedCanvases = [...canvasesForCurrentPage];
    const [draggedCanvas] = reorderedCanvases.splice(dragIndex, 1);
    reorderedCanvases.splice(hoverIndex, 0, draggedCanvas);

    const canvasesWithUpdatedOrder = reorderedCanvases.map((canvas, index) => ({
      ...canvas,
      order: index + 1,
      updatedAt: new Date(),
    }));

    try {
      const { currentProjectIdAtom } = await import("./pageStore");
      const currentProjectId = get(currentProjectIdAtom);

      if (!currentProjectId) return;

      const { canvasApi } = await import("@/lib/api/canvas");

      for (let i = 0; i < canvasesWithUpdatedOrder.length; i++) {
        const canvas = canvasesWithUpdatedOrder[i];
        const originalCanvas = canvasesForCurrentPage.find(
          (c) => c.id === canvas.id
        );
        if (originalCanvas && canvas.order !== originalCanvas.order) {
          await canvasApi.updateCanvas(
            currentProjectId,
            currentPageId,
            canvas.id,
            {
              order: canvas.order,
            }
          );
        }
      }

      const otherPageCanvases = canvases.filter(
        (canvas) => canvas.pageId !== currentPageId
      );

      const allUpdatedCanvases = [
        ...otherPageCanvases,
        ...canvasesWithUpdatedOrder,
      ];

      set(canvasesAtom, allUpdatedCanvases);
    } catch (error) {
      console.error("캔버스 순서 변경 실패:", error);
      set(canvasesAtom, canvases);
    }
  }
);

export const autoSelectFirstCanvasAtom = atom(null, (get, set) => {
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  if (canvasesForCurrentPage.length > 0) {
    const firstCanvas = canvasesForCurrentPage[0];
    if (currentCanvasId !== firstCanvas.id) {
      set(setCurrentCanvasAtom, firstCanvas.id);
    }
  } else {
    set(currentCanvasIdAtom, null);
  }
});

export const cleanupPageCanvasesAtom = atom(
  null,
  (get, set, pageId: string) => {
    const canvases = get(canvasesAtom);
    const pageCanvases = canvases.filter((canvas) => canvas.pageId === pageId);

    pageCanvases.forEach((canvas) => {
      set(cleanupCanvasAtom, { pageId, canvasId: canvas.id });
      set(cleanupCanvasLayersAtom, canvas.id);
    });

    const updatedCanvases = canvases.filter(
      (canvas) => canvas.pageId !== pageId
    );
    set(canvasesAtom, updatedCanvases);
  }
);

export const debugCanvasStateAtom = atom((get) => {
  const canvases = get(canvasesForCurrentPageAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  return {
    totalCanvases: canvases.length,
    currentCanvasId,
    canvasNames: canvases.map((c) => c.name),
  };
});
