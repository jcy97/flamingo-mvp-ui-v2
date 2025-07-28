"use client";

import { useState } from "react";
import { projectApi } from "@/lib/api";
import { showToast } from "@/utils/toast";
import { Project } from "@/types/project";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

function CreateProjectModal({
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!projectName.trim()) return;

    setIsLoading(true);
    try {
      const response = await projectApi.createProject({
        name: projectName.trim(),
      });

      onCreateProject(response.project);
      showToast.success("프로젝트가 생성되었습니다.");
      onClose();
    } catch (error: any) {
      showToast.error(error.message || "프로젝트 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          프로젝트 이름
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="프로젝트 이름을 입력하세요"
          disabled={isLoading}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500 disabled:opacity-50"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-neutral-400 hover:text-neutral-100 transition-colors disabled:opacity-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={!projectName.trim() || isLoading}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-600 disabled:cursor-not-allowed text-neutral-0 rounded-lg transition-colors"
        >
          {isLoading ? "생성 중..." : "생성"}
        </button>
      </div>
    </div>
  );
}

export default CreateProjectModal;
