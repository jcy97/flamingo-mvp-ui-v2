import { Canvas, SizeUnit } from "@/types/canvas";
import { BlendMode, Layer, LayerType } from "@/types/layer";
import { Page } from "@/types/page";

// 샘플 데이터 생성
const sampleData = {
  // 메인 페이지 데이터
  page: {
    id: "page-001",
    projectId: "proj-webtoon-001",
    name: "Episode 1 - The Beginning",
    order: 1,
    createdAt: new Date("2024-01-15T09:00:00Z"),
    updatedAt: new Date("2024-01-20T14:30:00Z"),
  } as Page,

  // 캔버스 데이터 (3개의 서로 다른 장면)
  canvases: [
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
  ] as Canvas[],

  // 레이어 데이터 (각 캔버스의 구성 요소들)
  layers: [
    // Canvas 1의 레이어들
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

    // Canvas 2의 레이어들
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
      name: "Furniture",
      order: 2,
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
              { x: 50, y: 300, pressure: 0.7 },
              { x: 250, y: 300, pressure: 0.8 },
              { x: 250, y: 350, pressure: 0.7 },
              { x: 50, y: 350, pressure: 0.6 },
            ],
            brushSize: 2,
            brushColor: "#8B4513",
            brushOpacity: 100,
            timestamp: Date.now() - 2700000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T10:15:00Z"),
      updatedAt: new Date("2024-01-15T10:45:00Z"),
    },
    {
      id: "layer-006",
      canvasId: "canvas-002",
      name: "Character 2",
      order: 3,
      type: "brush" as LayerType,
      blendMode: "normal" as BlendMode,
      opacity: 100,
      isVisible: true,
      isLocked: false,
      data: {
        strokes: [
          {
            id: "stroke-004",
            points: [
              { x: 300, y: 150, pressure: 0.9 },
              { x: 305, y: 145, pressure: 0.8 },
              { x: 310, y: 140, pressure: 0.7 },
            ],
            brushSize: 3,
            brushColor: "#000000",
            brushOpacity: 100,
            timestamp: Date.now() - 2400000,
          },
        ],
      },
      createdAt: new Date("2024-01-15T10:30:00Z"),
      updatedAt: new Date("2024-01-15T11:15:00Z"),
    },
    {
      id: "layer-007",
      canvasId: "canvas-002",
      name: "Text Dialog",
      order: 4,
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

    // Canvas 3의 레이어들
    {
      id: "layer-008",
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
            id: "stroke-005",
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
      id: "layer-009",
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
            id: "stroke-006",
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
    {
      id: "layer-010",
      canvasId: "canvas-003",
      name: "Action Character",
      order: 3,
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
      createdAt: new Date("2024-01-15T12:00:00Z"),
      updatedAt: new Date("2024-01-15T12:30:00Z"),
    },
  ] as Layer[],
};

// 타입 확인을 위한 export
export default sampleData;

// 유틸리티 함수들
export const getCanvasesForPage = (pageId: string) => {
  return sampleData.canvases.filter((canvas) => canvas.pageId === pageId);
};

export const getLayersForCanvas = (canvasId: string) => {
  return sampleData.layers.filter((layer) => layer.canvasId === canvasId);
};

export const getPageStructure = () => {
  return {
    page: sampleData.page,
    canvases: sampleData.canvases.map((canvas) => ({
      ...canvas,
      layers: getLayersForCanvas(canvas.id),
    })),
  };
};

console.log("샘플 데이터 구조:", {
  page: sampleData.page.name,
  canvasCount: sampleData.canvases.length,
  totalLayers: sampleData.layers.length,
  layersByCanvas: sampleData.canvases.map((canvas) => ({
    canvasName: canvas.name,
    layerCount: getLayersForCanvas(canvas.id).length,
  })),
});
