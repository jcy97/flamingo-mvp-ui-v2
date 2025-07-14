import { atom } from "jotai";
import { Page } from "@/types/page";
import { Canvas } from "@/types/canvas";
import sampleData from "@/samples/data";

// Pages data atom
export const pagesAtom = atom<Page[]>(sampleData.pages);

// Current selected page ID atom
export const currentPageIdAtom = atom<string | null>(
  sampleData.pages[0]?.id || null
);

// Current page derived atom
export const currentPageAtom = atom((get) => {
  const pages = get(pagesAtom);
  const currentPageId = get(currentPageIdAtom);
  return pages.find((page) => page.id === currentPageId) || null;
});

// Add new page action
export const addPageAtom = atom(null, (get, set) => {
  const pages = get(pagesAtom);
  const newPageId = `page-${String(Date.now()).slice(-3)}`;
  const newCanvasId = `canvas-${String(Date.now()).slice(-3)}`;

  const newPage: Page = {
    id: newPageId,
    projectId: "proj-webtoon-001",
    name: `새 페이지 ${pages.length + 1}`,
    order: pages.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newCanvas: Canvas = {
    id: newCanvasId,
    pageId: newPageId,
    name: "새 캔버스 1",
    order: 1,
    width: 800,
    height: 400,
    unit: "px",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedPages = [...pages, newPage];
  const updatedCanvases = [...sampleData.canvases, newCanvas];

  sampleData.pages = updatedPages;
  sampleData.canvases = updatedCanvases;

  set(pagesAtom, updatedPages);
  set(currentPageIdAtom, newPageId);
});

// Reorder pages action
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
