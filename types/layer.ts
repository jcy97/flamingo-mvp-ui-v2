export interface Layer {
  id: string;
  canvasId: string;
  name: string;
  type: LayerType;
  order: number;
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: LayerTransform;
  drawingData: DrawingData;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  collaborationState: CollaborationState;
  metadata: LayerMetadata;
}

export type LayerType =
  | "lineart"
  | "color"
  | "background"
  | "effects"
  | "text"
  | "reference"
  | "sketch";

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

export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

export interface DrawingData {
  strokes: Stroke[];
  imageData?: ImageData;
  vectorData?: VectorData;
  textData?: TextData;
}

export interface Stroke {
  id: string;
  points: Point[];
  brushSettings: BrushSettings;
  timestamp: number;
  userId: string;
  pressure?: number[];
  tilt?: number[];
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  tilt?: number;
}

export interface BrushSettings {
  size: number;
  color: string;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  brushType: BrushType;
  texture?: string;
}

export type BrushType =
  | "pen"
  | "pencil"
  | "marker"
  | "airbrush"
  | "watercolor"
  | "oil"
  | "charcoal"
  | "eraser";

export interface ImageData {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface VectorData {
  paths: VectorPath[];
  fills: VectorFill[];
  strokes: VectorStroke[];
}

export interface VectorPath {
  id: string;
  d: string;
  fillId?: string;
  strokeId?: string;
}

export interface VectorFill {
  id: string;
  type: "solid" | "gradient" | "pattern";
  color?: string;
  gradient?: Gradient;
  pattern?: string;
}

export interface VectorStroke {
  id: string;
  width: number;
  color: string;
  lineCap: "butt" | "round" | "square";
  lineJoin: "miter" | "round" | "bevel";
  dashArray?: number[];
}

export interface Gradient {
  type: "linear" | "radial";
  stops: GradientStop[];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r?: number;
}

export interface GradientStop {
  offset: number;
  color: string;
  opacity: number;
}

export interface TextData {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  color: string;
  align: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface CollaborationState {
  isBeingEdited: boolean;
  editedBy?: string;
  lastSyncTimestamp: number;
  conflictResolution: ConflictResolution;
}

export type ConflictResolution = "last-write-wins" | "merge" | "manual";

export interface LayerMetadata {
  thumbnailUrl?: string;
  tags: string[];
  notes: string;
  colorProfile?: string;
  resolution: number;
  compression: CompressionSettings;
}

export interface CompressionSettings {
  algorithm: "lz4" | "gzip" | "brotli";
  level: number;
  chunkSize: number;
}

export interface LayerCreateRequest {
  canvasId: string;
  name: string;
  type: LayerType;
  order?: number;
  opacity?: number;
  blendMode?: BlendMode;
}

export interface LayerUpdateRequest {
  name?: string;
  isVisible?: boolean;
  isLocked?: boolean;
  opacity?: number;
  blendMode?: BlendMode;
  order?: number;
  transform?: Partial<LayerTransform>;
  metadata?: Partial<LayerMetadata>;
}
