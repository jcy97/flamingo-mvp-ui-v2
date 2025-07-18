"use client";
import LeftSidebar from "@/components/Project/LeftSidebar/LeftSidebar";
import React from "react";

interface ProjectLayoutProps {
  children: React.ReactNode;
}

function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-600">
      <LeftSidebar />
      {children}
    </div>
  );
}

export default ProjectLayout;
