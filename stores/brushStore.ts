import { atom } from "jotai";
import {
  BrushSettings,
  DEFAULT_BRUSH_SETTINGS,
  ColorPickerState,
} from "@/types/brush";

// 브러쉬 설정 atom
export const brushSettingsAtom = atom<BrushSettings>(DEFAULT_BRUSH_SETTINGS);

// 개별 브러쉬 속성 atoms
export const brushColorAtom = atom(
  (get) => get(brushSettingsAtom).color,
  (get, set, newColor: string) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, { ...currentSettings, color: newColor });
  }
);

export const brushSizeAtom = atom(
  (get) => get(brushSettingsAtom).size,
  (get, set, newSize: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      size: Math.max(1, Math.min(200, newSize)),
    });
  }
);

export const brushHardnessAtom = atom(
  (get) => get(brushSettingsAtom).hardness,
  (get, set, newHardness: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      hardness: Math.max(0, Math.min(1, newHardness)),
    });
  }
);

export const brushOpacityAtom = atom(
  (get) => get(brushSettingsAtom).opacity,
  (get, set, newOpacity: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      opacity: Math.max(0, Math.min(1, newOpacity)),
    });
  }
);

export const brushSpacingAtom = atom(
  (get) => get(brushSettingsAtom).spacing,
  (get, set, newSpacing: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      spacing: Math.max(0.01, Math.min(5, newSpacing)),
    });
  }
);

export const brushFlowAtom = atom(
  (get) => get(brushSettingsAtom).flow,
  (get, set, newFlow: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      flow: Math.max(0, Math.min(1, newFlow)),
    });
  }
);

export const brushRoundnessAtom = atom(
  (get) => get(brushSettingsAtom).roundness,
  (get, set, newRoundness: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      roundness: Math.max(0.1, Math.min(1, newRoundness)),
    });
  }
);

export const brushAngleAtom = atom(
  (get) => get(brushSettingsAtom).angle,
  (get, set, newAngle: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, { ...currentSettings, angle: newAngle % 360 });
  }
);

export const brushPressureAtom = atom(
  (get) => get(brushSettingsAtom).pressure,
  (get, set, newPressure: boolean) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, { ...currentSettings, pressure: newPressure });
  }
);

export const brushSmoothingAtom = atom(
  (get) => get(brushSettingsAtom).smoothing,
  (get, set, newSmoothing: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      smoothing: Math.max(0, Math.min(1, newSmoothing)),
    });
  }
);

// 컬러 픽커 상태 atom
export const colorPickerStateAtom = atom<ColorPickerState>({
  isOpen: false,
  x: 0,
  y: 0,
  anchorEl: null,
});

// 브러쉬 미리보기 크기 atom (UI용)
export const brushPreviewSizeAtom = atom((get) => {
  const size = get(brushSizeAtom);
  return Math.min(size, 60); // 미리보기는 최대 60px
});

// 최근 사용한 색상들 atom
export const recentColorsAtom = atom<string[]>([]);

export const addRecentColorAtom = atom(null, (get, set, color: string) => {
  const currentColors = get(recentColorsAtom);
  const newColors = [color, ...currentColors.filter((c) => c !== color)].slice(
    0,
    16
  );
  set(recentColorsAtom, newColors);
});
