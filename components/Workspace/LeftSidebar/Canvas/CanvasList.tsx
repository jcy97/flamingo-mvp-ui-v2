import React from "react";
import { useAtom } from "jotai";
import CanvasItem from "./CanvasItem";
import {
  canvasesForCurrentPageAtom,
  currentCanvasIdAtom,
} from "@/stores/canvasStore";

function CanvasList() {
  const [canvasesForCurrentPage] = useAtom(canvasesForCurrentPageAtom);
  const [currentCanvasId, setCurrentCanvasId] = useAtom(currentCanvasIdAtom);

  const handleCanvasSelect = (canvasId: string) => {
    setCurrentCanvasId(canvasId);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full overflow-y-auto">
      {canvasesForCurrentPage.map((canvas) => (
        <CanvasItem
          key={canvas.id}
          data={canvas}
          isSelected={currentCanvasId === canvas.id}
          onSelect={handleCanvasSelect}
        />
      ))}
    </div>
  );
}

export default CanvasList;
