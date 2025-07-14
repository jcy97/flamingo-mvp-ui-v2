import { Page } from "@/types/page";
import React from "react";

interface PageItemProps {
  data: Page;
  isSelected: boolean;
  onSelect: (pageId: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

function PageItem({
  data,
  isSelected,
  onSelect,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: PageItemProps): React.ReactElement {
  const handleClick = () => {
    onSelect(data.id);
  };

  return (
    <div
      className={`flex items-center mt-1 rounded-md p-2 h-[28px] cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-primary text-neutral-0" : "hover:bg-primary-500"
      } ${
        isDragging
          ? "opacity-50 scale-95 rotate-1 cursor-grabbing"
          : "cursor-grab"
      }`}
      onClick={handleClick}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 w-full">
        {/* Drag handle */}
        <div className="w-1 h-4 bg-neutral-400 rounded-full opacity-60 hover:opacity-100 transition-opacity" />

        {/* Page name */}
        <span className="flex-1 truncate">{data.name}</span>
      </div>
    </div>
  );
}

export default PageItem;
