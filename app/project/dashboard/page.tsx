"use client";

import DashboardHeader from "@/components/Project/Dashboard/DashboardHeader";
import ProjectGrid from "@/components/Project/Dashboard/ProjectGrid";
import { sampleProjects } from "@/samples/data";
import { useState } from "react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateProject = () => {
    console.log("새 프로젝트 생성");
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-600">
      <div className="ml-[280px] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            프로젝트 대시보드
          </h1>
          <p className="text-neutral-400">
            모든 프로젝트를 한 곳에서 관리하세요
          </p>
        </div>

        <DashboardHeader
          onSearch={handleSearch}
          onCreateProject={handleCreateProject}
        />

        <ProjectGrid projects={sampleProjects} searchQuery={searchQuery} />
      </div>
    </div>
  );
}
