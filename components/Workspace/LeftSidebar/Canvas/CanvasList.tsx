import React, { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import CanvasItem from "./CanvasItem";
import {
  canvasesForCurrentPageAtom,
  currentCanvasIdAtom,
  reorderCanvasesAtom,
} from "@/stores/canvasStore";
import "@/styles/scrollbar.css";

function CanvasList() {
  const [canvasesForCurrentPage] = useAtom(canvasesForCurrentPageAtom);
  const [currentCanvasId, setCurrentCanvasId] = useAtom(currentCanvasIdAtom);
  const reorderCanvases = useSetAtom(reorderCanvasesAtom);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleCanvasSelect = (canvasId: string) => {
    setCurrentCanvasId(canvasId);
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
      reorderCanvases({ dragIndex: draggedIndex, hoverIndex: dropIndex });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full overflow-y-auto p-2 custom-scrollbar">
      {canvasesForCurrentPage.map((canvas, index) => (
        <div
          key={canvas.id}
          className="relative w-full flex flex-col items-center"
        >
          {/* Drop indicator above current item */}
          {dragOverIndex === index &&
            draggedIndex !== null &&
            draggedIndex !== index && (
              <div className="w-[85%] h-1 bg-primary rounded mb-2 animate-pulse" />
            )}

          <CanvasItem
            data={canvas}
            isSelected={currentCanvasId === canvas.id}
            onSelect={handleCanvasSelect}
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

export default CanvasList;
