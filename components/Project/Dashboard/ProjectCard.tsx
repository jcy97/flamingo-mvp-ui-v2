"use client";

import { Project } from "@/types/project";
import { projectApi } from "@/lib/api";
import { showToast } from "@/utils/toast";
import { Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Tooltip from "./Tooltip";

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onUpdate: (project: Project) => void;
}

function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditName(project.name);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(project.id);
  };

  const handleEditSubmit = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditName(project.name);
      setIsEditing(false);
      return;
    }

    if (trimmedName === project.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await projectApi.updateProject(project.id, {
        name: trimmedName,
      });
      onUpdate(response.data);
      showToast.success("프로젝트 이름이 수정되었습니다.");
    } catch (error: any) {
      showToast.error(error.message || "프로젝트 수정에 실패했습니다.");
      setEditName(project.name);
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isUpdating) {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setEditName(project.name);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="block bg-neutral-800 border border-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-700 hover:border-primary-500 hover:border-2 transition-colors">
          <div className="aspect-[4/3] bg-neutral-700 relative overflow-hidden">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-600 to-neutral-700">
                <div className="w-16 h-16 bg-neutral-500 rounded-lg flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-neutral-300"
                  >
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              disabled={isUpdating}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-100 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <p className="text-sm text-neutral-400 mt-2">
              {project.updated_at
                ? `수정됨: ${formatDate(project.updated_at)}`
                : project.created_at
                ? `생성됨: ${formatDate(project.created_at)}`
                : "최근 활동 없음"}
            </p>
          </div>
        </div>
      ) : (
        <Link
          href={`/workspace?projectId=${project.id}`}
          className="block bg-neutral-800 border border-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-700 hover:border-primary-500 hover:border-2 transition-colors"
        >
          <div className="aspect-[4/3] bg-neutral-700 relative overflow-hidden">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-600 to-neutral-700">
                <div className="w-16 h-16 bg-neutral-500 rounded-lg flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-neutral-300"
                  >
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <Tooltip content={project.name}>
              <h3 className="font-semibold text-neutral-100 mb-2 truncate cursor-pointer">
                {project.name}
              </h3>
            </Tooltip>
            <p className="text-sm text-neutral-400">
              {project.updated_at
                ? `수정됨: ${formatDate(project.updated_at)}`
                : project.created_at
                ? `생성됨: ${formatDate(project.created_at)}`
                : "최근 활동 없음"}
            </p>
          </div>
        </Link>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleEditClick}
          disabled={isUpdating}
          className="p-2 bg-neutral-900 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all disabled:opacity-50"
        >
          <Edit2
            size={16}
            className="text-neutral-300 hover:text-neutral-100"
          />
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isUpdating}
          className="p-2 bg-neutral-900 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all disabled:opacity-50"
        >
          <Trash2 size={16} className="text-red-400 hover:text-red-300" />
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
