"use client";
import LeftSidebar from "@/components/Project/LeftSidebar/LeftSidebar";
import React, { useRef } from "react";

interface ProjectLayoutProps {
  children: React.ReactNode;
}

function ProjectLayout({ children }: ProjectLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="h-screen relative bg-neutral-600">
      <div>{children}</div>
      <LeftSidebar />
    </div>
  );
}

export default ProjectLayout;
