export interface PenSettings {
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  pressure: boolean;
}

export interface PenTexture {
  texture: any;
  sprite: any;
  size: number;
  color: string;
  opacity: number;
}

export const DEFAULT_PEN_SETTINGS: PenSettings = {
  color: "#000000",
  size: 2,
  opacity: 1,
  smoothing: 0.3,
  pressure: false,
};
