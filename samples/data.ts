import { User } from "@/types/auth";
import { Canvas, SizeUnit } from "@/types/canvas";
import { BlendMode, Layer, LayerType } from "@/types/layer";
import { Page } from "@/types/page";

// 샘플 데이터 생성
const sampleData = {
  // 여러 페이지 데이터
  pages: [
    {
      id: "page-001",
      projectId: "proj-webtoon-001",
      name: "Episode 1 - The Beginning",
      order: 1,
      createdAt: new Date("2024-01-15T09:00:00Z"),
      updatedAt: new Date("2024-01-20T14:30:00Z"),
    },
    {
      id: "page-002",
      projectId: "proj-webtoon-001",
      name: "Episode 2 - The Journey",
      order: 2,
      createdAt: new Date("2024-01-16T10:00:00Z"),
      updatedAt: new Date("2024-01-21T16:00:00Z"),
    },
    {
      id: "page-003",
      projectId: "proj-webtoon-001",
      name: "Episode 3 - The Battle",
      order: 3,
      createdAt: new Date("2024-01-17T11:00:00Z"),
      updatedAt: new Date("2024-01-22T18:00:00Z"),
    },
    {
      id: "page-004",
      projectId: "proj-webtoon-001",
      name: "Episode 3 - The Battle",
      order: 3,
      createdAt: new Date("2024-01-17T11:00:00Z"),
      updatedAt: new Date("2024-01-22T18:00:00Z"),
    },
    {
      id: "page-005",
      projectId: "proj-webtoon-001",
      name: "Episode 3 - The Battle",
      order: 3,
      createdAt: new Date("2024-01-17T11:00:00Z"),
      updatedAt: new Date("2024-01-22T18:00:00Z"),
    },
    {
      id: "page-006",
      projectId: "proj-webtoon-001",
      name: "Episode 3 - The Battle",
      order: 3,
      createdAt: new Date("2024-01-17T11:00:00Z"),
      updatedAt: new Date("2024-01-22T18:00:00Z"),
    },
  ] as Page[],

  // 캔버스 데이터 (각 페이지별로 분배)
  canvases: [
    // Page 1의 캔버스들
    {
      id: "canvas-001",
      pageId: "page-001",
      name: "Opening Scene",
      order: 1,
      width: 800,
      height: 400,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-15T09:15:00Z"),
      updatedAt: new Date("2024-01-20T13:00:00Z"),
    },
    {
      id: "canvas-002",
      pageId: "page-001",
      name: "Character Introduction",
      order: 2,
      width: 800,
      height: 400,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-20T14:15:00Z"),
    },
    {
      id: "canvas-003",
      pageId: "page-001",
      name: "Action Scene",
      order: 3,
      width: 800,
      height: 380,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-15T11:30:00Z"),
      updatedAt: new Date("2024-01-20T14:30:00Z"),
    },

    // Page 2의 캔버스들
    {
      id: "canvas-004",
      pageId: "page-002",
      name: "Journey Begins",
      order: 1,
      width: 800,
      height: 450,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-16T10:15:00Z"),
      updatedAt: new Date("2024-01-21T15:00:00Z"),
    },
    {
      id: "canvas-005",
      pageId: "page-002",
      name: "Meeting Allies",
      order: 2,
      width: 800,
      height: 400,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-16T11:00:00Z"),
      updatedAt: new Date("2024-01-21T16:00:00Z"),
    },

    // Page 3의 캔버스들
    {
      id: "canvas-006",
      pageId: "page-003",
      name: "Battle Preparation",
      order: 1,
      width: 800,
      height: 500,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-17T11:15:00Z"),
      updatedAt: new Date("2024-01-22T17:00:00Z"),
    },
    {
      id: "canvas-007",
      pageId: "page-003",
      name: "Epic Battle",
      order: 2,
      width: 800,
      height: 600,
      unit: "px" as SizeUnit,
      createdAt: new Date("2024-01-17T12:00:00Z"),
      updatedAt: new Date("2024-01-22T18:00:00Z"),
    },
  ] as Canvas[],

  // 레이어 데이터 (각 캔버스의 구성 요소들)
  layers: [
    // Canvas 1의 레이어들 (Page 1)
    {
      id: "layer-001",
      canvasId: "canvas-001",
      name: "Background",
      order: 1,
      type: "image" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        imageUrl: "https://example.com/backgrounds/forest.jpg",
        imageWidth: 800,
        imageHeight: 400,
      },
      createdAt: new Date("2024-01-15T09:15:00Z"),
      updatedAt: new Date("2024-01-15T09:45:00Z"),
    },
    {
      id: "layer-002",
      canvasId: "canvas-001",
      name: "Character Lineart",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-001",
            points: [
              { x: 150, y: 120, pressure: 0.8 },
              { x: 152, y: 118, pressure: 0.9 },
              { x: 155, y: 115, pressure: 0.7 },
            ],
            brushSize: 3,
            brushColor: "#000000",
            brushOpacity: 100,
            timestamp: Date.now() - 3600000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T09:30:00Z"),
      updatedAt: new Date("2024-01-15T11:00:00Z"),
    },
    {
      id: "layer-003",
      canvasId: "canvas-001",
      name: "Character Colors",
      order: 3,
      type: "brush" as LayerType,
      blendMode: "multiply" as BlendMode,
      opacity: 80,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-002",
            points: [
              { x: 148, y: 125, pressure: 0.5 },
              { x: 150, y: 123, pressure: 0.6 },
              { x: 153, y: 120, pressure: 0.4 },
            ],
            brushSize: 15,
            brushColor: "#FF6B6B",
            brushOpacity: 70,
            timestamp: Date.now() - 3000000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T10:15:00Z"),
      updatedAt: new Date("2024-01-15T11:30:00Z"),
    },

    // Canvas 2의 레이어들 (Page 1)
    {
      id: "layer-004",
      canvasId: "canvas-002",
      name: "Indoor Background",
      order: 1,
      type: "shape" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        shapeType: "rectangle",
        shapeProperties: {
          fillColor: "#87CEEB",
          strokeColor: "#F0F8FF",
          strokeWidth: 0,
        },
      },
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
    },
    {
      id: "layer-005",
      canvasId: "canvas-002",
      name: "Text Dialog",
      order: 2,
      type: "text" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        textContent: "여기서 무엇을 해야 할까?",
        fontSize: 16,
        fontFamily: "NotoSansKR",
        textColor: "#000000",
      },
      createdAt: new Date("2024-01-15T11:00:00Z"),
      updatedAt: new Date("2024-01-15T11:30:00Z"),
    },

    // Canvas 3의 레이어들 (Page 1)
    {
      id: "layer-006",
      canvasId: "canvas-003",
      name: "Action Background",
      order: 1,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-003",
            points: [
              { x: 0, y: 0, pressure: 0.6 },
              { x: 800, y: 0, pressure: 0.6 },
              { x: 800, y: 380, pressure: 0.6 },
              { x: 0, y: 380, pressure: 0.6 },
            ],
            brushSize: 50,
            brushColor: "#FF4500",
            brushOpacity: 30,
            timestamp: Date.now() - 1800000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T11:30:00Z"),
      updatedAt: new Date("2024-01-15T12:00:00Z"),
    },
    {
      id: "layer-007",
      canvasId: "canvas-003",
      name: "Action Effects",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "screen" as BlendMode,
      opacity: 90,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-004",
            points: [
              { x: 400, y: 190, pressure: 1.0 },
              { x: 450, y: 140, pressure: 0.8 },
              { x: 500, y: 90, pressure: 0.6 },
            ],
            brushSize: 25,
            brushColor: "#FFFF00",
            brushOpacity: 80,
            timestamp: Date.now() - 1500000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T11:45:00Z"),
      updatedAt: new Date("2024-01-15T12:15:00Z"),
    },

    // Canvas 4의 레이어들 (Page 2)
    {
      id: "layer-008",
      canvasId: "canvas-004",
      name: "Mountain Background",
      order: 1,
      type: "image" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        imageUrl: "https://example.com/backgrounds/mountain.jpg",
        imageWidth: 800,
        imageHeight: 450,
      },
      createdAt: new Date("2024-01-16T10:15:00Z"),
      updatedAt: new Date("2024-01-16T10:45:00Z"),
    },
    {
      id: "layer-009",
      canvasId: "canvas-004",
      name: "Hero Character",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-005",
            points: [
              { x: 200, y: 200, pressure: 0.9 },
              { x: 220, y: 180, pressure: 1.0 },
              { x: 240, y: 160, pressure: 0.8 },
            ],
            brushSize: 4,
            brushColor: "#000000",
            brushOpacity: 100,
            timestamp: Date.now() - 1200000,
          },
        ],
      },
      createdAt: new Date("2024-01-16T10:30:00Z"),
      updatedAt: new Date("2024-01-16T11:00:00Z"),
    },

    // Canvas 5의 레이어들 (Page 2)
    {
      id: "layer-010",
      canvasId: "canvas-005",
      name: "Village Background",
      order: 1,
      type: "shape" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        shapeType: "rectangle",
        shapeProperties: {
          fillColor: "#90EE90",
          strokeColor: "#228B22",
          strokeWidth: 2,
        },
      },
      createdAt: new Date("2024-01-16T11:00:00Z"),
      updatedAt: new Date("2024-01-16T11:30:00Z"),
    },
    {
      id: "layer-011",
      canvasId: "canvas-005",
      name: "Ally Characters",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-006",
            points: [
              { x: 300, y: 150, pressure: 0.7 },
              { x: 320, y: 140, pressure: 0.8 },
              { x: 340, y: 130, pressure: 0.6 },
            ],
            brushSize: 3,
            brushColor: "#0000FF",
            brushOpacity: 100,
            timestamp: Date.now() - 900000,
          },
        ],
      },
      createdAt: new Date("2024-01-16T11:15:00Z"),
      updatedAt: new Date("2024-01-16T11:45:00Z"),
    },

    // Canvas 6의 레이어들 (Page 3)
    {
      id: "layer-012",
      canvasId: "canvas-006",
      name: "Battle Arena",
      order: 1,
      type: "image" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        imageUrl: "https://example.com/backgrounds/arena.jpg",
        imageWidth: 800,
        imageHeight: 500,
      },
      createdAt: new Date("2024-01-17T11:15:00Z"),
      updatedAt: new Date("2024-01-17T11:45:00Z"),
    },
    {
      id: "layer-013",
      canvasId: "canvas-006",
      name: "Warriors",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-007",
            points: [
              { x: 400, y: 250, pressure: 0.9 },
              { x: 420, y: 230, pressure: 1.0 },
              { x: 440, y: 210, pressure: 0.8 },
            ],
            brushSize: 5,
            brushColor: "#8B0000",
            brushOpacity: 100,
            timestamp: Date.now() - 600000,
          },
        ],
      },
      createdAt: new Date("2024-01-17T11:30:00Z"),
      updatedAt: new Date("2024-01-17T12:00:00Z"),
    },

    // Canvas 7의 레이어들 (Page 3)
    {
      id: "layer-014",
      canvasId: "canvas-007",
      name: "Epic Battle Background",
      order: 1,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-008",
            points: [
              { x: 0, y: 0, pressure: 0.8 },
              { x: 800, y: 0, pressure: 0.8 },
              { x: 800, y: 600, pressure: 0.8 },
              { x: 0, y: 600, pressure: 0.8 },
            ],
            brushSize: 60,
            brushColor: "#FF0000",
            brushOpacity: 40,
            timestamp: Date.now() - 300000,
          },
        ],
      },
      createdAt: new Date("2024-01-17T12:00:00Z"),
      updatedAt: new Date("2024-01-17T12:30:00Z"),
    },
    {
      id: "layer-015",
      canvasId: "canvas-007",
      name: "Battle Effects",
      order: 2,
      type: "brush" as LayerType,
      blendMode: "screen" as BlendMode,
      opacity: 95,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-009",
            points: [
              { x: 400, y: 300, pressure: 1.0 },
              { x: 450, y: 250, pressure: 0.9 },
              { x: 500, y: 200, pressure: 0.7 },
            ],
            brushSize: 30,
            brushColor: "#FFFFFF",
            brushOpacity: 90,
            timestamp: Date.now() - 100000,
          },
        ],
      },
      createdAt: new Date("2024-01-17T12:15:00Z"),
      updatedAt: new Date("2024-01-17T12:45:00Z"),
    },
    {
      id: "layer-016",
      canvasId: "canvas-007",
      name: "Victory Text",
      order: 3,
      type: "text" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        textContent: "승리!",
        fontSize: 32,
        fontFamily: "NotoSansKR",
        textColor: "#FFD700",
      },
      createdAt: new Date("2024-01-17T12:30:00Z"),
      updatedAt: new Date("2024-01-17T13:00:00Z"),
    },
  ] as Layer[],
};

// 타입 확인을 위한 export
export default sampleData;

// 유틸리티 함수들
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

console.log("샘플 데이터 구조:", {
  projectId: "proj-webtoon-001",
  pageCount: sampleData.pages.length,
  canvasCount: sampleData.canvases.length,
  totalLayers: sampleData.layers.length,
  pageStructure: sampleData.pages.map((page) => ({
    pageName: page.name,
    canvasCount: getCanvasesForPage(page.id).length,
    layerCount: getCanvasesForPage(page.id).reduce(
      (total, canvas) => total + getLayersForCanvas(canvas.id).length,
      0
    ),
  })),
});

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

export const sampleLayers: Layer[] = [
  {
    id: "1",
    canvasId: "canvas-1",
    name: "Background",
    order: 0,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    canvasId: "canvas-1",
    name: "Shape 1",
    order: 1,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    canvasId: "canvas-1",
    name: "Text Layer",
    order: 2,
    type: "text",
    blendMode: "normal",
    opacity: 0.8,
    isVisible: false,
    isLocked: true,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    canvasId: "canvas-1",
    name: "Button",
    order: 3,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    canvasId: "canvas-1",
    name: "Header Component",
    order: 4,
    type: "text",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    canvasId: "canvas-1",
    name: "Navigation Menu",
    order: 5,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    canvasId: "canvas-1",
    name: "Content Area",
    order: 6,
    type: "brush",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    canvasId: "canvas-1",
    name: "Sidebar Widget",
    order: 7,
    type: "shape",
    blendMode: "normal",
    opacity: 0.9,
    isVisible: false,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    canvasId: "canvas-1",
    name: "Footer Section",
    order: 8,
    type: "text",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: true,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    canvasId: "canvas-1",
    name: "Image Gallery",
    order: 9,
    type: "image",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "11",
    canvasId: "canvas-1",
    name: "Contact Form",
    order: 10,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "12",
    canvasId: "canvas-1",
    name: "Social Icons",
    order: 11,
    type: "image",
    blendMode: "normal",
    opacity: 0.8,
    isVisible: false,
    isLocked: false,
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
