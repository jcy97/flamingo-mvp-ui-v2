"use client";

import { useState, useEffect } from "react";
import { User, Settings, ChevronUp } from "lucide-react";
import Link from "next/link";
import { StoredAuthData } from "@/types/auth";

interface UserProfileProps {
  onLogout: () => void;
}

function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<StoredAuthData["user"] | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const authData =
      localStorage.getItem("flamingo-auth") ||
      sessionStorage.getItem("flamingo-auth");
    if (authData) {
      try {
        const parsedData: StoredAuthData = JSON.parse(authData);
        setUser(parsedData.user);
      } catch (error) {
        console.error("Failed to parse auth data:", error);
      }
    }
  }, []);

  if (!user) {
    return null;
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "artist":
        return "아티스트";
      case "student":
        return "학생";
      case "teacher":
        return "선생님";
      default:
        return "사용자";
    }
  };

  return (
    <div className="relative">
      <div className="bg-neutral-800 rounded-lg p-4 mb-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center gap-3 text-left hover:bg-neutral-700 rounded-lg p-2 transition-colors"
        >
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-neutral-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-neutral-100 font-medium truncate">{user.name}</p>
            <p className="text-neutral-400 text-sm truncate">
              {getUserTypeLabel(user.user_type || "")}
            </p>
          </div>
          <ChevronUp
            size={16}
            className={`text-neutral-400 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="mt-2 pt-2 border-t border-neutral-700 space-y-1">
            <Link
              href="/project/settings"
              className="flex items-center gap-3 px-2 py-2 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings size={16} />
              <span className="text-sm">설정</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
