"use client";

import { projectMenuItems } from "@/constants/projectMenus";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LeftSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-[280px] bg-neutral-900 flex flex-col z-10">
      <div className="flex flex-col p-6 flex-1">
        <div className="flex items-center mb-8">
          <Image src="/logo.png" alt="Flamingo Logo" width={160} height={80} />
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {projectMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                      isActive
                        ? "bg-primary-500 text-neutral-0"
                        : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        className={`${
                          isActive ? "text-neutral-0" : "text-neutral-400"
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <div className="flex items-center justify-center w-5 h-5 bg-red-500 text-neutral-0 text-xs rounded-full">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-neutral-700 pt-4">
          <button className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
