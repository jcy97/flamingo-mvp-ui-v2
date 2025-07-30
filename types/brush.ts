export interface BrushSettings {
  color: string;
  size: number;
  hardness: number;
  opacity: number;
  spacing: number;
  flow: number;
  roundness: number;
  angle: number;
  pressure: boolean;
  smoothing: number;
  scatterX: number;
  scatterY: number;
  textureOpacity: number;
  blendMode: string;
}

export interface BrushTexture {
  texture: any;
  sprite: any;
  size: number;
  color: string;
  hardness: number;
  opacity: number;
}

export interface ColorPickerState {
  isOpen: boolean;
  x: number;
  y: number;
  anchorEl: HTMLElement | null;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: string[];
}

export interface BrushStroke {
  points: number[][];
  settings: BrushSettings;
  timestamp: number;
}

export interface PressureSettings {
  size: number;
  opacity: number;
  flow: number;
}

export interface VelocitySettings {
  size: number;
  opacity: number;
}

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  color: "#000000",
  size: 20,
  hardness: 0.8,
  opacity: 1,
  spacing: 0.1,
  flow: 1,
  roundness: 1,
  angle: 0,
  pressure: false,
  smoothing: 0.5,
  scatterX: 0,
  scatterY: 0,
  textureOpacity: 1,
  blendMode: "normal",
};

export const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  {
    id: "basic",
    name: "기본",
    colors: [
      "#000000",
      "#333333",
      "#666666",
      "#999999",
      "#CCCCCC",
      "#FFFFFF",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ],
  },
  {
    id: "warm",
    name: "따뜻한",
    colors: [
      "#FF6B6B",
      "#FFE66D",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#F38BA8",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
    ],
  },
  {
    id: "cool",
    name: "차가운",
    colors: [
      "#2C3E50",
      "#3498DB",
      "#9B59B6",
      "#1ABC9C",
      "#27AE60",
      "#F39C12",
      "#E74C3C",
      "#95A5A6",
      "#34495E",
      "#16A085",
      "#2980B9",
      "#8E44AD",
    ],
  },
];
