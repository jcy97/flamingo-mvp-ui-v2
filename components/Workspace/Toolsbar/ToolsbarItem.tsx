import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToolsbarItem } from "@/types/toolsbar";

interface ToolbarItemProps {
  item: ToolsbarItem;
  isSelected: boolean;
  onSelect: (toolId: string) => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMainItemClick = () => {
    if (item.hasSubItems) {
      // 드롭다운 토글
      setIsDropdownOpen(!isDropdownOpen);
      // 서브아이템이 있는 경우 첫 번째 서브아이템 선택
      if (item.subItems && item.subItems.length > 0 && !isDropdownOpen) {
        onSelect(item.subItems[0].id);
      }
    } else {
      // 단일 아이템 선택
      onSelect(item.id);
    }
  };

  const handleSubItemClick = (subItemId: string) => {
    onSelect(subItemId);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      <div
        className={`flex h-8 items-center rounded-lg px-2 transition-colors ${
          isSelected
            ? "bg-primary-500 hover:bg-primary-500"
            : "hover:bg-neutral-800"
        }`}
      >
        <button
          onClick={handleMainItemClick}
          className="flex items-center outline-none"
        >
          <item.icon className="h-5 w-5 text-neutral-100" />
        </button>

        {item.hasSubItems && (
          <button onClick={handleDropdownToggle} className="ml-1">
            <ChevronDown
              className={`h-3 w-3 text-neutral-100 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* 서브 툴바 드롭다운 */}
      {isDropdownOpen && item.hasSubItems && item.subItems && (
        <div className="absolute bottom-full left-0 mb-2 w-32 rounded-lg bg-neutral-900 p-1 shadow-lg">
          {item.subItems.map((subItem) => (
            <button
              key={subItem.id}
              onClick={() => handleSubItemClick(subItem.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-neutral-800"
            >
              <subItem.icon className="h-5 w-5 text-neutral-100" />
              <span className="text-sm text-neutral-100">{subItem.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolbarItem;
