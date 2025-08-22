export interface BrushSettings {
  radius: number;
  opacity: number;
  hardness: number;
  color: string;
  pressureOpacity: number;
  pressureSize: number;
  speedSize: number;
  smudgeLength: number;
  smudgeRadius: number;
  spacing: number;
  jitter: number;
  angle: number;
  roundness: number;
  dabsPerSecond: number;
  dabsPerRadius: number;
  speedOpacity: number;
  randomRadius: number;
  strokeThreshold: number;
  strokeDuration: number;
  slowTracking: number;
  slowTrackingPerDab: number;
  colorMixing: number;
  eraser: number;
  lockAlpha: number;
  colorizeMode: number;
  snapToPixel: number;
}

export interface BrushPreset {
  id: string;
  name: string;
  settings: BrushSettings;
}

export interface BrushState {
  x: number;
  y: number;
  pressure: number;
  actualX: number;
  actualY: number;
  dx: number;
  dy: number;
  speed: number;
  direction: number;
  distance: number;
  time: number;
  strokeTime: number;
  dabCount: number;
  smudgeColor: { r: number; g: number; b: number; a: number };
  lastSmudgeX: number;
  lastSmudgeY: number;
  stroke: number;
  customInput: number;
  actualRadius: number;
  actualOpacity: number;
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

function logarithmicToLinear(logValue: number): number {
  return Math.exp(logValue * Math.LN2) * 2;
}

export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: "pen",
    name: "펜",
    settings: {
      radius: logarithmicToLinear(0.96),
      opacity: 1.0,
      hardness: 0.9,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.045,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.2,
      speedOpacity: -0.09,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0.65,
      slowTrackingPerDab: 0.8,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "pencil",
    name: "연필",
    settings: {
      radius: logarithmicToLinear(0.2),
      opacity: 0.8,
      hardness: 0.1,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 1,
      jitter: 50,
      angle: 70,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 1.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 1.0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "brush",
    name: "브러쉬",
    settings: {
      radius: logarithmicToLinear(1.01),
      opacity: 1.0,
      hardness: 0.89,
      color: "#000000",
      pressureOpacity: 0.99,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.017,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 70.0,
      dabsPerRadius: 5.82,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 4.47,
      slowTrackingPerDab: 2.48,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "angled_round_brush",
    name: "라운드",
    settings: {
      radius: logarithmicToLinear(3.3),
      opacity: 0.05,
      hardness: 0.2,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 10.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0.08,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "modelling",
    name: "모델링",
    settings: {
      radius: logarithmicToLinear(1.1),
      opacity: 0.2,
      hardness: 0.71,
      color: "#000000",
      pressureOpacity: 0.52,
      pressureSize: 0.8,
      speedSize: 0.8,
      smudgeLength: 0.3,
      smudgeRadius: 1.0,
      spacing: 0.1,
      jitter: 0,
      angle: 90,
      roundness: 1.0,
      dabsPerSecond: 0,
      dabsPerRadius: 4.02,
      speedOpacity: 0.4,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 0.25,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },

  {
    id: "charcoal",
    name: "목탄",
    settings: {
      radius: logarithmicToLinear(0.7),
      opacity: 0.4,
      hardness: 0.2,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 10,
      jitter: 50,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 3.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 2.0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "marker",
    name: "마커",
    settings: {
      radius: logarithmicToLinear(2.48),
      opacity: 1.0,
      hardness: 1.0,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0,
      jitter: 0,
      angle: 113.08,
      roundness: 0.1,
      dabsPerSecond: 0,
      dabsPerRadius: 10.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 3.0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "airbrush",
    name: "에어브러쉬",
    settings: {
      radius: logarithmicToLinear(3.59),
      opacity: 1.38,
      hardness: 0.19,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.05,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "calligraphy",
    name: "캘리그래피",
    settings: {
      radius: logarithmicToLinear(2.02),
      opacity: 1.0,
      hardness: 0.74,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0.5,
      smudgeRadius: 1.0,
      spacing: 0,
      jitter: 0,
      angle: 45.92,
      roundness: 0.183,
      dabsPerSecond: 0,
      dabsPerRadius: 10.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0.65,
      slowTrackingPerDab: 0.8,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "smudge",
    name: "스머지",
    settings: {
      radius: logarithmicToLinear(1.6),
      opacity: 1.0,
      hardness: 0.2,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0.35,
      smudgeRadius: 1.0,
      spacing: 0.05,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
      speedOpacity: -0.07,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 1.0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "watercolor",
    name: "수채화",
    settings: {
      radius: logarithmicToLinear(2.0),
      opacity: 0.35,
      hardness: 0.05,
      color: "#000000",
      pressureOpacity: 1.2,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0.1,
      smudgeRadius: 1.0,
      spacing: 0.04,
      jitter: 10,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 5.0,
      speedOpacity: 0.4,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 1.0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },

  {
    id: "oil_brush",
    name: "유화",
    settings: {
      radius: logarithmicToLinear(3.15),
      opacity: 1.0,
      hardness: 0.75,
      color: "#000000",
      pressureOpacity: 0.8,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0.35,
      smudgeRadius: 1.0,
      spacing: 0.08,
      jitter: 1.5,
      angle: 0,
      roundness: 0.2,
      dabsPerSecond: 0,
      dabsPerRadius: 5.51,
      speedOpacity: -0.06,
      randomRadius: 0.2,
      strokeDuration: 5.5,
      slowTracking: 3.5,
      slowTrackingPerDab: 0,
      strokeThreshold: 0,
      colorMixing: 1.0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "ink",
    name: "잉크",
    settings: {
      radius: logarithmicToLinear(0.96),
      opacity: 1.0,
      hardness: 0.61,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.016,
      jitter: 1.4,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 6.0,
      speedOpacity: 0.2,
      randomRadius: 0.1,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 2.0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "dry_brush",
    name: "마른 붓",
    settings: {
      radius: logarithmicToLinear(0.6),
      opacity: 0.25,
      hardness: 1,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.02,
      jitter: 210,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 80,
      dabsPerRadius: 25.0,
      speedOpacity: 0,
      randomRadius: 0.8,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "impressionism",
    name: "인상파",
    settings: {
      radius: logarithmicToLinear(2.0),
      opacity: 1.0,
      hardness: 0.8,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.016,
      jitter: 6,
      angle: 0,
      roundness: 0.14,
      dabsPerSecond: 80.0,
      dabsPerRadius: 6.0,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 6.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 0.9,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
  {
    id: "knife",
    name: "나이프",
    settings: {
      radius: logarithmicToLinear(2.9),
      opacity: 1.0,
      hardness: 0.8,
      color: "#000000",
      pressureOpacity: 1.0,
      pressureSize: 1.0,
      speedSize: 0,
      smudgeLength: 0.26,
      smudgeRadius: 1.0,
      spacing: 0.017,
      jitter: 0,
      angle: 90,
      roundness: 0.153,
      dabsPerSecond: 0,
      dabsPerRadius: 5.75,
      speedOpacity: 0,
      randomRadius: 0,
      strokeThreshold: 0,
      strokeDuration: 4.0,
      slowTracking: 0,
      slowTrackingPerDab: 0,
      colorMixing: 0,
      eraser: 0,
      lockAlpha: 0,
      colorizeMode: 0,
      snapToPixel: 0,
    },
  },
];

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = BRUSH_PRESETS[0].settings;

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
  {
    id: "pastel",
    name: "파스텔",
    colors: [
      "#A8E6CF",
      "#DCEDC1",
      "#FFD3B6",
      "#FFAAA5",
      "#FF8B94",
      "#E6E6FA",
      "#D8BFD8",
      "#B0E0E6",
      "#ADD8E6",
      "#F0E68C",
      "#FFE4B5",
      "#F5DEB3",
    ],
  },
];
