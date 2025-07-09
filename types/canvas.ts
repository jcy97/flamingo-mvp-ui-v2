export interface Canvas {
  id: string;
  pageId: string;
  name: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isLocked: boolean;
  isVisible: boolean;
  layers: string[];
  panelType: PanelType;
  borderStyle: BorderStyle;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  collaborators: string[];
  metadata: CanvasMetadata;
}

export interface CanvasMetadata {
  panelOrder: number;
  speechBubbles: SpeechBubble[];
  soundEffects: SoundEffect[];
  gutterSettings: GutterSettings;
  exportSettings: CanvasExportSettings;
}

export interface SpeechBubble {
  id: string;
  type: "speech" | "thought" | "narration" | "shout";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  tailPosition?: { x: number; y: number };
}

export interface SoundEffect {
  id: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  effect: "normal" | "bold" | "italic" | "outline" | "shadow";
}

export interface GutterSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  color: string;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: "solid" | "dashed" | "dotted" | "none";
  radius: number;
}

export interface CanvasExportSettings {
  includeGutter: boolean;
  includeBorder: boolean;
  backgroundColor: string;
}

export type PanelType =
  | "rectangular"
  | "rounded"
  | "circular"
  | "irregular"
  | "borderless";

export interface CanvasCreateRequest {
  pageId: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  panelType?: PanelType;
  order?: number;
}

export interface CanvasUpdateRequest {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  isLocked?: boolean;
  isVisible?: boolean;
  panelType?: PanelType;
  borderStyle?: Partial<BorderStyle>;
  metadata?: Partial<CanvasMetadata>;
}
