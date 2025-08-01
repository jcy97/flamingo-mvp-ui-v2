import { atom } from "jotai";
import { EraserSettings, DEFAULT_ERASER_SETTINGS } from "@/types/eraser";

export const eraserSettingsAtom = atom<EraserSettings>(DEFAULT_ERASER_SETTINGS);

export const eraserSizeAtom = atom(
  (get) => get(eraserSettingsAtom).size,
  (get, set, newSize: number) => {
    const currentSettings = get(eraserSettingsAtom);
    set(eraserSettingsAtom, {
      ...currentSettings,
      size: Math.max(1, Math.min(200, newSize)),
    });
  }
);

export const eraserOpacityAtom = atom(
  (get) => get(eraserSettingsAtom).opacity,
  (get, set, newOpacity: number) => {
    const currentSettings = get(eraserSettingsAtom);
    set(eraserSettingsAtom, {
      ...currentSettings,
      opacity: Math.max(0, Math.min(1, newOpacity)),
    });
  }
);

export const eraserHardnessAtom = atom(
  (get) => get(eraserSettingsAtom).hardness,
  (get, set, newHardness: number) => {
    const currentSettings = get(eraserSettingsAtom);
    set(eraserSettingsAtom, {
      ...currentSettings,
      hardness: Math.max(0, Math.min(1, newHardness)),
    });
  }
);
