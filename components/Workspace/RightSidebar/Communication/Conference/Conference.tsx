import React from "react";
import { Video } from "lucide-react";
import "@/styles/scrollbar.css";

function Conference() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Video size={14} className="text-neutral-400" />
        <span className="text-xs font-bold">컨퍼런스</span>
      </div>
      <div className="bg-neutral-800 rounded-md p-2 min-h-[40px] flex items-center justify-center">
        <span className="text-xs text-neutral-400">화상회의 없음</span>
      </div>
    </div>
  );
}

export default Conference;
