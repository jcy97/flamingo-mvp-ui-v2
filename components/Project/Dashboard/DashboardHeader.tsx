"use client";

import { Search, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DashboardHeaderProps {
  onSearch: (query: string) => void;
  onCreateProject: () => void;
}

function DashboardHeader({ onSearch, onCreateProject }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-neutral-800 border border-neutral-600 rounded-lg pl-10 pr-4 py-3 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={onCreateProject}
        className="ml-4 flex items-center gap-2 cursor-pointer bg-secondary-500 hover:bg-secondary-300 text-neutral-0 px-4 py-3 rounded-lg transition-colors font-medium"
      >
        <Plus size={20} />
        <span>새 프로젝트</span>
      </button>
    </div>
  );
}

export default DashboardHeader;
