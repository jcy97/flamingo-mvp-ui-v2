import { User } from "@/types/auth";
import { Canvas, SizeUnit } from "@/types/canvas";
import { BlendMode, Layer, LayerType } from "@/types/layer";
import { Page } from "@/types/page";
import { Project } from "@/types/project";

const sampleData = {
  pages: [
    {
      id: "page-001",
      projectId: "proj-webtoon-001",
      name: "페이지 1",
      order: 1,
      createdAt: new Date("2024-01-15T09:00:00Z"),
      updatedAt: new Date("2024-01-20T14:30:00Z"),
    },
  ] as Page[],

  canvases: [
    {
      id: "canvas-001",
      pageId: "page-001",
      name: "캔버스 1",
      order: 1,
      width: 1920,
      height: 1080,
      unit: "px" as SizeUnit,
      backgroundColor: "#FFFFFF",
      createdAt: new Date("2024-01-15T09:15:00Z"),
      updatedAt: new Date("2024-01-20T13:00:00Z"),
    },
  ] as Canvas[],

  layers: [
    {
      id: "layer-001",
      canvasId: "canvas-001",
      name: "레이어 1",
      order: 1,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        pixiSprite: null,
        renderTexture: null,
      },
      createdAt: new Date("2024-01-15T09:30:00Z"),
      updatedAt: new Date("2024-01-15T11:00:00Z"),
    },
  ] as Layer[],
};

export default sampleData;

export const getPagesForProject = (projectId: string) => {
  return sampleData.pages.filter((page) => page.projectId === projectId);
};

export const getCanvasesForPage = (pageId: string) => {
  return sampleData.canvases.filter((canvas) => canvas.pageId === pageId);
};

export const getLayersForCanvas = (canvasId: string) => {
  return sampleData.layers.filter((layer) => layer.canvasId === canvasId);
};

export const getFullProjectStructure = (projectId: string) => {
  const pages = getPagesForProject(projectId);
  return pages.map((page) => ({
    ...page,
    canvases: getCanvasesForPage(page.id).map((canvas) => ({
      ...canvas,
      layers: getLayersForCanvas(canvas.id),
    })),
  }));
};

export const getPageStructure = (pageId: string) => {
  const page = sampleData.pages.find((p) => p.id === pageId);
  if (!page) return null;

  return {
    page,
    canvases: getCanvasesForPage(pageId).map((canvas) => ({
      ...canvas,
      layers: getLayersForCanvas(canvas.id),
    })),
  };
};

export const sampleUsers: User[] = [
  { id: "1", email: "john@example.com", name: "John Doe", role: "Designer" },
  { id: "2", email: "jane@example.com", name: "Jane Smith", role: "Developer" },
  { id: "3", email: "bob@example.com", name: "Bob Johnson", role: "Manager" },
  {
    id: "4",
    email: "alice@example.com",
    name: "Alice Brown",
    role: "Designer",
  },
  {
    id: "5",
    email: "charlie@example.com",
    name: "Charlie Wilson",
    role: "Developer",
  },
  {
    id: "6",
    email: "diana@example.com",
    name: "Diana Davis",
    role: "Product Manager",
  },
  {
    id: "7",
    email: "eve@example.com",
    name: "Eve Miller",
    role: "UX Researcher",
  },
  {
    id: "8",
    email: "frank@example.com",
    name: "Frank Garcia",
    role: "Frontend Developer",
  },
];
