import { api } from "./client";

interface Canvas {
  id: string;
  page_id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface CanvasCreateRequest {
  name: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  order?: number;
}

interface CanvasUpdateRequest {
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
  order?: number;
}

interface CanvasResponse {
  success: boolean;
  data: Canvas;
}

interface CanvasesResponse {
  success: boolean;
  data: Canvas[];
}

export const canvasApi = {
  getCanvases: async (
    projectId: string,
    pageId: string
  ): Promise<CanvasesResponse> => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases`
    );
    return response;
  },

  getCanvas: async (
    projectId: string,
    pageId: string,
    canvasId: string
  ): Promise<CanvasResponse> => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}`
    );
    return response;
  },

  createCanvas: async (
    projectId: string,
    pageId: string,
    canvasData: CanvasCreateRequest
  ): Promise<CanvasResponse> => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases`,
      canvasData
    );
    return response;
  },

  updateCanvas: async (
    projectId: string,
    pageId: string,
    canvasId: string,
    canvasData: CanvasUpdateRequest
  ): Promise<CanvasResponse> => {
    const response = await api.put(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}`,
      canvasData
    );
    return response;
  },

  deleteCanvas: async (
    projectId: string,
    pageId: string,
    canvasId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}`
    );
    return response;
  },
};
