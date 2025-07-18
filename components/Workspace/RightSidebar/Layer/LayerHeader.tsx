import AddButton from "@/components/Common/Button/AddButton";
import { useSetAtom } from "jotai";
import { addLayerAtom } from "@/stores/layerStore";
import React from "react";

function LayerHeader() {
  const addLayer = useSetAtom(addLayerAtom);

  const handleAddLayer = () => {
    addLayer();
  };

  return (
    <div className="flex items-center justify-start gap-2">
      <p className="text-xs font-bold">레이어</p>
      <div onClick={handleAddLayer}>
        <AddButton />
      </div>
    </div>
  );
}

export default LayerHeader;
