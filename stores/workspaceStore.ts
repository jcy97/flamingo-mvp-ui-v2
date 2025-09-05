import { atom } from "jotai";
import { workspaceApi } from "@/lib/api";
import { projectsAtom } from "./projectStore";
import {
  pagesAtom,
  currentPageIdAtom,
  currentProjectIdAtom,
} from "./pageStore";
import { canvasesAtom, currentCanvasIdAtom } from "./canvasStore";
import { layersAtom, activeLayerIdAtom } from "./layerStore";

const initializePixiLayerGraphics = async (
  get: any,
  set: any,
  canvases: any[],
  layers: any[]
) => {
  try {
    const { createCanvasContainerAtom, createLayerGraphicAtom } = await import(
      "./pixiStore"
    );

    for (const canvas of canvases) {
      await set(createCanvasContainerAtom, {
        pageId: canvas.pageId,
        canvasId: canvas.id,
      });

      const canvasLayers = layers.filter(
        (layer) => layer.canvasId === canvas.id
      );

      for (const layer of canvasLayers) {
        await set(createLayerGraphicAtom, {
          canvasId: canvas.id,
          layerId: layer.id,
          width: canvas.width,
          height: canvas.height,
        });

        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  } catch (error) {
    console.error("Failed to initialize PIXI layer graphics:", error);
  }
};

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

export const workspaceDataAtom = atom<WorkspaceData | null>(null);

export const isWorkspaceLoadingAtom = atom<boolean>(false);

export const workspaceErrorAtom = atom<string | null>(null);

export const loadWorkspaceDataAtom = atom(
  null,
  async (get, set, projectId: string) => {
    set(isWorkspaceLoadingAtom, true);
    set(workspaceErrorAtom, null);

    try {
      const response = await workspaceApi.getWorkspaceData(projectId);

      if (response.success) {
        set(workspaceDataAtom, response.data);
        await set(syncWorkspaceToStoresAtom, response.data);
      } else {
        throw new Error("Failed to load workspace data");
      }
    } catch (error) {
      console.error("Failed to load workspace data:", error);
      set(workspaceErrorAtom, "Failed to load workspace data");
      throw error;
    } finally {
      set(isWorkspaceLoadingAtom, false);
    }
  }
);

export const syncWorkspaceToStoresAtom = atom(
  null,
  async (get, set, workspaceData: WorkspaceData) => {
    try {
      const { project, pages } = workspaceData;

      const transformedPages = pages.map((page) => ({
        id: page.id,
        projectId: project.id,
        name: page.name,
        order: page.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const transformedCanvases = pages.flatMap((page) =>
        page.canvases.map((canvas) => ({
          id: canvas.id,
          pageId: page.id,
          name: canvas.name,
          width: canvas.width,
          height: canvas.height,
          x: canvas.x,
          y: canvas.y,
          scale: canvas.scale,
          order: canvas.order,
          unit: "px" as const,
          backgroundColor: "#ffffff",
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      const transformedLayers = pages.flatMap((page) =>
        page.canvases.flatMap((canvas) =>
          canvas.layers.map((layer) => ({
            id: layer.id,
            canvasId: canvas.id,
            name: layer.name,
            order: layer.order,
            type: "brush" as const,
            blendMode: layer.blend_mode as any,
            opacity: layer.opacity,
            isVisible: layer.visible,
            isLocked: layer.locked,
            data: {
              pixiSprite: null,
              renderTexture: null,
              contentBounds: null,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
      );

      set(currentProjectIdAtom, project.id);
      set(pagesAtom, transformedPages);
      set(canvasesAtom, transformedCanvases);
      set(layersAtom, transformedLayers);

      if (transformedPages.length > 0) {
        set(currentPageIdAtom, transformedPages[0].id);

        const firstPageCanvases = transformedCanvases.filter(
          (canvas) => canvas.pageId === transformedPages[0].id
        );

        if (firstPageCanvases.length > 0) {
          set(currentCanvasIdAtom, firstPageCanvases[0].id);

          const firstCanvasLayers = transformedLayers.filter(
            (layer) => layer.canvasId === firstPageCanvases[0].id
          );

          if (firstCanvasLayers.length > 0) {
            set(activeLayerIdAtom, firstCanvasLayers[0].id);
          }
        }
      }

      await initializePixiLayerGraphics(
        get,
        set,
        transformedCanvases,
        transformedLayers
      );
    } catch (error) {
      console.error("Failed to sync workspace data to stores:", error);
      set(workspaceErrorAtom, "Failed to sync workspace data");
      throw error;
    }
  }
);

export const refreshWorkspaceAtom = atom(null, async (get, set) => {
  const currentProjectId = get(currentProjectIdAtom);
  if (currentProjectId) {
    await set(loadWorkspaceDataAtom, currentProjectId);
  }
});

export const clearWorkspaceAtom = atom(null, (get, set) => {
  set(currentProjectIdAtom, null);
  set(workspaceDataAtom, null);
  set(isWorkspaceLoadingAtom, false);
  set(workspaceErrorAtom, null);
});

export const workspaceStatusAtom = atom((get) => {
  const isLoading = get(isWorkspaceLoadingAtom);
  const error = get(workspaceErrorAtom);
  const workspaceData = get(workspaceDataAtom);

  return {
    isLoading,
    isReady: !isLoading && !error && !!workspaceData,
    error,
  };
});
