import { Canvas } from "@/types/canvas";
import { Settings } from "lucide-react";
import React from "react";

interface CanvasItemProps {
  data: Canvas;
  isSelected: boolean;
}

function CanvasItem({ data, isSelected }: CanvasItemProps): React.ReactElement {
  return (
    <div className="w-[85%] aspect-[4/3] min-w-[140px] rounded-xl border border-neutral-500 flex flex-col cursor-pointer hover:border-primary-500 hover:border-2">
      <div className="h-[20%] min-h-[25px] bg-neutral-700 rounded-tl-xl rounded-tr-xl px-2 flex items-center justify-between">
        <span className="text-ellipsis overflow-hidden whitespace-nowrap flex-1 mr-2 text-sm">
          {data.name}
        </span>
        <Settings
          size={14}
          className="flex-shrink-0 text-neutral-300 cursor-pointer hover:text-primary-500"
        />
      </div>
      <div className="flex-1 bg-neutral-100 rounded-bl-xl rounded-br-xl">
        {/* Canvas preview content goes here */}
      </div>
    </div>
  );
}

export default CanvasItem;
