"use client";

import AddButton from "@/components/Common/Button/AddButton";
import Page from "./Page/Page";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import Separator from "@/components/Common/Separator";
import Canvas from "./Canvas/Canvas";

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
        className="absolute top-4 left-0 z-30 text-neutral-100 p-1 bg-neutral-900 cursor-pointer border rounded shadow-sm hover:bg-primary-500"
      >
        <ArrowRightToLine size={16} />
      </button>
    );
  }

  return (
    <>
      <div
        className="absolute top-0 left-0 h-full bg-neutral-900 border-r z-20 overflow-hidden"
        style={{ width }}
      >
        <div className="p-4 text-neutral-100 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Left Sidebar</h3>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-primary-500 rounded cursor-pointer"
            >
              <ArrowLeftToLine size={16} />
            </button>
          </div>
          <Separator />
          {/* 페이지 영역 */}
          <Page />
          <Separator />
          {/* 캔버스 영역 - flex-1으로 남은 공간 차지 */}
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>
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
