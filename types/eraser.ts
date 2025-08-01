export interface EraserSettings {
  size: number;
  opacity: number;
  hardness: number;
  pressure: boolean;
}

export const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  size: 20,
  opacity: 1,
  hardness: 0.8,
  pressure: false,
};
