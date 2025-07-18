"use client";

import { ArrowLeftToLine, ArrowRightToLine, Users, Share2 } from "lucide-react";
import Connection from "./Communication/Connection/Connection";
import Conference from "./Communication/Conference/Conference";
import Properties from "./Properties/Properties";
import Layer from "./Layer/Layer";
import ShareModal from "./ShareModal";
import Modal from "@/components/Common/Modal";
import { usePopup } from "@/hooks/usePopup";
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
  const { popup, openPopup, closePopup } = usePopup();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isNarrow = width < 250;

  const handleSeparatorMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSeparator(true);
  }, []);

  const handleShareClick = () => {
    openPopup({
      title: "워크스페이스 공유",
      content: <ShareModal />,
      size: "sm",
    });
  };

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
        className="absolute top-4 right-0 z-30 p-2 text-neutral-100 bg-neutral-900 border border-neutral-700 rounded-l cursor-pointer shadow-lg hover:bg-primary-500 hover:border-primary-500 transition-colors"
      >
        <ArrowLeftToLine size={16} />
      </button>
    );
  }

  return (
    <>
      <div
        className={`absolute top-0 h-full w-1 hover:bg-primary-500 cursor-col-resize z-30 transition-colors ${
          isDragging ? "bg-primary-500" : "bg-neutral-700"
        }`}
        style={{ right: width }}
        onMouseDown={onMouseDown}
      />
      <div
        ref={sidebarRef}
        className="absolute top-0 right-0 h-full bg-neutral-900 border-l border-neutral-700 z-20"
        style={{ width }}
      >
        <div className="flex flex-col h-full text-neutral-100">
          <div className="p-3 pb-2 border-b border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
                  <Users size={12} className="text-neutral-400 flex-shrink-0" />
                  {!isNarrow && (
                    <span className="text-xs font-medium text-neutral-300">
                      워크스페이스
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1 px-2 py-1 bg-secondary-500 cursor-pointer hover:bg-secondary-300 rounded text-xs transition-colors"
                  title="공유"
                >
                  <Share2 size={10} />
                  {!isNarrow && "공유"}
                </button>
                <button
                  onClick={onToggle}
                  className="p-1 hover:bg-neutral-700 rounded cursor-pointer transition-colors"
                  title="사이드바 닫기"
                >
                  <ArrowRightToLine size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Connection sidebarWidth={width} />
              <Conference />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="overflow-hidden"
              style={{ height: `${propertiesHeight}%` }}
            >
              <div className="px-3 py-2 h-full">
                <Properties />
              </div>
            </div>

            <div
              className={`relative h-1 hover:bg-primary-500 cursor-row-resize mx-3 transition-colors ${
                isDraggingSeparator ? "bg-primary-500" : "bg-neutral-700"
              }`}
              onMouseDown={handleSeparatorMouseDown}
            >
              <div className="absolute inset-x-0 -inset-y-1" />
            </div>

            <div
              className="flex-1 overflow-hidden"
              style={{ height: `${100 - propertiesHeight}%` }}
            >
              <div className="px-3 py-2 h-full">
                <Layer />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        size={popup.size}
        showCloseButton={popup.showCloseButton}
      >
        {popup.content}
      </Modal>
    </>
  );
}
