import { atom } from "jotai";
import { Canvas } from "@/types/canvas";
import sampleData from "@/samples/data";
import { currentPageIdAtom } from "./pageStore";
import {
  resizeCanvasAndLayersAtom,
  cleanupCanvasAtom,
  switchCanvasAtom,
  generateCanvasThumbnailAtom,
} from "./pixiStore";
import { cleanupCanvasLayersAtom } from "./layerStore";

export const canvasesAtom = atom<Canvas[]>(sampleData.canvases);

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
    const canvases = get(canvasesAtom);
    const canvasesForPage = canvases.filter(
      (c) => c.pageId === canvasData.pageId
    );
    const newOrder =
      canvasesForPage.length > 0
        ? Math.max(...canvasesForPage.map((c) => c.order)) + 1
        : 1;

    const newCanvas: Canvas = {
      id: `canvas-${Date.now()}`,
      pageId: canvasData.pageId,
      name: canvasData.name,
      order: newOrder,
      width: canvasData.width,
      height: canvasData.height,
      unit: "px",
      backgroundColor: canvasData.backgroundColor || "#FFFFFF",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCanvases = [...canvases, newCanvas];
    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);

    set(currentCanvasIdAtom, newCanvas.id);

    const { addLayerAtom } = await import("./layerStore");
    await set(addLayerAtom);

    const { createCanvasContainerAtom, generateCanvasThumbnailAtom } =
      await import("./pixiStore");
    await set(createCanvasContainerAtom, {
      pageId: canvasData.pageId,
      canvasId: newCanvas.id,
    });

    await set(switchCanvasAtom, newCanvas.id);

    setTimeout(() => {
      set(generateCanvasThumbnailAtom, {
        canvasId: newCanvas.id,
        pageId: canvasData.pageId,
      });
    }, 100);

    return newCanvas.id;
  }
);

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
    const originalCanvas = canvases.find((c) => c.id === canvasId);
    if (!originalCanvas) return false;

    let sizeWarning = false;
    const updatedCanvases = canvases.map((canvas) => {
      if (canvas.id === canvasId) {
        const updatedCanvas = {
          ...canvas,
          ...(name && { name }),
          ...(width && { width }),
          ...(height && { height }),
          ...(backgroundColor && { backgroundColor }),
          updatedAt: new Date(),
        };

        if (
          (width && width !== canvas.width) ||
          (height && height !== canvas.height)
        ) {
          setTimeout(() => {
            set(resizeCanvasAndLayersAtom, {
              canvasId,
              width: width || canvas.width,
              height: height || canvas.height,
            });
          }, 100);
        }

        return updatedCanvas;
      }
      return canvas;
    });

    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);
    console.log("업데이트 캔버스");
    setTimeout(() => {
      set(generateCanvasThumbnailAtom, {
        canvasId,
        pageId: originalCanvas.pageId,
      });
    }, 200);

    return sizeWarning;
  }
);

export const deleteCanvasAtom = atom(null, (get, set, canvasId: string) => {
  const canvases = get(canvasesAtom);
  const targetCanvas = canvases.find((canvas) => canvas.id === canvasId);
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  const currentCanvasId = get(currentCanvasIdAtom);

  if (canvasesForCurrentPage.length <= 1) {
    console.warn("마지막 캔버스는 삭제할 수 없습니다.");
    return;
  }

  if (targetCanvas) {
    set(cleanupCanvasAtom, {
      pageId: targetCanvas.pageId,
      canvasId: targetCanvas.id,
    });
    set(cleanupCanvasLayersAtom, canvasId);

    const updatedCanvases = canvases.filter((canvas) => canvas.id !== canvasId);
    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);

    if (currentCanvasId === canvasId) {
      const remainingCanvases = updatedCanvases.filter(
        (canvas) => canvas.pageId === targetCanvas.pageId
      );
      if (remainingCanvases.length > 0) {
        set(setCurrentCanvasAtom, remainingCanvases[0].id);
      }
    }
  }
});

export const duplicateCanvasAtom = atom(
  null,
  async (get, set, canvasId: string) => {
    const canvases = get(canvasesAtom);
    const originalCanvas = canvases.find((c) => c.id === canvasId);
    if (!originalCanvas) return;

    const newCanvasId = `canvas-${Date.now()}`;
    const canvasesForPage = canvases.filter(
      (c) => c.pageId === originalCanvas.pageId
    );

    const duplicatedCanvas: Canvas = {
      ...originalCanvas,
      id: newCanvasId,
      name: `${originalCanvas.name} 복사본`,
      order: Math.max(...canvasesForPage.map((c) => c.order)) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCanvases = [...canvases, duplicatedCanvas];
    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);

    setTimeout(() => {
      set(generateCanvasThumbnailAtom, {
        canvasId: newCanvasId,
        pageId: originalCanvas.pageId,
      });
    }, 200);
  }
);

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

    if (!currentPageId || dragIndex === hoverIndex) return;

    const reorderedCanvases = [...canvasesForCurrentPage];
    const [draggedCanvas] = reorderedCanvases.splice(dragIndex, 1);
    reorderedCanvases.splice(hoverIndex, 0, draggedCanvas);

    const canvasesWithUpdatedOrder = reorderedCanvases.map((canvas, index) => ({
      ...canvas,
      order: index + 1,
      updatedAt: new Date(),
    }));

    const otherPageCanvases = canvases.filter(
      (canvas) => canvas.pageId !== currentPageId
    );

    const allUpdatedCanvases = [
      ...otherPageCanvases,
      ...canvasesWithUpdatedOrder,
    ];

    set(canvasesAtom, allUpdatedCanvases);
    sampleData.canvases = allUpdatedCanvases;
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
    sampleData.canvases = updatedCanvases;
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
