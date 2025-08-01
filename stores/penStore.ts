import { atom } from "jotai";

export interface PenSettings {
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  pressure: boolean;
}

export const DEFAULT_PEN_SETTINGS: PenSettings = {
  color: "#000000",
  size: 2,
  opacity: 1,
  smoothing: 0.5,
  pressure: false,
};

export const penSettingsAtom = atom<PenSettings>(DEFAULT_PEN_SETTINGS);

export const penColorAtom = atom(
  (get) => get(penSettingsAtom).color,
  (get, set, newColor: string) => {
    const currentSettings = get(penSettingsAtom);
    set(penSettingsAtom, { ...currentSettings, color: newColor });
  }
);

export const penSizeAtom = atom(
  (get) => get(penSettingsAtom).size,
  (get, set, newSize: number) => {
    const currentSettings = get(penSettingsAtom);
    set(penSettingsAtom, {
      ...currentSettings,
      size: Math.max(0.5, Math.min(50, newSize)),
    });
  }
);

export const penOpacityAtom = atom(
  (get) => get(penSettingsAtom).opacity,
  (get, set, newOpacity: number) => {
    const currentSettings = get(penSettingsAtom);
    set(penSettingsAtom, {
      ...currentSettings,
      opacity: Math.max(0, Math.min(1, newOpacity)),
    });
  }
);

export const penSmoothingAtom = atom(
  (get) => get(penSettingsAtom).smoothing,
  (get, set, newSmoothing: number) => {
    const currentSettings = get(penSettingsAtom);
    set(penSettingsAtom, {
      ...currentSettings,
      smoothing: Math.max(0, Math.min(1, newSmoothing)),
    });
  }
);

export const penPressureAtom = atom(
  (get) => get(penSettingsAtom).pressure,
  (get, set, newPressure: boolean) => {
    const currentSettings = get(penSettingsAtom);
    set(penSettingsAtom, { ...currentSettings, pressure: newPressure });
  }
);
