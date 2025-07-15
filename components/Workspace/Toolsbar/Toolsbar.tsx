import { toolbarItems } from "@/constants/toolsbarItems";
import React, { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { selectedToolIdAtom, openDropdownAtom } from "@/stores/toolsbarStore";
import ToolsbarItem from "./ToolsbarItem";

function Toolsbar() {
  const [selectedToolId, setSelectedToolId] = useAtom(selectedToolIdAtom);
  const [openDropdown, setOpenDropdown] = useAtom(openDropdownAtom);
  const toolsbarRef = useRef<HTMLDivElement>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedToolId(toolId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsbarRef.current &&
        !toolsbarRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenDropdown]);

  return (
    <div
      ref={toolsbarRef}
      className="fixed bottom-6 left-1/2 z-[9999] flex h-[40px] max-w-[500px] -translate-x-1/2 transform items-center gap-4 rounded-xl bg-neutral-900 px-4 outline-none"
    >
      {toolbarItems.map((item) => (
        <ToolsbarItem key={item.id} item={item} onSelect={handleToolSelect} />
      ))}
    </div>
  );
}

export default Toolsbar;
