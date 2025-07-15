"use client";

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import Connection from "./Communication/Connection/Connection";
import Conference from "./Communication/Conference/Conference";
import Properties from "./Properties/Properties";
import Layer from "./Layer/Layer";
import { useState, useCallback, useRef, useEffect } from "react";
import "@/styles/scrollbar.css";
import Separator from "@/components/Common/Separator";

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
  const [propertiesHeight, setPropertiesHeight] = useState(60);
  const [isDraggingSeparator, setIsDraggingSeparator] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleSeparatorMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSeparator(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSeparator || !sidebarRef.current) return;

      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const communicationHeight = 120;
      const availableHeight = sidebarRect.height - communicationHeight - 100;
      const relativeY = e.clientY - sidebarRect.top - communicationHeight;
      const newPropertiesPercentage = (relativeY / availableHeight) * 100;

      setPropertiesHeight(Math.max(20, Math.min(80, newPropertiesPercentage)));
    };

    const handleMouseUp = () => {
      setIsDraggingSeparator(false);
    };

    if (isDraggingSeparator) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingSeparator]);

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
        ref={sidebarRef}
        className="absolute top-0 right-0 h-full bg-neutral-900 border-l z-20"
        style={{ width }}
      >
        <div className="flex flex-col h-full text-neutral-100">
          <div className="flex items-center justify-end p-4 pb-2">
            <button
              onClick={onToggle}
              className="p-1 hover:bg-primary-500 rounded cursor-pointer"
            >
              <ArrowRightToLine size={16} />
            </button>
          </div>

          <div className="px-4 pb-2 space-y-2">
            <Connection sidebarWidth={width} />
            <Conference />
          </div>
          <Separator />

          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="overflow-hidden"
              style={{ height: `${propertiesHeight}%` }}
            >
              <div className="px-4">
                <Properties />
              </div>
            </div>

            <div
              className={`relative h-1 hover:bg-primary-500 cursor-row-resize mx-4 ${
                isDraggingSeparator ? "bg-primary-500" : "bg-neutral-600"
              }`}
              onMouseDown={handleSeparatorMouseDown}
            >
              <div className="absolute inset-x-0 -inset-y-1" />
            </div>

            <div
              className="flex-1 overflow-hidden"
              style={{ height: `${100 - propertiesHeight}%` }}
            >
              <div className="px-4 h-full">
                <Layer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
