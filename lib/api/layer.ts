import { api } from "./client";

interface Layer {
  id: string;
  canvas_id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blend_mode: string;
  order_index: number;
  layer_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface LayerCreateRequest {
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blend_mode?: string;
  order?: number;
  layer_data?: Record<string, any>;
}

interface LayerUpdateRequest {
  name?: string;
  type?: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blend_mode?: string;
  order?: number;
  layer_data?: Record<string, any>;
}

interface LayerResponse {
  success: boolean;
  data: Layer;
}

interface LayersResponse {
  success: boolean;
  data: Layer[];
}

export const layerApi = {
  getLayers: async (
    projectId: string,
    pageId: string,
    canvasId: string
  ): Promise<LayersResponse> => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}/layers`
    );
    return response;
  },

  getLayer: async (
    projectId: string,
    pageId: string,
    canvasId: string,
    layerId: string
  ): Promise<LayerResponse> => {
    const response = await api.get(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}/layers/${layerId}`
    );
    return response;
  },

  createLayer: async (
    projectId: string,
    pageId: string,
    canvasId: string,
    layerData: LayerCreateRequest
  ): Promise<LayerResponse> => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}/layers`,
      layerData
    );
    return response;
  },

  updateLayer: async (
    projectId: string,
    pageId: string,
    canvasId: string,
    layerId: string,
    layerData: LayerUpdateRequest
  ): Promise<LayerResponse> => {
    const response = await api.put(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}/layers/${layerId}`,
      layerData
    );
    return response;
  },

  deleteLayer: async (
    projectId: string,
    pageId: string,
    canvasId: string,
    layerId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(
      `/api/v1/projects/${projectId}/pages/${pageId}/canvases/${canvasId}/layers/${layerId}`
    );
    return response;
  },
};
