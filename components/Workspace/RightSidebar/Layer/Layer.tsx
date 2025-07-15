import React from "react";
import { Layers, Eye, EyeOff, Lock } from "lucide-react";
import "@/styles/scrollbar.css";

function Layer() {
  const layers = [
    { id: "1", name: "Background", visible: true, locked: false },
    { id: "2", name: "Shape 1", visible: true, locked: false },
    { id: "3", name: "Text Layer", visible: false, locked: true },
    { id: "4", name: "Button", visible: true, locked: false },
    { id: "5", name: "Header Component", visible: true, locked: false },
    { id: "6", name: "Navigation Menu", visible: true, locked: false },
    { id: "7", name: "Content Area", visible: true, locked: false },
    { id: "8", name: "Sidebar Widget", visible: false, locked: false },
    { id: "9", name: "Footer Section", visible: true, locked: true },
    { id: "10", name: "Image Gallery", visible: true, locked: false },
    { id: "11", name: "Contact Form", visible: true, locked: false },
    { id: "12", name: "Social Icons", visible: false, locked: false },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Layers size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">레이어</span>
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md p-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-neutral-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-1">
                <button className="p-0.5 hover:bg-neutral-600 rounded transition-colors">
                  {layer.visible ? (
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
                {layer.locked && (
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
