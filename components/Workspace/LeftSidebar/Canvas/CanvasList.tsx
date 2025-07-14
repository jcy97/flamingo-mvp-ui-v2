import sampleData from "@/samples/data";
import React from "react";
import CanvasItem from "./CanvasItem";

const canvasData = sampleData.canvases;

function CanvasList() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4 h-full overflow-y-auto">
      {canvasData.map((canvas) => (
        <CanvasItem key={canvas.id} data={canvas} isSelected={false} />
      ))}
    </div>
  );
}

export default CanvasList;
