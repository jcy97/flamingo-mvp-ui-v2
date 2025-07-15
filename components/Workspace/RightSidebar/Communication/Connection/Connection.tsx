import React, { useState, useMemo } from "react";
import { Users, ChevronDown, ChevronRight, Share2 } from "lucide-react";
import ProfileIcon from "@/components/Common/ProfileIcon";
import { User } from "@/types/auth";
import "@/styles/scrollbar.css";

const sampleUsers: User[] = [
  { id: "1", email: "john@example.com", name: "John Doe", role: "Designer" },
  { id: "2", email: "jane@example.com", name: "Jane Smith", role: "Developer" },
  { id: "3", email: "bob@example.com", name: "Bob Johnson", role: "Manager" },
  {
    id: "4",
    email: "alice@example.com",
    name: "Alice Brown",
    role: "Designer",
  },
  {
    id: "5",
    email: "charlie@example.com",
    name: "Charlie Wilson",
    role: "Developer",
  },
  {
    id: "6",
    email: "diana@example.com",
    name: "Diana Davis",
    role: "Product Manager",
  },
  {
    id: "7",
    email: "eve@example.com",
    name: "Eve Miller",
    role: "UX Researcher",
  },
  {
    id: "8",
    email: "frank@example.com",
    name: "Frank Garcia",
    role: "Frontend Developer",
  },
];

interface ConnectionProps {
  sidebarWidth?: number;
}

function Connection({ sidebarWidth = 300 }: ConnectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const maxVisibleUsers = useMemo(() => {
    const availableWidth = sidebarWidth - 32; // padding 제외
    const iconSize = 20; // 아이콘 크기
    const gap = 4; // gap
    const iconWithGap = iconSize + gap;
    const plusButtonWidth = iconSize + gap;

    // +버튼 공간을 고려한 계산
    const usersPerRow = Math.floor(
      (availableWidth - plusButtonWidth) / iconWithGap
    );

    // 최소 3개는 보장, 최대 제한 없음
    return Math.max(3, usersPerRow);
  }, [sidebarWidth]);

  const visibleUsers = sampleUsers.slice(0, maxVisibleUsers);
  const hiddenUsers = sampleUsers.slice(maxVisibleUsers);

  const handleShareClick = () => {
    console.log("Share workspace");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 hover:bg-neutral-700 rounded p-1 -ml-1"
          >
            {isExpanded ? (
              <ChevronDown size={12} className="text-neutral-400" />
            ) : (
              <ChevronRight size={12} className="text-neutral-400" />
            )}
            <Users size={14} className="text-neutral-400" />
            <span className="text-xs font-bold">접속자</span>
          </button>
        </div>
        <button
          onClick={handleShareClick}
          className="flex items-center gap-1 px-2 py-1 bg-secondary-500 hover:bg-secondary-700 rounded text-xs transition-colors"
        >
          <Share2 size={10} />
          공유
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
