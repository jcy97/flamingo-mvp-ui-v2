import React from "react";
import { useAtom } from "jotai";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import BrushProperties from "./BrushProperties/BrushProperties";
import PenProperties from "./PenProperties/PenProperties";
import EraserProperties from "./EraserProperties/EraserProperties";
import "@/styles/scrollbar.css";

function Properties() {
  const [selectedToolId] = useAtom(selectedToolIdAtom);

  const renderProperties = () => {
    switch (selectedToolId) {
      case ToolbarItemIDs.PEN:
        return <PenProperties />;

      case ToolbarItemIDs.BRUSH:
        return <BrushProperties />;

      case ToolbarItemIDs.ERASER:
        return <EraserProperties />;

      case ToolbarItemIDs.TEXT:
        return <TextProperties />;

      case ToolbarItemIDs.SELECT:
        return <SelectionProperties />;

      default:
        return <GeneralProperties />;
    }
  };

  return renderProperties();
}

function TextProperties() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <span className="text-xs font-medium">텍스트</span>
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md p-3">
        <div className="text-xs text-neutral-500 text-center py-8">
          텍스트 도구 프로퍼티
        </div>
      </div>
    </div>
  );
}

function SelectionProperties() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <span className="text-xs font-medium">선택</span>
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md p-3">
        <div className="text-xs text-neutral-500 text-center py-8">
          선택 도구 프로퍼티
        </div>
      </div>
    </div>
  );
}

function GeneralProperties() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <span className="text-xs font-medium">프로퍼티</span>
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar min-h-0">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Width</label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Height
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="100"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              X Position
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Y Position
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Rotation
            </label>
            <input
              type="number"
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-400 block mb-1">
              Opacity
            </label>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Properties;
