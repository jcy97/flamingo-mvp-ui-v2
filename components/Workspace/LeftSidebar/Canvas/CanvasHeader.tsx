import AddButton from "@/components/Common/Button/AddButton";
import { useSetAtom } from "jotai";
import { addCanvasAtom } from "@/stores/canvasStore";
import React from "react";

function CanvasHeader() {
  const addCanvas = useSetAtom(addCanvasAtom);

  const handleAddCanvas = () => {
    addCanvas();
  };

  return (
    <div className="flex items-center justify-start gap-2">
      <p className="text-xs font-bold">캔버스</p>
      <div onClick={handleAddCanvas}>
        <AddButton />
      </div>
    </div>
  );
}

export default CanvasHeader;
