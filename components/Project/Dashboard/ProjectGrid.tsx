import { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  searchQuery: string;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (project: Project) => void;
}

function ProjectGrid({
  projects,
  searchQuery,
  onDeleteProject,
  onUpdateProject,
}: ProjectGridProps) {
  const filteredProjects = (projects || []).filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-neutral-700 rounded-full flex items-center justify-center mb-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className="text-neutral-400"
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
        <h3 className="text-lg font-semibold text-neutral-300 mb-2">
          {searchQuery ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
        </h3>
        <p className="text-neutral-500 text-center max-w-md">
          {searchQuery
            ? "다른 검색어로 시도해보세요"
            : "새 프로젝트를 만들어 시작해보세요"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {filteredProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDeleteProject}
          onUpdate={onUpdateProject}
        />
      ))}
    </div>
  );
}

export default ProjectGrid;
