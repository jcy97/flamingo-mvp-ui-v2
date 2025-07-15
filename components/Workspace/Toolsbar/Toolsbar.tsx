import { toolbarItems, ToolbarItemIDs } from "@/constants/toolsbarItems";
import React, { useState } from "react";
import ToolsbarItem from "./ToolsbarItem";

function Toolsbar() {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    ToolbarItemIDs.SELECT
  );

  const handleToolSelect = (toolId: string) => {
    setSelectedToolId(toolId);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] flex h-[40px] max-w-[500px] -translate-x-1/2 transform items-center gap-4 rounded-xl bg-neutral-900 px-4 outline-none">
      {toolbarItems.map((item) => (
        <ToolsbarItem
          key={item.id}
          item={item}
          isSelected={selectedToolId === item.id}
          onSelect={handleToolSelect}
        />
      ))}
    </div>
  );
}

export default Toolsbar;
