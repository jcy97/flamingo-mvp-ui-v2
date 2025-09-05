import { atom } from "jotai";
import { Page } from "@/types/page";
import { Canvas } from "@/types/canvas";
import {
  canvasesAtom,
  canvasesForCurrentPageAtom,
  setCurrentCanvasAtom,
  addCanvasAtom,
} from "./canvasStore";
import { switchPageAtom } from "./pixiStore";
import page from "@/app/workspace/page";

export const pagesAtom = atom<Page[]>([]);

export const currentPageIdAtom = atom<string | null>(null);

export const currentProjectIdAtom = atom<string | null>(null);

export const currentPageAtom = atom((get) => {
  const pages = get(pagesAtom);
  const currentPageId = get(currentPageIdAtom);
  return pages.find((page) => page.id === currentPageId) || null;
});

export const addPageAtom = atom(null, async (get, set) => {
  const currentProjectId = get(currentProjectIdAtom) || "proj-webtoon-001";
  const pages = get(pagesAtom);

  try {
    const { pageApi } = await import("@/lib/api/page");
    const { canvasApi } = await import("@/lib/api/canvas");
    const { layerApi } = await import("@/lib/api/layer");

    const pageResponse = await pageApi.createPage(currentProjectId, {
      name: `페이지 ${pages.length + 1}`,
    });

    if (!pageResponse.success) {
      throw new Error("페이지 생성 실패");
    }

    const newPage: Page = {
      id: pageResponse.data.id,
      projectId: pageResponse.data.project_id,
      name: pageResponse.data.name,
      order: pageResponse.data.order_index,
      createdAt: new Date(pageResponse.data.created_at),
      updatedAt: new Date(pageResponse.data.updated_at),
    };

    const updatedPages = [...pages, newPage];
    set(pagesAtom, updatedPages);
    set(currentPageIdAtom, newPage.id);

    const canvasResponse = await canvasApi.createCanvas(
      currentProjectId,
      newPage.id,
      {
        name: "캔버스 1",
        width: 1920,
        height: 1080,
      }
    );

    if (!canvasResponse.success) {
      throw new Error("캔버스 생성 실패");
    }

    const { canvasesAtom } = await import("./canvasStore");
    const canvases = get(canvasesAtom);

    const newCanvas = {
      id: canvasResponse.data.id,
      pageId: canvasResponse.data.page_id,
      name: canvasResponse.data.name,
      order: canvasResponse.data.order_index,
      width: canvasResponse.data.width,
      height: canvasResponse.data.height,
      x: canvasResponse.data.x,
      y: canvasResponse.data.y,
      scale: canvasResponse.data.scale,
      unit: "px" as const,
      backgroundColor: "#FFFFFF",
      createdAt: new Date(canvasResponse.data.created_at),
      updatedAt: new Date(canvasResponse.data.updated_at),
    };

    const updatedCanvases = [...canvases, newCanvas];
    set(canvasesAtom, updatedCanvases);

    const layerResponse = await layerApi.createLayer(
      currentProjectId,
      newPage.id,
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

    const { layersAtom } = await import("./layerStore");
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

    const { currentCanvasIdAtom, setCurrentCanvasAtom } = await import(
      "./canvasStore"
    );
    set(currentCanvasIdAtom, newCanvas.id);

    const { activeLayerIdAtom } = await import("./layerStore");
    set(activeLayerIdAtom, newLayer.id);

    const { createCanvasContainerAtom, createLayerGraphicAtom } = await import(
      "./pixiStore"
    );
    await set(createCanvasContainerAtom, {
      pageId: newPage.id,
      canvasId: newCanvas.id,
    });

    await set(createLayerGraphicAtom, {
      canvasId: newCanvas.id,
      layerId: newLayer.id,
    });

    set(switchPageAtom, newPage.id);
  } catch (error) {
    console.error("페이지 추가 실패:", error);
  }
});

export const updatePageAtom = atom(
  null,
  async (get, set, { pageId, name }: { pageId: string; name: string }) => {
    const pages = get(pagesAtom);
    const currentProjectId = get(currentProjectIdAtom);

    if (!currentProjectId) return;

    try {
      const { pageApi } = await import("@/lib/api/page");

      const response = await pageApi.updatePage(currentProjectId, pageId, {
        name,
      });

      if (!response.success) {
        throw new Error("페이지 수정 실패");
      }

      const updatedPages = pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              name: response.data.name,
              updatedAt: new Date(response.data.updated_at),
            }
          : page
      );

      set(pagesAtom, updatedPages);
    } catch (error) {
      console.error("페이지 수정 실패:", error);
    }
  }
);

export const deletePageAtom = atom(null, (get, set, pageId: string) => {
  const pages = get(pagesAtom);
  const currentPageId = get(currentPageIdAtom);

  if (pages.length <= 1) return;

  const canvases = get(canvasesAtom);
  const updatedPages = pages.filter((page) => page.id !== pageId);
  const updatedCanvases = canvases.filter((canvas) => canvas.pageId !== pageId);

  set(pagesAtom, updatedPages);
  set(canvasesAtom, updatedCanvases);

  if (currentPageId === pageId) {
    set(currentPageIdAtom, updatedPages[0]?.id || null);
  }
});

export const duplicatePageAtom = atom(
  null,
  async (get, set, pageId: string) => {
    const pages = get(pagesAtom);
    const canvases = get(canvasesAtom);

    const { layersAtom } = await import("./layerStore");
    const {
      pixiStateAtom,
      createCanvasContainerAtom,
      createLayerGraphicAtom,
      generateCanvasThumbnailAtom,
    } = await import("./pixiStore");
    const { createIdMaps, duplicatePixiCanvasLayers, generateUniqueId } =
      await import("@/utils/pixiDuplication");

    const layers = get(layersAtom);
    const pixiState = get(pixiStateAtom);

    const originalPage = pages.find((p) => p.id === pageId);
    if (!originalPage) return;

    const newPageId = generateUniqueId("page");
    const originalCanvases = canvases.filter((c) => c.pageId === pageId);
    const originalLayers = layers.filter((l) =>
      originalCanvases.some((c) => c.id === l.canvasId)
    );

    const { canvasIdMap, layerIdMap } = createIdMaps(
      originalCanvases,
      originalLayers
    );

    const duplicatedPage: Page = {
      id: newPageId,
      projectId: originalPage.projectId,
      name: `${originalPage.name}-복사본`,
      order: pages.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const duplicatedCanvases: Canvas[] = originalCanvases.map((canvas) => ({
      ...canvas,
      id: canvasIdMap.get(canvas.id)!,
      pageId: newPageId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const duplicatedLayers = originalLayers.map((layer) => ({
      ...layer,
      id: layerIdMap.get(layer.id)!,
      canvasId: canvasIdMap.get(layer.canvasId)!,
      data: {
        pixiSprite: null!,
        renderTexture: null!,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const updatedPages = [...pages, duplicatedPage];
    const updatedCanvases = [...canvases, ...duplicatedCanvases];
    const updatedLayers = [...layers, ...duplicatedLayers];

    set(pagesAtom, updatedPages);
    set(canvasesAtom, updatedCanvases);
    set(layersAtom, updatedLayers);

    for (const canvas of duplicatedCanvases) {
      await set(createCanvasContainerAtom, {
        pageId: newPageId,
        canvasId: canvas.id,
      });
    }

    for (const layer of duplicatedLayers) {
      await set(createLayerGraphicAtom, {
        canvasId: layer.canvasId,
        layerId: layer.id,
      });
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 150);
        });
      });
    });

    if (pixiState.app) {
      for (const originalCanvas of originalCanvases) {
        const newCanvasId = canvasIdMap.get(originalCanvas.id)!;
        const canvasLayerIdMap = new Map(
          [...layerIdMap.entries()].filter(([originalLayerId]) =>
            originalLayers.some(
              (l) =>
                l.id === originalLayerId && l.canvasId === originalCanvas.id
            )
          )
        );

        const updatePixiApp = get(pixiStateAtom);
        await duplicatePixiCanvasLayers({
          originalCanvasId: originalCanvas.id,
          newCanvasId,
          layerIdMap: canvasLayerIdMap,
          pixiState: updatePixiApp,
          pixiApp: updatePixiApp.app!,
          setPixiState: (updater) => {
            const { pixiStateAtom } = require("./pixiStore");
            const currentState = get(pixiStateAtom);
            set(pixiStateAtom, updater(currentState));
          },
          newPageId,
          duplicatedLayers,
        });

        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 50);
            });
          });
        });
      }
    }

    set(currentPageIdAtom, newPageId);

    const { refreshCanvasThumbnailAtom } = await import("./pixiStore");
    for (const canvas of duplicatedCanvases) {
      await set(refreshCanvasThumbnailAtom, canvas.id);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setTimeout(() => {
      const { setCurrentCanvasAtom } = require("./canvasStore");
      const firstCanvas = duplicatedCanvases[0];
      if (firstCanvas) {
        set(setCurrentCanvasAtom, firstCanvas.id);
      }
    }, 100);
  }
);

export const reorderPagesAtom = atom(
  null,
  async (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const pages = get(pagesAtom);
    const currentProjectId = get(currentProjectIdAtom);

    if (!currentProjectId) return;

    const draggedPage = pages[dragIndex];
    const newPages = [...pages];

    newPages.splice(dragIndex, 1);
    newPages.splice(hoverIndex, 0, draggedPage);

    const reorderedPages = newPages.map((page, index) => ({
      ...page,
      order: index + 1,
    }));

    try {
      const { pageApi } = await import("@/lib/api/page");

      for (let i = 0; i < reorderedPages.length; i++) {
        const page = reorderedPages[i];
        if (page.order !== pages.find((p) => p.id === page.id)?.order) {
          await pageApi.updatePage(currentProjectId, page.id, {
            order: page.order,
          });
        }
      }

      set(pagesAtom, reorderedPages);
    } catch (error) {
      console.error("페이지 순서 변경 실패:", error);
      set(pagesAtom, pages);
    }
  }
);

export const setCurrentPageAtom = atom(
  null,
  async (get, set, pageId: string) => {
    console.log("페이지 변경");
    set(currentPageIdAtom, pageId);

    const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
    if (canvasesForCurrentPage.length > 0) {
      const { currentCanvasIdAtom } = await import("./canvasStore");
      set(currentCanvasIdAtom, canvasesForCurrentPage[0].id);
    }

    set(switchPageAtom, pageId);
  }
);
