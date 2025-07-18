import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Image,
  Square,
  Circle,
  PenTool,
  MoreHorizontal,
  Edit3,
  GripVertical,
} from "lucide-react";
import { Layer as LayerType } from "@/types/layer";
import { useSetAtom } from "jotai";
import {
  updateLayerAtom,
  deleteLayerAtom,
  toggleLayerVisibilityAtom,
  toggleLayerLockAtom,
} from "@/stores/layerStore";

interface LayerItemProps {
  layer: LayerType;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

function LayerItem({
  layer,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(layer.name);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateLayer = useSetAtom(updateLayerAtom);
  const deleteLayer = useSetAtom(deleteLayerAtom);
  const toggleVisibility = useSetAtom(toggleLayerVisibilityAtom);
  const toggleLock = useSetAtom(toggleLayerLockAtom);

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

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type size={16} className="text-blue-400" />;
      case "image":
        return <Image size={16} className="text-green-400" />;
      case "shape":
        return <Square size={16} className="text-purple-400" />;
      case "circle":
        return <Circle size={16} className="text-orange-400" />;
      case "brush":
        return <PenTool size={16} className="text-pink-400" />;
      default:
        return <Square size={16} className="text-neutral-400" />;
    }
  };

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!layer.isLocked) {
      setIsEditing(true);
      setEditingName(layer.name);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingName.trim() && editingName !== layer.name) {
      updateLayer({ layerId: layer.id, updates: { name: editingName.trim() } });
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditingName(layer.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVisibility(layer.id);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditingName(layer.name);
    setShowDropdown(false);
  };

  const handleLockToggle = () => {
    toggleLock(layer.id);
    setShowDropdown(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
  };

  return (
    <div
      className={`flex items-center h-[55px] w-full hover:bg-neutral-700 cursor-pointer transition-colors group border-b border-neutral-700 ${
        isDragging
          ? "opacity-50 scale-95 rotate-1 cursor-grabbing"
          : "cursor-grab"
      }`}
      draggable={!isEditing && !layer.isLocked}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={`flex h-full w-[40px] items-center justify-center p-2 flex-shrink-0 ${
          layer.isLocked ? "opacity-60" : ""
        }`}
      >
        <button
          onClick={handleVisibilityToggle}
          className="hover:bg-neutral-600 rounded transition-colors p-1"
        >
          {layer.isVisible ? (
            <Eye
              size={16}
              className="text-neutral-400 group-hover:text-neutral-300"
            />
          ) : (
            <EyeOff
              size={16}
              className="text-neutral-500 group-hover:text-neutral-400"
            />
          )}
        </button>
      </div>

      <div
        className={`flex flex-1 items-center gap-3 overflow-hidden px-3 py-2 min-w-0 ${
          layer.isLocked ? "opacity-60" : ""
        }`}
      >
        <div className="h-[40px] w-[45px] bg-neutral-600 rounded flex items-center justify-center relative flex-shrink-0">
          {getLayerIcon(layer.type || "shape")}
          {layer.isLocked && (
            <div className="absolute -top-1 -right-1">
              <Lock size={8} className="text-yellow-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
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
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-300 min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 min-w-0 text-sm text-neutral-300 group-hover:text-neutral-200 truncate"
              onDoubleClick={handleNameDoubleClick}
            >
              {layer.name}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex h-full w-[40px] items-center justify-center pr-4 flex-shrink-0 relative"
        ref={dropdownRef}
      >
        <button
          onClick={handleDropdownToggle}
          className="hover:bg-neutral-600 rounded transition-colors opacity-0 group-hover:opacity-100 p-1"
        >
          <MoreHorizontal size={16} className="text-neutral-400" />
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-md shadow-lg z-[9999] min-w-[120px]">
            <button
              onClick={handleEditClick}
              className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
            >
              <Edit3 size={12} />
              이름 변경
            </button>
            <button
              onClick={handleLockToggle}
              className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
            >
              {layer.isLocked ? (
                <>
                  <Unlock size={12} />
                  잠금 해제
                </>
              ) : (
                <>
                  <Lock size={12} />
                  잠금
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LayerItem;
