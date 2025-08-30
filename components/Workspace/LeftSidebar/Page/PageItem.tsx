import { Page } from "@/types/page";
import { Trash2, MoreHorizontal, Copy, Edit3 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  updatePageAtom,
  deletePageAtom,
  duplicatePageAtom,
} from "@/stores/pageStore";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const updatePage = useSetAtom(updatePageAtom);
  const deletePage = useSetAtom(deletePageAtom);
  const duplicatePage = useSetAtom(duplicatePageAtom);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
        left: rect.right - 120 + window.scrollX,
      });
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
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

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setEditingName(data.name);
    setShowDropdown(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deletePage(data.id);
    setShowDropdown(false);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    duplicatePage(data.id);
    setShowDropdown(false);
  };

  return (
    <>
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

        {(isHovered || showDropdown) && !isEditing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              ref={buttonRef}
              onClick={handleDropdownToggle}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
            >
              <MoreHorizontal size={12} />
            </button>
          </div>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="fixed bg-neutral-800 border border-neutral-600 rounded-md shadow-lg z-[99999] min-w-[120px]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <button
            onClick={handleEditClick}
            className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
          >
            <Edit3 size={12} />
            이름 변경
          </button>
          <button
            onClick={handleDuplicateClick}
            className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
          >
            <Copy size={12} />
            복제
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
    </>
  );
}

export default PageItem;
