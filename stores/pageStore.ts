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

    const layers = get(layersAtom);
    const pixiState = get(pixiStateAtom);

    const originalPage = pages.find((p) => p.id === pageId);
    if (!originalPage) return;

    const newPageId = `page-${String(Date.now()).slice(-3)}`;
    const canvasIdMap = new Map<string, string>();
    const layerIdMap = new Map<string, string>();

    const duplicatedPage: Page = {
      id: newPageId,
      projectId: originalPage.projectId,
      name: `${originalPage.name}-복사본`,
      order: pages.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const originalCanvases = canvases.filter((c) => c.pageId === pageId);
    const duplicatedCanvases: Canvas[] = [];

    originalCanvases.forEach((canvas) => {
      const newCanvasId = `canvas-${String(Date.now() + Math.random()).slice(
        -6
      )}`;
      canvasIdMap.set(canvas.id, newCanvasId);

      duplicatedCanvases.push({
        ...canvas,
        id: newCanvasId,
        pageId: newPageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const originalLayers = layers.filter((l) =>
      originalCanvases.some((c) => c.id === l.canvasId)
    );

    const duplicatedLayers = originalLayers.map((layer) => {
      const newLayerId = `layer-${String(Date.now() + Math.random()).slice(
        -6
      )}`;
      const newCanvasId = canvasIdMap.get(layer.canvasId);
      layerIdMap.set(layer.id, newLayerId);

      return {
        ...layer,
        id: newLayerId,
        canvasId: newCanvasId!,
        data: {
          pixiSprite: null!,
          renderTexture: null!,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

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
      await new Promise((resolve) => setTimeout(resolve, 100));

      for (const layer of duplicatedLayers) {
        const originalLayerId = [...layerIdMap.entries()].find(
          ([, newId]) => newId === layer.id
        )?.[0];

        if (originalLayerId) {
          const originalCanvasId = originalLayers.find(
            (l) => l.id === originalLayerId
          )?.canvasId;
          if (originalCanvasId) {
            const originalLayerGraphic =
              pixiState.layerGraphics[originalCanvasId]?.[originalLayerId];
            const newLayerGraphic =
              pixiState.layerGraphics[layer.canvasId]?.[layer.id];

            if (
              originalLayerGraphic?.renderTexture &&
              newLayerGraphic?.renderTexture
            ) {
              const tempContainer = new (await import("pixi.js")).Container();
              const tempSprite = new (await import("pixi.js")).Sprite(
                originalLayerGraphic.renderTexture
              );
              tempContainer.addChild(tempSprite);

              pixiState.app.renderer.render({
                container: tempContainer,
                target: newLayerGraphic.renderTexture,
                clear: true,
              });

              tempContainer.destroy({ children: true });
            }
          }
        }
      }
    }

    set(currentPageIdAtom, newPageId);
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
