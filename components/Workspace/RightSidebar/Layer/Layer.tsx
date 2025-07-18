import React from "react";
import { Layers, Eye, EyeOff, Lock } from "lucide-react";
import { Layer as LayerType } from "@/types/layer";
import "@/styles/scrollbar.css";
import { sampleLayers } from "@/samples/data";
import LayerHeader from "./LayerHeader";

function Layer() {
  const layers: LayerType[] = sampleLayers;

  return (
    <div className="flex flex-col gap-3 h-full">
      <LayerHeader />
      <div className="flex-1 bg-neutral-800 rounded-md p-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-neutral-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-1">
                <button className="p-0.5 hover:bg-neutral-600 rounded transition-colors">
                  {layer.isVisible ? (
                    <Eye
                      size={12}
                      className="text-neutral-400 group-hover:text-neutral-300"
                    />
                  ) : (
                    <EyeOff
                      size={12}
                      className="text-neutral-500 group-hover:text-neutral-400"
                    />
                  )}
                </button>
                {layer.isLocked && (
                  <Lock size={10} className="text-yellow-500 opacity-80" />
                )}
              </div>
              <span className="flex-1 text-xs truncate text-neutral-300 group-hover:text-neutral-200">
                {layer.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Layer;
