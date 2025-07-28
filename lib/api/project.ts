import { api } from "./client";
import { Project } from "@/types/project";

interface ProjectCreateRequest {
  name: string;
  description?: string;
}

interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
}

interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}

interface ProjectResponse {
  project: Project;
}

export const projectApi = {
  getProjects: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<ProjectListResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return api.get(`/api/v1/projects?${queryParams.toString()}`);
  },

  getProject: async (projectId: string): Promise<ProjectResponse> => {
    return api.get(`/api/v1/projects/${projectId}`);
  },

  createProject: async (
    data: ProjectCreateRequest
  ): Promise<ProjectResponse> => {
    return api.post("/api/v1/projects", data);
  },

  updateProject: async (
    projectId: string,
    data: ProjectUpdateRequest
  ): Promise<ProjectResponse> => {
    return api.put(`/api/v1/projects/${projectId}`, data);
  },

  deleteProject: async (projectId: string): Promise<{ message: string }> => {
    return api.delete(`/api/v1/projects/${projectId}`);
  },
};
