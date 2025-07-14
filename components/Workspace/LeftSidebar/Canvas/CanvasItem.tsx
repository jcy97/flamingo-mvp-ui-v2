import { Canvas } from "@/types/canvas";
import { Settings, GripVertical } from "lucide-react";
import React from "react";

interface CanvasItemProps {
  data: Canvas;
  isSelected: boolean;
  onSelect: (canvasId: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

function CanvasItem({
  data,
  isSelected,
  onSelect,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: CanvasItemProps): React.ReactElement {
  const handleClick = () => {
    onSelect(data.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
  };

  return (
    <div
      className={`w-[85%] aspect-[4/3] min-w-[140px] rounded-xl border-2 flex flex-col cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-primary"
          : "border-neutral-500 hover:border-primary-500"
      } ${
        isDragging
          ? "opacity-50 scale-95 rotate-1 cursor-grabbing"
          : "cursor-grab"
      }`}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="h-[20%] min-h-[25px] bg-neutral-700 rounded-tl-xl rounded-tr-xl px-2 flex items-center justify-between">
        {/* Drag handle */}
        <div className="flex items-center gap-1">
          <GripVertical
            size={12}
            className="text-neutral-400 hover:text-primary-500 cursor-grab active:cursor-grabbing transition-colors"
          />
          <span className="text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-sm">
            {data.name}
          </span>
        </div>

        <Settings
          size={14}
          className="flex-shrink-0 text-neutral-300 cursor-pointer hover:text-primary-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle settings click
          }}
        />
      </div>
      <div className="flex-1 bg-neutral-100 rounded-bl-xl rounded-br-xl">
        {/* Canvas preview content goes here */}
      </div>
    </div>
  );
}

export default CanvasItem;
