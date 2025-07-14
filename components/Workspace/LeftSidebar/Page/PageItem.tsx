import { Page } from "@/types/page";
import { Trash2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useSetAtom } from "jotai";
import { updatePageAtom, deletePageAtom } from "@/stores/pageStore";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updatePage = useSetAtom(updatePageAtom);
  const deletePage = useSetAtom(deletePageAtom);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      onSelect(data.id);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditingName(data.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingName.trim() && editingName !== data.name) {
      updatePage({ pageId: data.id, name: editingName.trim() });
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deletePage(data.id);
  };

  return (
    <div
      className={`flex items-center justify-between mt-1 rounded-md p-2 h-[28px] cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-primary text-neutral-0" : "hover:bg-primary-500"
      } ${
        isDragging
          ? "opacity-50 scale-95 rotate-1 cursor-grabbing"
          : "cursor-grab"
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-1 h-4 bg-neutral-400 rounded-full opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editingName}
            onChange={handleNameChange}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-inherit min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{data.name}</span>
        )}
      </div>

      {isHovered && !isEditing && (
        <button
          onClick={handleDeleteClick}
          className="p-1 hover:bg-red-500 rounded transition-colors flex-shrink-0"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

export default PageItem;
