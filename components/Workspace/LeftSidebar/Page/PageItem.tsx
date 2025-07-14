import { Page } from "@/types/page";
import React from "react";

interface PageItemProps {
  data: Page;
  isSelected: boolean;
}

function PageItem({ data, isSelected }: PageItemProps): React.ReactElement {
  return (
    <div className="flex items-center mt-1 rounded-md p-2 h-[28px] cursor-pointer hover:bg-primary-500">
      {data.name}
    </div>
  );
}

export default PageItem;
