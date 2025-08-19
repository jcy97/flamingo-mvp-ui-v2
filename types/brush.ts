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

export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: "ink",
    name: "잉크펜",
    settings: {
      radius: 2,
      opacity: 0.9,
      hardness: 0.9,
      color: "#000000",
      pressureOpacity: 0.3,
      pressureSize: 0.5,
      speedSize: -0.3,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.05,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
    },
  },
  {
    id: "fountain_pen",
    name: "만년필",
    settings: {
      radius: 2.5,
      opacity: 0.95,
      hardness: 1.0,
      color: "#000000",
      pressureOpacity: 0.1,
      pressureSize: 0.9,
      speedSize: -0.4,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.06,
      jitter: 0,
      angle: 0,
      roundness: 0.9,
      dabsPerSecond: 0,
      dabsPerRadius: 2.5,
    },
  },
  {
    id: "pencil",
    name: "연필",
    settings: {
      radius: 1.5,
      opacity: 0.6,
      hardness: 1,
      color: "#000000",
      pressureOpacity: 0.8,
      pressureSize: 0.3,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.15,
      jitter: 2,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
    },
  },
  {
    id: "sketch",
    name: "스케치",
    settings: {
      radius: 4,
      opacity: 0.7,
      hardness: 0.3,
      color: "#000000",
      pressureOpacity: 0.6,
      pressureSize: 0.4,
      speedSize: -0.5,
      smudgeLength: 0.05,
      smudgeRadius: 1.0,
      spacing: 0.1,
      jitter: 3,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 1.5,
    },
  },
  {
    id: "airbrush",
    name: "에어브러쉬",
    settings: {
      radius: 30,
      opacity: 0.1,
      hardness: 0.1,
      color: "#000000",
      pressureOpacity: 0.8,
      pressureSize: 0.2,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.02,
      jitter: 5,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
    },
  },
  {
    id: "marker",
    name: "마커",
    settings: {
      radius: 10,
      opacity: 0.7,
      hardness: 0.95,
      color: "#000000",
      pressureOpacity: 0.4,
      pressureSize: 0.1,
      speedSize: 0,
      smudgeLength: 0.05,
      smudgeRadius: 1.0,
      spacing: 0.04,
      jitter: 0,
      angle: 45,
      roundness: 0.7,
      dabsPerSecond: 0,
      dabsPerRadius: 2.5,
    },
  },
  {
    id: "crayon",
    name: "크레용",
    settings: {
      radius: 6,
      opacity: 0.5,
      hardness: 0.8,
      color: "#000000",
      pressureOpacity: 0.8,
      pressureSize: 0.2,
      speedSize: 0,
      smudgeLength: 0.02,
      smudgeRadius: 1.0,
      spacing: 0.2,
      jitter: 5,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 1.2,
    },
  },
  {
    id: "charcoal",
    name: "목탄",
    settings: {
      radius: 8,
      opacity: 0.5,
      hardness: 0.2,
      color: "#000000",
      pressureOpacity: 0.9,
      pressureSize: 0.6,
      speedSize: -0.1,
      smudgeLength: 0.1,
      smudgeRadius: 1.0,
      spacing: 0.2,
      jitter: 15,
      angle: 0,
      roundness: 0.9,
      dabsPerSecond: 0,
      dabsPerRadius: 1.0,
    },
  },
  {
    id: "oil_brush",
    name: "유화",
    settings: {
      radius: 15,
      opacity: 0.8,
      hardness: 0.7,
      color: "#000000",
      pressureOpacity: 0.5,
      pressureSize: 0.4,
      speedSize: 0.1,
      smudgeLength: 0.6,
      smudgeRadius: 1.1,
      spacing: 0.08,
      jitter: 1,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 1.5,
    },
  },
  {
    id: "watercolor",
    name: "수채화",
    settings: {
      radius: 25,
      opacity: 0.3,
      hardness: 0,
      color: "#000000",
      pressureOpacity: 0.6,
      pressureSize: 0.4,
      speedSize: 0.2,
      smudgeLength: 0.3,
      smudgeRadius: 1.0,
      spacing: 0.03,
      jitter: 10,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
    },
  },
  {
    id: "calligraphy",
    name: "캘리그래피",
    settings: {
      radius: 3,
      opacity: 1.0,
      hardness: 1.0,
      color: "#000000",
      pressureOpacity: 0.2,
      pressureSize: 0.8,
      speedSize: -0.2,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.04,
      jitter: 0,
      angle: 30,
      roundness: 0.2,
      dabsPerSecond: 0,
      dabsPerRadius: 3.0,
    },
  },
  {
    id: "smudge",
    name: "스머지",
    settings: {
      radius: 20,
      opacity: 0.7,
      hardness: 0.3,
      color: "#000000",
      pressureOpacity: 0.4,
      pressureSize: 0.2,
      speedSize: 0,
      smudgeLength: 0.8,
      smudgeRadius: 1.2,
      spacing: 0.05,
      jitter: 0,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 2.0,
    },
  },
  {
    id: "dry_brush",
    name: "마른 붓",
    settings: {
      radius: 12,
      opacity: 0.4,
      hardness: 0.9,
      color: "#000000",
      pressureOpacity: 0.7,
      pressureSize: 0.2,
      speedSize: 0.1,
      smudgeLength: 0.2,
      smudgeRadius: 1.0,
      spacing: 0.25,
      jitter: 8,
      angle: 0,
      roundness: 0.8,
      dabsPerSecond: 0,
      dabsPerRadius: 1.0,
    },
  },
  {
    id: "wet_sponge",
    name: "젖은 스펀지",
    settings: {
      radius: 45,
      opacity: 0.6,
      hardness: 0.4,
      color: "#000000",
      pressureOpacity: 0.4,
      pressureSize: 0.1,
      speedSize: 0,
      smudgeLength: 0.7,
      smudgeRadius: 1.1,
      spacing: 0.4,
      jitter: 50,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 0.8,
    },
  },
  {
    id: "glitter",
    name: "반짝이",
    settings: {
      radius: 15,
      opacity: 0.8,
      hardness: 0.9,
      color: "#000000",
      pressureOpacity: 0,
      pressureSize: 0.7,
      speedSize: 0,
      smudgeLength: 0,
      smudgeRadius: 1.0,
      spacing: 0.9,
      jitter: 100,
      angle: 0,
      roundness: 1,
      dabsPerSecond: 0,
      dabsPerRadius: 0.2,
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
