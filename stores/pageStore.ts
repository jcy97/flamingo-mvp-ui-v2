import { atom } from "jotai";
import { Page } from "@/types/page";
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
