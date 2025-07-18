import AddButton from "@/components/Common/Button/AddButton";
import React from "react";

function LayerHeader() {
  return (
    <div className="flex items-cetner justify-start gap-2">
      <p className="text-xs font-bold">레이어</p>
      <div className="">
        <AddButton />
      </div>
    </div>
  );
}

export default LayerHeader;
