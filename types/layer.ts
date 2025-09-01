import * as PIXI from "pixi.js";
import { BlendMode } from "@/constants/blendModes";

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

export type LayerType = "brush" | "text" | "shape" | "image" | "speechBubble";

export interface LayerData {
  pixiSprite: PIXI.Sprite | null;
  renderTexture: PIXI.RenderTexture | null;
  contentBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
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
