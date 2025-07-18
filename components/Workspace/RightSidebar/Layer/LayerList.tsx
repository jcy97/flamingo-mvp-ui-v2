import React from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Type,
  Image,
  Square,
  Circle,
  PenTool,
  MoreHorizontal,
} from "lucide-react";
import { Layer as LayerType } from "@/types/layer";
import "@/styles/scrollbar.css";

interface LayerListProps {
  layers: LayerType[];
}

function LayerList({ layers }: LayerListProps) {
  const getLayerIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type size={16} className="text-blue-400" />;
      case "image":
        return <Image size={16} className="text-green-400" />;
      case "rectangle":
        return <Square size={16} className="text-purple-400" />;
      case "circle":
        return <Circle size={16} className="text-orange-400" />;
      case "vector":
        return <PenTool size={16} className="text-pink-400" />;
      default:
        return <Square size={16} className="text-neutral-400" />;
    }
  };

  return (
    <div className="flex-1 bg-neutral-800 rounded-md overflow-y-auto custom-scrollbar">
      <div className="flex flex-col">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`flex items-center h-[55px] w-full hover:bg-neutral-700 cursor-pointer transition-colors group border-b border-neutral-700 ${
              index === 2 ? "bg-neutral-600" : ""
            }`}
          >
            <div className="flex h-full w-[40px] items-center justify-center p-2 flex-shrink-0">
              <button className="hover:bg-neutral-600 rounded transition-colors p-1">
                {layer.isVisible ? (
                  <Eye
                    size={16}
                    className="text-neutral-400 group-hover:text-neutral-300"
                  />
                ) : (
                  <EyeOff
                    size={16}
                    className="text-neutral-500 group-hover:text-neutral-400"
                  />
                )}
              </button>
            </div>

            <div className="flex flex-1 items-center gap-3 overflow-hidden px-3 py-2 min-w-0">
              <div className="h-[40px] w-[45px] bg-neutral-600 rounded flex items-center justify-center relative flex-shrink-0">
                {getLayerIcon(layer.type || "rectangle")}
                {layer.isLocked && (
                  <div className="absolute -top-1 -right-1">
                    <Lock size={8} className="text-yellow-500" />
                  </div>
                )}
              </div>

              <span className="flex-1 min-w-0 text-sm text-neutral-300 group-hover:text-neutral-200 truncate">
                {layer.name}
              </span>
            </div>

            <div className="flex h-full w-[40px] items-center justify-center pr-4 flex-shrink-0">
              <button className="hover:bg-neutral-600 rounded transition-colors opacity-0 group-hover:opacity-100 p-1">
                <MoreHorizontal size={16} className="text-neutral-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerList;
