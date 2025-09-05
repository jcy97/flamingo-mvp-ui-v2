import * as PIXI from "pixi.js";
import { BlendMode } from "@/constants/blendModes";
import { BrushSettings } from "@/types/brush";

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

export interface BrushStroke {
  id: string;
  points: BrushPoint[];
  brushSettings: BrushSettings;
  timestamp: number;
  duration: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  renderData?: BrushDabData[];
}

export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
  actualRadius?: number;
  actualOpacity?: number;
  speed?: number;
  direction?: number;
}

export interface BrushDabData {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
  hardness: number;
  roundness: number;
  angle: number;
}

export interface LayerPersistentData {
  brushStrokes: BrushStroke[];
  contentBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface LayerData {
  pixiSprite: PIXI.Sprite | null;
  renderTexture: PIXI.RenderTexture | null;
  contentBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
  persistentData?: LayerPersistentData;
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
