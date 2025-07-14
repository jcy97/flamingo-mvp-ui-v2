import React from "react";
import CanvasHeader from "./CanvasHeader";
import CanvasList from "./CanvasList";

function Canvas() {
  return (
    <div className="flex flex-col gap-2 text-neutral-100 h-full">
      <CanvasHeader />
      <div className="flex-1 overflow-hidden">
        <CanvasList />
      </div>
    </div>
  );
}

export default Canvas;
