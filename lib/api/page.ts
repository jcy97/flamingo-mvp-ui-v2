import { api } from "./client";

interface Page {
  id: string;
  project_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface PageCreateRequest {
  name: string;
  order?: number;
}

interface PageUpdateRequest {
  name?: string;
  order?: number;
}

interface PageResponse {
  success: boolean;
  data: Page;
}

interface PagesResponse {
  success: boolean;
  data: Page[];
}

export const pageApi = {
  getPages: async (projectId: string): Promise<PagesResponse> => {
    const response = await api.get(`/api/v1/projects/${projectId}/pages`);
    return response;
  },

  getPage: async (projectId: string, pageId: string): Promise<PageResponse> => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/pages/${pageId}`
    );
    return response;
  },

  createPage: async (
    projectId: string,
    pageData: PageCreateRequest
  ): Promise<PageResponse> => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/pages`,
      pageData
    );
    return response;
  },

  updatePage: async (
    projectId: string,
    pageId: string,
    pageData: PageUpdateRequest
  ): Promise<PageResponse> => {
    const response = await api.put(
      `/api/v1/projects/${projectId}/pages/${pageId}`,
      pageData
    );
    return response;
  },

  deletePage: async (
    projectId: string,
    pageId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(
      `/api/v1/projects/${projectId}/pages/${pageId}`
    );
    return response;
  },
};
