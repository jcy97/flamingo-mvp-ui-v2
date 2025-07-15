import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProfileIcon from "@/components/Common/ProfileIcon";
import { User } from "@/types/auth";
import "@/styles/scrollbar.css";
import { sampleUsers } from "@/samples/data";

interface ConnectionProps {
  sidebarWidth?: number;
}

function Connection({ sidebarWidth = 300 }: ConnectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const maxVisibleUsers = useMemo(() => {
    const availableWidth = sidebarWidth - 32;
    const iconSize = 20;
    const gap = 4;
    const iconWithGap = iconSize + gap;
    const plusButtonWidth = iconSize + gap;

    const usersPerRow = Math.floor(
      (availableWidth - plusButtonWidth) / iconWithGap
    );

    return Math.max(3, usersPerRow);
  }, [sidebarWidth]);

  const visibleUsers = sampleUsers.slice(0, maxVisibleUsers);
  const hiddenUsers = sampleUsers.slice(maxVisibleUsers);

  return (
    <div className="flex flex-col gap-2">
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
          <span className="text-xs font-medium">접속자</span>
          <span className="text-xs bg-neutral-700 px-1 py-0.5 rounded text-neutral-300">
            {sampleUsers.length}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-neutral-800 rounded-md p-2 min-h-[40px]">
          {sampleUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-neutral-400">접속자 없음</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {visibleUsers.map((user) => (
                <ProfileIcon key={user.id} user={user} size={20} />
              ))}
              {hiddenUsers.length > 0 && (
                <div className="relative group">
                  <div className="w-5 h-5 rounded-full bg-neutral-600 hover:bg-neutral-500 flex items-center justify-center text-xs text-neutral-300 transition-colors cursor-pointer">
                    +{hiddenUsers.length}
                  </div>

                  <div className="absolute bottom-full right-0 mb-1 p-2 bg-neutral-900 border border-neutral-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[999] whitespace-nowrap min-w-max">
                    <div className="space-y-1">
                      {hiddenUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <ProfileIcon
                            user={user}
                            size={16}
                            disableTooltip={true}
                          />
                          <span className="text-xs text-neutral-300">
                            {user.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-full right-2 border-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Connection;
