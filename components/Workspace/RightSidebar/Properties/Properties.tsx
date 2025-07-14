import React from "react";
import { Settings } from "lucide-react";
import "@/styles/scrollbar.css";

function Properties() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Settings size={14} className="text-neutral-400" />
        <span className="text-xs font-bold">프로퍼티</span>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar min-h-0">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Width</label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Height
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              X Position
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Y Position
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Rotation
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Opacity
            </label>
            <input type="range" min="0" max="100" className="w-full" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Background Color
            </label>
            <input
              type="color"
              className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Border Width
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Border Color
            </label>
            <input
              type="color"
              className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Border Radius
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Shadow X
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Shadow Y
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Shadow Blur
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Shadow Color
            </label>
            <input
              type="color"
              className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Font Family
            </label>
            <select className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs">
              <option>Arial</option>
              <option>Helvetica</option>
              <option>Times New Roman</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Font Size
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="14"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Font Weight
            </label>
            <select className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs">
              <option>Normal</option>
              <option>Bold</option>
              <option>Light</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Text Color
            </label>
            <input
              type="color"
              className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Text Align
            </label>
            <select className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs">
              <option>Left</option>
              <option>Center</option>
              <option>Right</option>
              <option>Justify</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Line Height
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="1.5"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Letter Spacing
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs"
              placeholder="0"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Properties;
