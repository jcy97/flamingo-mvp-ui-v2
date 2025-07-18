"use client";

import { useState } from "react";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreateProject: (name: string) => void;
}

function CreateProjectModal({
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = () => {
    if (projectName.trim()) {
      onCreateProject(projectName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
          className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-500"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={!projectName.trim()}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-600 disabled:cursor-not-allowed text-neutral-0 rounded-lg transition-colors"
        >
          생성
        </button>
      </div>
    </div>
  );
}

export default CreateProjectModal;
