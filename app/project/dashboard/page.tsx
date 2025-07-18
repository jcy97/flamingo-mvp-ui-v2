"use client";

import DashboardHeader from "@/components/Project/Dashboard/DashboardHeader";
import ProjectGrid from "@/components/Project/Dashboard/ProjectGrid";
import { Project } from "@/types/project";
import { useState } from "react";

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "웹사이트 디자인 프로젝트",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    description: "회사 웹사이트 리뉴얼 디자인",
  },
  {
    id: "2",
    name: "모바일 앱 UI",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    description: "쇼핑몰 모바일 앱 UI 디자인",
  },
  {
    id: "3",
    name: "브랜드 아이덴티티",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-16"),
    description: "새로운 브랜드 로고 및 아이덴티티",
  },
  {
    id: "4",
    name: "대시보드 디자인",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-19"),
    description: "관리자 대시보드 UI",
  },
  {
    id: "5",
    name: "소셜 미디어 템플릿",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-17"),
    description: "인스타그램 포스트 템플릿",
  },
  {
    id: "6",
    name: "프레젠테이션 디자인",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-15"),
    description: "회사 발표용 프레젠테이션",
  },
];

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
