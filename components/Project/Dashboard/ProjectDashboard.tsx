"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { projectApi } from "@/lib/api";
import { showToast } from "@/utils/toast";
import DashboardHeader from "./DashboardHeader";
import ProjectGrid from "./ProjectGrid";
import CreateProjectModal from "./CreateProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";

interface Modal {
  type: "create" | "delete" | null;
  data?: any;
}

function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<Modal>({ type: null });

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectApi.getProjects();
      setProjects(Array.isArray(response.projects) ? response.projects : []);
    } catch (error: any) {
      setProjects([]);
      showToast.error(
        error.message || "프로젝트 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = () => {
    setModal({ type: "create" });
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setModal({ type: "delete", data: project });
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...(Array.isArray(prev) ? prev : [])]);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prev) =>
      Array.isArray(prev) ? prev.filter((p) => p.id !== projectId) : []
    );
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((prev) =>
      Array.isArray(prev)
        ? prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        : []
    );
  };

  const closeModal = () => {
    setModal({ type: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DashboardHeader
        onSearch={setSearchQuery}
        onCreateProject={handleCreateProject}
      />

      <ProjectGrid
        projects={projects}
        searchQuery={searchQuery}
        onDeleteProject={handleDeleteProject}
        onUpdateProject={handleProjectUpdated}
      />

      {modal.type === "create" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">
              새 프로젝트 만들기
            </h2>
            <CreateProjectModal
              onClose={closeModal}
              onCreateProject={handleProjectCreated}
            />
          </div>
        </div>
      )}

      {modal.type === "delete" && modal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">
              프로젝트 삭제
            </h2>
            <DeleteProjectModal
              project={modal.data}
              onClose={closeModal}
              onDeleteProject={handleProjectDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDashboard;
