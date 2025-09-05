import React, { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import PageItem from "./PageItem";
import {
  pagesAtom,
  currentPageIdAtom,
  reorderPagesAtom,
  setCurrentPageAtom,
} from "@/stores/pageStore";
import { autoSelectFirstCanvasAtom } from "@/stores/canvasStore";
import "@/styles/scrollbar.css";

function PageList() {
  const [pages] = useAtom(pagesAtom);
  const currentPageId = useAtomValue(currentPageIdAtom);
  const reorderPages = useSetAtom(reorderPagesAtom);
  const setCurrentPage = useSetAtom(setCurrentPageAtom);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePageSelect = (pageId: string) => {
    setCurrentPage(pageId);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderPages({ dragIndex: draggedIndex, hoverIndex: dropIndex });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="text-xs text-neutral-100 max-h-[150px] overflow-y-auto custom-scrollbar">
      {pages.map((page, index) => (
        <div key={page.id} className="relative">
          {/* Drop indicator above current item */}
          {dragOverIndex === index &&
            draggedIndex !== null &&
            draggedIndex !== index && (
              <div className="h-0.5 bg-primary mb-1 animate-pulse" />
            )}
          <PageItem
            data={page}
            isSelected={currentPageId === page.id}
            onSelect={handlePageSelect}
            isDragging={draggedIndex === index}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          />
        </div>
      ))}
    </div>
  );
}

export default PageList;
