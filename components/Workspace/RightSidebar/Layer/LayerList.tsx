import React, { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Layer as LayerType } from "@/types/layer";
import LayerItem from "./LayerItem";
import {
  activeLayerIdAtom,
  layersForCurrentCanvasAtom,
  reorderLayersAtom,
  setActiveLayerAtom,
} from "@/stores/layerStore";
import "@/styles/scrollbar.css";

interface LayerListProps {
  layers?: LayerType[];
}

function LayerList({ layers: propLayers }: LayerListProps) {
  const [layersForCurrentCanvas] = useAtom(layersForCurrentCanvasAtom);
  const reorderLayers = useSetAtom(reorderLayersAtom);

  const setActiveLayer = useSetAtom(setActiveLayerAtom);
  const activeLayerId = useAtomValue(activeLayerIdAtom);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const layers = propLayers || layersForCurrentCanvas;

  const handleLayerSelect = (layerId: string) => {
    setActiveLayer(layerId);
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
      reorderLayers({ dragIndex: draggedIndex, hoverIndex: dropIndex });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 bg-neutral-800 rounded-md overflow-y-auto custom-scrollbar">
      <div className="flex flex-col">
        {layers.map((layer, index) => (
          <div key={layer.id} className="relative">
            {dragOverIndex === index &&
              draggedIndex !== null &&
              draggedIndex !== index && (
                <div className="h-0.5 bg-primary mb-1 animate-pulse" />
              )}

            <LayerItem
              layer={layer}
              isSelected={activeLayerId === layer.id}
              onClick={() => handleLayerSelect(layer.id)}
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
    </div>
  );
}

export default LayerList;
