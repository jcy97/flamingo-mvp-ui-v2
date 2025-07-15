import React from "react";
import { Users } from "lucide-react";
import "@/styles/scrollbar.css";

function Connection() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Users size={14} className="text-neutral-400" />
        <span className="text-xs font-bold">접속자</span>
      </div>
      <div className="bg-neutral-800 rounded-md p-2 min-h-[40px] flex items-center justify-center">
        <span className="text-xs text-neutral-400">접속자 없음</span>
      </div>
    </div>
  );
}

export default Connection;
