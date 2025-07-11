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
  // 브러시 레이어 데이터
  strokes?: Stroke[];
  // 텍스트 레이어 데이터
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  // 이미지 레이어 데이터
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  // 셰이프 레이어 데이터
  shapeType?: ShapeType;
  shapeProperties?: ShapeProperties;
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
