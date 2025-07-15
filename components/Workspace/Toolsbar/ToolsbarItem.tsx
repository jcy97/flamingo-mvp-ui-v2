import React from "react";
import { ChevronDown } from "lucide-react";
import { useAtom } from "jotai";
import { ToolsbarItem } from "@/types/toolsbar";
import {
  selectedToolIdAtom,
  openDropdownAtom,
  lastSelectedSubItemsAtom,
} from "@/stores/toolsbarStore";

interface ToolbarItemProps {
  item: ToolsbarItem;
  onSelect: (toolId: string) => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ item, onSelect }) => {
  const [selectedToolId] = useAtom(selectedToolIdAtom);
  const [openDropdown, setOpenDropdown] = useAtom(openDropdownAtom);
  const [lastSelectedSubItems, setLastSelectedSubItems] = useAtom(
    lastSelectedSubItemsAtom
  );

  const isDropdownOpen = openDropdown === item.id;

  const getIsSelected = () => {
    if (item.hasSubItems && item.subItems) {
      return item.subItems.some((subItem) => subItem.id === selectedToolId);
    }
    return selectedToolId === item.id;
  };

  const getDisplayIcon = () => {
    if (item.hasSubItems && item.subItems) {
      const lastSelectedSubItemId = lastSelectedSubItems[item.id];
      const selectedSubItem = item.subItems.find(
        (subItem) => subItem.id === lastSelectedSubItemId
      );
      return selectedSubItem ? selectedSubItem.icon : item.icon;
    }
    return item.icon;
  };

  const handleMainItemClick = () => {
    if (item.hasSubItems) {
      if (isDropdownOpen) {
        setOpenDropdown(null);
      } else {
        setOpenDropdown(item.id);
      }
      const lastSelectedSubItemId = lastSelectedSubItems[item.id];
      if (lastSelectedSubItemId) {
        onSelect(lastSelectedSubItemId);
      }
    } else {
      onSelect(item.id);
      setOpenDropdown(null);
    }
  };

  const handleSubItemClick = (subItemId: string) => {
    onSelect(subItemId);
    setLastSelectedSubItems((prev) => ({
      ...prev,
      [item.id]: subItemId,
    }));
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(item.id);
    }
  };

  const DisplayIcon = getDisplayIcon();
  const actualIsSelected = getIsSelected();

  return (
    <div className="relative">
      <div
        className={`flex h-8 items-center rounded-lg px-2 transition-colors ${
          actualIsSelected
            ? "bg-primary-500 hover:bg-primary-500"
            : "hover:bg-neutral-800"
        }`}
      >
        <button
          onClick={handleMainItemClick}
          className="flex items-center outline-none"
        >
          <DisplayIcon className="h-5 w-5 text-neutral-100" />
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
