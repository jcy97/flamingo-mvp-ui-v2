import React, { useState } from "react";
import { Video, ChevronDown, ChevronRight, Play } from "lucide-react";
import "@/styles/scrollbar.css";

function Conference() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConferenceActive, setIsConferenceActive] = useState(false);

  const handleJoinClick = () => {
    console.log("Join conference");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 hover:bg-neutral-700 rounded px-2 py-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={12} className="text-neutral-400" />
            ) : (
              <ChevronRight size={12} className="text-neutral-400" />
            )}
            <Video size={12} className="text-neutral-400" />
            <span className="text-xs font-medium">컨퍼런스</span>
          </button>
        </div>
        <button
          onClick={handleJoinClick}
          className="flex items-center gap-1 px-2 py-1 bg-primary-500 cursor-pointer hover:bg-primary-300 rounded text-xs transition-colors"
        >
          <Play size={10} />
          참가
        </button>
      </div>

      {isExpanded && (
        <div className="bg-neutral-800 rounded-md p-2 min-h-[40px]">
          {!isConferenceActive ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-neutral-400">화상회의 없음</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-300">회의 진행 중</span>
              </div>
              <div className="text-xs bg-neutral-700 px-2 py-1 rounded text-neutral-300">
                참가자 3명
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Conference;
