import { atom } from "jotai";
import { Canvas } from "@/types/canvas";
import sampleData from "@/samples/data";
import { currentPageIdAtom } from "./pageStore";

// Canvases data atom
export const canvasesAtom = atom<Canvas[]>(sampleData.canvases);

// Current selected canvas ID atom
export const currentCanvasIdAtom = atom<string | null>(null);

// Canvases for current page derived atom
export const canvasesForCurrentPageAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentPageId = get(currentPageIdAtom);
  if (!currentPageId) return [];
  return canvases.filter((canvas) => canvas.pageId === currentPageId);
});

// Current canvas derived atom
export const currentCanvasAtom = atom((get) => {
  const canvases = get(canvasesAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  return canvases.find((canvas) => canvas.id === currentCanvasId) || null;
});

// Auto-select first canvas when page changes
export const autoSelectFirstCanvasAtom = atom(null, (get, set) => {
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  if (canvasesForCurrentPage.length > 0) {
    set(currentCanvasIdAtom, canvasesForCurrentPage[0].id);
  } else {
    set(currentCanvasIdAtom, null);
  }
});

// Add new canvas action
export const addCanvasAtom = atom(null, (get, set) => {
  const currentPageId = get(currentPageIdAtom);
  if (!currentPageId) return;

  const canvases = get(canvasesAtom);
  const canvasesForCurrentPage = get(canvasesForCurrentPageAtom);
  const newCanvasId = `canvas-${String(Date.now()).slice(-3)}`;

  const newCanvas: Canvas = {
    id: newCanvasId,
    pageId: currentPageId,
    name: `새 캔버스 ${canvasesForCurrentPage.length + 1}`,
    order: canvasesForCurrentPage.length + 1,
    width: 800,
    height: 400,
    unit: "px",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedCanvases = [...canvases, newCanvas];
  sampleData.canvases = updatedCanvases;
  set(canvasesAtom, updatedCanvases);
  set(currentCanvasIdAtom, newCanvasId);
});

// Update canvas action
export const updateCanvasAtom = atom(
  null,
  (get, set, { canvasId, name }: { canvasId: string; name: string }) => {
    const canvases = get(canvasesAtom);
    const updatedCanvases = canvases.map((canvas) =>
      canvas.id === canvasId
        ? { ...canvas, name, updatedAt: new Date() }
        : canvas
    );

    sampleData.canvases = updatedCanvases;
    set(canvasesAtom, updatedCanvases);
  }
);

// Delete canvas action
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

// Reorder canvases action
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
