import { atom } from "jotai";
import { PenSettings, DEFAULT_PEN_SETTINGS } from "@/types/pen";

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
