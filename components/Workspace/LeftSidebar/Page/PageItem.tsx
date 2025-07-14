import { Page } from "@/types/page";
import React from "react";

interface PageItemProps {
  data: Page;
  isSelected: boolean;
  onSelect: (pageId: string) => void;
}

function PageItem({
  data,
  isSelected,
  onSelect,
}: PageItemProps): React.ReactElement {
  const handleClick = () => {
    onSelect(data.id);
  };

  return (
    <div
      className={`flex items-center mt-1 rounded-md p-2 h-[28px] cursor-pointer transition-colors ${
        isSelected ? "bg-primary text-neutral-0" : "hover:bg-primary-500"
      }`}
      onClick={handleClick}
    >
      {data.name}
    </div>
  );
}

export default PageItem;
