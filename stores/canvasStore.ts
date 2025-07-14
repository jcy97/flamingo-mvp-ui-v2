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
