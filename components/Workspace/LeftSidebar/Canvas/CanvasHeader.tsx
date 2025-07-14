import AddButton from "@/components/Common/Button/AddButton";
import React from "react";

function CanvasHeader() {
  return (
    <div className="flex items-center justify-start gap-2">
      <p className="text-xs font-bold">캔버스</p>
      <AddButton />
    </div>
  );
}

export default CanvasHeader;
