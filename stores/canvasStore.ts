import { atom } from "jotai";
import { Canvas } from "@/types/canvas";
import sampleData from "@/samples/data";
import { currentPageIdAtom } from "./pageStore";
import {
  autoSelectFirstLayerAtom,
  layersForCurrentCanvasAtom,
  addLayerAtom,
} from "./layerStore";
import {
  switchCanvasAtom,
  pixiStateAtom,
  getCanvasContainerAtom,
  createCanvasContainerAtom,
  resizeCanvasAndLayersAtom,
  PixiState,
} from "./pixiStore";

export const canvasesAtom = atom<Canvas[]>(sampleData.canvases);

export const currentCanvasIdAtom = atom<string | null>(null);

export const canvasesForCurrentPageAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentPageId = get(currentPageIdAtom);
  if (!currentPageId) return [];
  return canvases.filter((canvas) => canvas.pageId === currentPageId);
});

export const currentCanvasAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  return canvases.find((canvas) => canvas.id === currentCanvasId) || null;
});

export const autoSelectFirstCanvasAtom = atom(null, (get, set) => {
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  if (canvasesForCurrentPage.length > 0) {
    set(setCurrentCanvasAtom, canvasesForCurrentPage[0].id);
  } else {
    set(currentCanvasIdAtom, null);
  }
});

export const addCanvasAtom = atom(null, (get, set) => {
  const currentPageId = get(currentPageIdAtom);
  if (!currentPageId) return;

  const canvases = get(canvasesAtom);
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  const newCanvasId = `canvas-${String(Date.now()).slice(-3)}`;

  const newCanvas: Canvas = {
    id: newCanvasId,
    pageId: currentPageId,
    name: `캔버스 ${canvasesForCurrentPage.length + 1}`,
    order: canvasesForCurrentPage.length + 1,
    width: 1920,
    height: 1080,
    unit: "px",
    backgroundColor: "#FFFFFF",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedCanvases = [...canvases, newCanvas];
  sampleData.canvases = updatedCanvases;
  set(canvasesAtom, updatedCanvases);

  set(currentCanvasIdAtom, newCanvasId);
  set(createCanvasContainerAtom, {
    pageId: currentPageId,
    canvasId: newCanvasId,
  });
  set(switchCanvasAtom, newCanvasId);

  setTimeout(() => {
    set(addLayerAtom);
  }, 100);
});

export const updateCanvasAtom = atom(
  null,
  (
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
    const targetCanvas = canvases.find((c) => c.id === canvasId);

    if (!targetCanvas) return;

    const updatedCanvases = canvases.map((canvas) =>
      canvas.id === canvasId
        ? {
            ...canvas,
            ...(name !== undefined && { name }),
            ...(width !== undefined && { width }),
            ...(height !== undefined && { height }),
            ...(backgroundColor !== undefined && { backgroundColor }),
            updatedAt: new Date(),
          }
        : canvas
    );

    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);

    if (width !== undefined || height !== undefined) {
      setTimeout(() => {
        set(resizeCanvasAndLayersAtom, {
          canvasId,
          width: width || targetCanvas.width,
          height: height || targetCanvas.height,
        });
      }, 50);
    }

    if (backgroundColor !== undefined) {
      const pixiState: PixiState = get(pixiStateAtom);
      if (pixiState.app) {
        const bgColor =
          backgroundColor === "TRANSPARENT"
            ? 0x000000
            : parseInt(backgroundColor.replace("#", "0x"));
        pixiState.app.renderer.background.color = bgColor;
        pixiState.app.renderer.background.alpha =
          backgroundColor === "TRANSPARENT" ? 0 : 1;
      }
    }
  }
);

export const deleteCanvasAtom = atom(null, (get, set, canvasId: string) => {
  const canvases = get(canvasesAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);

  if (canvasesForCurrentPage.length <= 1) return;

  const updatedCanvases = canvases.filter((canvas) => canvas.id !== canvasId);
  sampleData.canvases = updatedCanvases;
  set(canvasesAtom, updatedCanvases);

  if (currentCanvasId === canvasId) {
    const remainingCanvases = updatedCanvases.filter(
      (canvas) => canvas.pageId === get(currentPageIdAtom)
    );
    set(currentCanvasIdAtom, remainingCanvases[0]?.id || null);
  }
});

export const reorderCanvasesAtom = atom(
  null,
  (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const canvases = get(canvasesAtom);
    const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
    const currentPageId = get(currentPageIdAtom);

    if (!currentPageId) return;

    const draggedCanvas = canvasesForCurrentPage[dragIndex];
    const newCanvasesForPage = [...canvasesForCurrentPage];

    newCanvasesForPage.splice(dragIndex, 1);
    newCanvasesForPage.splice(hoverIndex, 0, draggedCanvas);

    const reorderedCanvasesForPage = newCanvasesForPage.map(
      (canvas, index) => ({
        ...canvas,
        order: index + 1,
      })
    );

    const otherCanvases = canvases.filter(
      (canvas) => canvas.pageId !== currentPageId
    );
    const updatedCanvases = [...otherCanvases, ...reorderedCanvasesForPage];

    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);
  }
);

const updateCanvasLayerOrder = (get: any, canvasId: string) => {
  const pixiState = get(pixiStateAtom);
  const canvasContainer = get(getCanvasContainerAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);

  if (!canvasContainer || !canvasId) return;

  canvasContainer.removeChildren();

  const sortedLayers = [...layersForCurrentCanvas].sort(
    (a, b) => a.order - b.order
  );

  sortedLayers.forEach((layer) => {
    const layerGraphic = pixiState.layerGraphics[canvasId]?.[layer.id];
    if (layerGraphic?.pixiSprite) {
      canvasContainer.addChild(layerGraphic.pixiSprite);
      layerGraphic.pixiSprite.visible = layer.isVisible;
      layerGraphic.pixiSprite.alpha = layer.opacity;
    }
  });
};

export const setCurrentCanvasAtom = atom(null, (get, set, canvasId: string) => {
  set(currentCanvasIdAtom, canvasId);
  set(autoSelectFirstLayerAtom);
  set(switchCanvasAtom, canvasId);

  setTimeout(() => {
    updateCanvasLayerOrder(get, canvasId);
  }, 0);
});
