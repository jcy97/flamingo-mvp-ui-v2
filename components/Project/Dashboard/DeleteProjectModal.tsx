"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { projectApi } from "@/lib/api";
import { showToast } from "@/utils/toast";

interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onDeleteProject: (projectId: string) => void;
}

function DeleteProjectModal({
  project,
  onClose,
  onDeleteProject,
}: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await projectApi.deleteProject(project.id);
      onDeleteProject(project.id);
      showToast.success("프로젝트가 삭제되었습니다.");
      onClose();
    } catch (error: any) {
      showToast.error(error.message || "프로젝트 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-neutral-300">
        <span className="font-semibold text-neutral-100">"{project.name}"</span>{" "}
        프로젝트를 정말 삭제하시겠습니까?
      </p>
      <p className="text-sm text-neutral-400">이 작업은 되돌릴 수 없습니다.</p>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-neutral-400 hover:text-neutral-100 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-neutral-0 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}

export default DeleteProjectModal;
