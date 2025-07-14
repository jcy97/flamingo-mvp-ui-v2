import React from "react";
import { useAtom, useSetAtom } from "jotai";
import PageItem from "./PageItem";
import { pagesAtom, currentPageIdAtom } from "@/stores/pageStore";
import { autoSelectFirstCanvasAtom } from "@/stores/canvasStore";

function PageList() {
  const [pages] = useAtom(pagesAtom);
  const [currentPageId, setCurrentPageId] = useAtom(currentPageIdAtom);
  const autoSelectFirstCanvas = useSetAtom(autoSelectFirstCanvasAtom);

  const handlePageSelect = (pageId: string) => {
    setCurrentPageId(pageId);
    autoSelectFirstCanvas();
  };

  return (
    <div className="text-xs text-neutral-100 max-h-[150px] overflow-y-auto">
      {pages.map((page) => (
        <PageItem
          key={page.id}
          data={page}
          isSelected={currentPageId === page.id}
          onSelect={handlePageSelect}
        />
      ))}
    </div>
  );
}

export default PageList;
