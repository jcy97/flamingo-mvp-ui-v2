import { Project } from "@/types/project";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Link
      href={`/workspace?projectId=${project.id}`}
      className="block bg-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-700 hover:border-primary-500 hover:border-2 transition-colors group"
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
        <h3 className="font-semibold text-neutral-100 mb-2 truncate">
          {project.name}
        </h3>
        <p className="text-sm text-neutral-400">
          {project.updatedAt
            ? `수정됨: ${formatDate(project.updatedAt)}`
            : "최근 활동 없음"}
        </p>
      </div>
    </Link>
  );
}

export default ProjectCard;
