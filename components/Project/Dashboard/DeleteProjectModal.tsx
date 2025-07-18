"use client";

import { Project } from "@/types/project";

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
  const handleDelete = () => {
    onDeleteProject(project.id);
    onClose();
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
          className="px-4 py-2 text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-neutral-0 rounded-lg transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default DeleteProjectModal;
