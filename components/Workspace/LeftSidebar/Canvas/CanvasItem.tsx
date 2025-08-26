import { Canvas } from "@/types/canvas";
import { Settings, GripVertical, Trash2, Edit3 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useSetAtom } from "jotai";
import { updateCanvasAtom, deleteCanvasAtom } from "@/stores/canvasStore";
import CanvasConfigModal from "@/components/Common/Modal/CanvasConfigModal";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const updateCanvas = useSetAtom(updateCanvasAtom);
  const deleteCanvas = useSetAtom(deleteCanvasAtom);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleClick = () => {
    if (!isEditing) {
      onSelect(data.id);
    }
  };

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingName(data.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingName.trim() && editingName !== data.name) {
      updateCanvas({ canvasId: data.id, name: editingName.trim() });
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditingName(data.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDeleteClick = () => {
    deleteCanvas(data.id);
    setShowDropdown(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingName(data.name);
    setShowDropdown(false);
  };

  const handleConfigClick = () => {
    setIsConfigModalOpen(true);
    setShowDropdown(false);
  };

  const handleConfigConfirm = (
    width: number,
    height: number,
    backgroundColor: string
  ) => {
    updateCanvas({
      canvasId: data.id,
      width,
      height,
      backgroundColor,
    });
    setIsConfigModalOpen(false);
  };

  const handleConfigClose = () => {
    setIsConfigModalOpen(false);
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
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="h-[20%] min-h-[25px] bg-neutral-700 rounded-tl-xl rounded-tr-xl px-2 flex items-center justify-between">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripVertical
            size={12}
            className="text-neutral-400 hover:text-primary-500 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0"
          />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-sm"
              onDoubleClick={handleNameDoubleClick}
            >
              {data.name}
            </span>
          )}
        </div>

        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <Settings
            size={14}
            className="text-neutral-300 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={handleSettingsClick}
          />

          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg z-50 min-w-[120px]">
              <button
                onClick={handleEditClick}
                className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
              >
                <Edit3 size={12} />
                이름 변경
              </button>
              <button
                onClick={handleConfigClick}
                className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
              >
                <Settings size={12} />
                캔버스 설정
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2"
              >
                <Trash2 size={12} />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 bg-neutral-100 rounded-bl-xl rounded-br-xl">
        {/* Canvas preview content goes here */}
      </div>
      <CanvasConfigModal
        isOpen={isConfigModalOpen}
        onClose={handleConfigClose}
        onConfirm={handleConfigConfirm}
        mode="edit"
        canvasData={data}
      />
    </div>
  );
}

export default CanvasItem;
