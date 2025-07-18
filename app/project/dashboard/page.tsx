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

        <ProjectGrid
          projects={projects}
          searchQuery={searchQuery}
          onDeleteProject={handleDeleteProject}
        />
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
