"use client";

import AddButton from "@/components/Common/Button/AddButton";
import Page from "./Page/Page";

interface LeftSidebarProps {
  width: number;
  visible: boolean;
  isDragging: boolean;
  onToggle: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export function LeftSidebar({
  width,
  visible,
  isDragging,
  onToggle,
  onMouseDown,
  children,
}: LeftSidebarProps) {
  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-30 text-neutral-100 p-2 bg-neutral-900 border rounded shadow-sm hover:bg-primary-500"
      >
        →
      </button>
    );
  }

  return (
    <>
      <div
        className="absolute top-0 left-0 h-full bg-neutral-900 border-r z-20 overflow-hidden"
        style={{ width }}
      >
        <div className="p-4 text-neutral-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Left Sidebar</h3>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-primary-500 rounded"
            >
              ←
            </button>
          </div>
          {/* 페이지 영역 */}
          <Page />
        </div>
      </div>
      <div
        className={`absolute top-0 h-full w-1 bg-gray-200 hover:bg-primary-500 cursor-col-resize z-30 ${
          isDragging ? "bg-primary-500" : ""
        }`}
        style={{ left: width }}
        onMouseDown={onMouseDown}
      />
    </>
  );
}
