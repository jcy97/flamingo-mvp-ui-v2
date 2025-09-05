import { api } from "./client";

interface WorkspaceData {
  project: {
    id: string;
    name: string;
    description?: string;
    thumbnail?: string;
    created_at: string;
    updated_at: string;
  };
  pages: Array<{
    id: string;
    name: string;
    order: number;
    canvases: Array<{
      id: string;
      name: string;
      width: number;
      height: number;
      x: number;
      y: number;
      scale: number;
      order: number;
      layers: Array<{
        id: string;
        name: string;
        visible: boolean;
        locked: boolean;
        opacity: number;
        blend_mode: string;
        order: number;
        layer_data: Record<string, any>;
      }>;
    }>;
  }>;
}

interface WorkspaceResponse {
  success: boolean;
  data: WorkspaceData;
}

export const workspaceApi = {
  getWorkspaceData: async (projectId: string): Promise<WorkspaceResponse> => {
    const response = await api.get(`/workspace/${projectId}`);
    return response;
  },
};
