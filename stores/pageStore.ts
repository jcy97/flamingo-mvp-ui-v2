import { atom } from "jotai";
import { Page } from "@/types/page";
import { Canvas } from "@/types/canvas";
import sampleData from "@/samples/data";
import {
  canvasesAtom,
  canvasesForCurrentPageAtom,
  setCurrentCanvasAtom,
  addCanvasAtom,
} from "./canvasStore";
import { switchPageAtom } from "./pixiStore";

export const pagesAtom = atom<Page[]>(sampleData.pages);

export const currentPageIdAtom = atom<string | null>(
  sampleData.pages[0]?.id || null
);

export const currentPageAtom = atom((get) => {
  const pages = get(pagesAtom);
  const currentPageId = get(currentPageIdAtom);
  return pages.find((page) => page.id === currentPageId) || null;
});

export const addPageAtom = atom(null, (get, set) => {
  const pages = get(pagesAtom);
  const newPageId = `page-${String(Date.now()).slice(-3)}`;

  const newPage: Page = {
    id: newPageId,
    projectId: "proj-webtoon-001",
    name: `페이지 ${pages.length + 1}`,
    order: pages.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedPages = [...pages, newPage];
  sampleData.pages = updatedPages;
  set(pagesAtom, updatedPages);

  set(currentPageIdAtom, newPageId);

  set(addCanvasAtom);

  set(switchPageAtom, newPageId);
});

export const updatePageAtom = atom(
  null,
  (get, set, { pageId, name }: { pageId: string; name: string }) => {
    const pages = get(pagesAtom);
    const updatedPages = pages.map((page) =>
      page.id === pageId ? { ...page, name, updatedAt: new Date() } : page
    );

    sampleData.pages = updatedPages;
    set(pagesAtom, updatedPages);
  }
);

export const deletePageAtom = atom(null, (get, set, pageId: string) => {
  const pages = get(pagesAtom);
  const currentPageId = get(currentPageIdAtom);

  if (pages.length <= 1) return;

  const updatedPages = pages.filter((page) => page.id !== pageId);
  const updatedCanvases = sampleData.canvases.filter(
    (canvas) => canvas.pageId !== pageId
  );

  sampleData.pages = updatedPages;
  sampleData.canvases = updatedCanvases;

  set(pagesAtom, updatedPages);

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
    const { pixiStateAtom, createCanvasContainerAtom, createLayerGraphicAtom } =
      await import("./pixiStore");
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

    sampleData.pages = updatedPages;
    sampleData.canvases = updatedCanvases;
    sampleData.layers = updatedLayers;

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

        await duplicatePixiCanvasLayers({
          originalCanvasId: originalCanvas.id,
          newCanvasId,
          layerIdMap: canvasLayerIdMap,
          pixiState,
          pixiApp: pixiState.app,
          setPixiState: (updater) => {
            const { pixiStateAtom } = require("./pixiStore");
            const currentState = get(pixiStateAtom);
            set(pixiStateAtom, updater(currentState));
          },
          newPageId,
          duplicatedLayers,
        });
      }
    }

    set(currentPageIdAtom, newPageId);

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
  (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const pages = get(pagesAtom);
    const draggedPage = pages[dragIndex];
    const newPages = [...pages];

    newPages.splice(dragIndex, 1);
    newPages.splice(hoverIndex, 0, draggedPage);

    const reorderedPages = newPages.map((page, index) => ({
      ...page,
      order: index + 1,
    }));

    sampleData.pages = reorderedPages;
    set(pagesAtom, reorderedPages);
  }
);

export const setCurrentPageAtom = atom(null, (get, set, pageId: string) => {
  console.log("페이지 변경");
  set(currentPageIdAtom, pageId);

  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  if (canvasesForCurrentPage.length > 0) {
    set(setCurrentCanvasAtom, canvasesForCurrentPage[0].id);
  }

  set(switchPageAtom, pageId);
});
