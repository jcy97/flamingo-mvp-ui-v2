"use client";

import DashboardHeader from "@/components/Project/Dashboard/DashboardHeader";
import ProjectGrid from "@/components/Project/Dashboard/ProjectGrid";
import CreateProjectModal from "@/components/Project/Dashboard/CreateProjectModal";
import DeleteProjectModal from "@/components/Project/Dashboard/DeleteProjectModal";
import Modal from "@/components/Common/Modal";
import { usePopup } from "@/hooks/usePopup";
import {
  projectsAtom,
  addProjectAtom,
  deleteProjectAtom,
} from "@/stores/projectStore";
import { useAtom } from "jotai";
import { useState } from "react";
import { Project } from "@/types/project";

export default function DashboardPage() {
  const [projects] = useAtom(projectsAtom);
  const [, addProject] = useAtom(addProjectAtom);
  const [, deleteProject] = useAtom(deleteProjectAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const { popup, openPopup, closePopup } = usePopup();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateProject = () => {
    openPopup({
      title: "새 프로젝트 생성",
      content: (
        <CreateProjectModal onClose={closePopup} onCreateProject={addProject} />
      ),
      size: "md",
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    openPopup({
      title: "프로젝트 삭제",
      content: (
        <DeleteProjectModal
          project={project}
          onClose={closePopup}
          onDeleteProject={deleteProject}
        />
      ),
      size: "md",
    });
  };

  return (
    <div className="flex-1 h-screen bg-neutral-600 flex flex-col">
      <div className="ml-[280px] flex flex-col h-full">
        <div className="flex-shrink-0 bg-neutral-700 shadow-lg border-b border-neutral-600 p-6 pb-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">
              프로젝트 대시보드
            </h1>
            <p className="text-sm text-neutral-400">
              모든 프로젝트를 한 곳에서 관리하세요
            </p>
          </div>

          <DashboardHeader
            onSearch={handleSearch}
            onCreateProject={handleCreateProject}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <ProjectGrid
            projects={projects}
            searchQuery={searchQuery}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </div>

      <Modal
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        size={popup.size}
        showCloseButton={popup.showCloseButton}
      >
        {popup.content}
      </Modal>
    </div>
  );
}
