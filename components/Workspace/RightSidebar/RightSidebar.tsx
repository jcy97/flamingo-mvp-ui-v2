"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

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
        className={`absolute top-0 h-full w-1 bg-gray-200 hover:bg-primary-500 cursor-col-resize z-30 ${
          isDragging ? "bg-primary-500" : ""
        }`}
        style={{ right: width }}
        onMouseDown={onMouseDown}
      />
      <div
        className="absolute top-0 right-0 h-full bg-neutral-900 border-l z-20 overflow-hidden"
        style={{ width }}
      >
        <div className="p-4 text-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Right Sidebar</h3>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-primary-500 rounded cursor-pointer"
            >
              <ArrowRightToLine size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
