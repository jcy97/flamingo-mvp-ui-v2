import React from "react";
import {
  Cat,
  Dog,
  Rabbit,
  Fish,
  Bird,
  Squirrel,
  LucideIcon,
} from "lucide-react";
import { getUserProfileColor } from "@/utils/color";
import { User } from "@/types/auth";

const animalIcons: LucideIcon[] = [Cat, Dog, Rabbit, Fish, Bird, Squirrel];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

function getUserAnimalIcon(userId: string): LucideIcon {
  const hash = Math.abs(hashCode(userId));
  return animalIcons[hash % animalIcons.length];
}

interface ProfileIconProps {
  user: User;
  size?: number;
  className?: string;
  disableTooltip?: boolean;
}

export default function ProfileIcon({
  user,
  size = 24,
  className = "",
  disableTooltip = false,
}: ProfileIconProps) {
  const AnimalIcon = getUserAnimalIcon(user.id);
  const color = getUserProfileColor(user.id);

  return (
    <div className="relative group">
      <div
        className={`rounded-full flex items-center justify-center cursor-pointer ${className}`}
        style={{
          backgroundColor: color,
          width: size,
          height: size,
        }}
      >
        <AnimalIcon size={size * 0.6} className="text-white" />
      </div>

      {!disableTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-900 text-white text-xs rounded border border-neutral-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          {user.name}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
        </div>
      )}
    </div>
  );
}
