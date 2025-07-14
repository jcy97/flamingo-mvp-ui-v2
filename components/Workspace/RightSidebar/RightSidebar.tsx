"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import Connection from "./Communication/Connection/Connection";
import Conference from "./Communication/Conference/Conference";
import Separator from "@/components/Common/Separator";
import Properties from "./Properties/Properties";
import Layer from "./Layer/Layer";

interface RightSidebarProps {
  width: number;
  visible: boolean;
  isDragging: boolean;
  onToggle: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export function RightSidebar({
  width,
  visible,
  isDragging,
  onToggle,
  onMouseDown,
  children,
}: RightSidebarProps) {
  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-4 right-0 z-30 p-1 text-neutral-100 bg-neutral-900 border rounded cursor-pointer shadow-sm hover:bg-primary-500"
      >
        <ArrowLeftToLine size={16} />
      </button>
    );
  }

  return (
    <>
      <div
        className={`absolute top-0 h-full w-1 hover:bg-primary-500 cursor-col-resize z-30 ${
          isDragging ? "bg-primary-500" : ""
        }`}
        style={{ right: width }}
        onMouseDown={onMouseDown}
      />
      <div
        className="absolute top-0 right-0 h-full bg-neutral-900 border-l z-20 overflow-hidden"
        style={{ width }}
      >
        <div className="flex flex-col p-4 text-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggle}
              className="p-1 hover:bg-primary-500 rounded cursor-pointer"
            >
              <ArrowRightToLine size={16} />
            </button>
          </div>
          <Connection />
          <Conference />
          <Separator />
          <Properties />
          <Separator />
          <Layer />
        </div>
      </div>
    </>
  );
}
