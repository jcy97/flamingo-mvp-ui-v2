import * as PIXI from "pixi.js";

export interface Layer {
  id: string;
  canvasId: string;
  name: string;
  order: number;
  type: LayerType;
  blendMode: BlendMode;
  opacity: number;
  isVisible: boolean;
  isLocked: boolean;
  data: LayerData;
  createdAt: Date;
  updatedAt: Date;
}

export type LayerType = "brush" | "text" | "shape" | "image";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "color-dodge"
  | "color-burn"
  | "darken"
  | "lighten"
  | "difference"
  | "exclusion";

export interface LayerData {
  pixiSprite: PIXI.Sprite | null;
  renderTexture: PIXI.RenderTexture | null;
}

export interface Stroke {
  id: string;
  points: Point[];
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type ShapeType = "rectangle" | "circle" | "ellipse" | "line" | "polygon";

export interface ShapeProperties {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // 추가 셰이프별 속성들
  [key: string]: any;
}

export interface LayerCreateRequest {
  canvasId: string;
  name: string;
  type: LayerType;
  order?: number;
  blendMode?: BlendMode;
  opacity?: number;
}

export interface LayerUpdateRequest {
  name?: string;
  order?: number;
  type?: LayerType;
  blendMode?: BlendMode;
  opacity?: number;
  isVisible?: boolean;
  isLocked?: boolean;
  data?: Partial<LayerData>;
}
