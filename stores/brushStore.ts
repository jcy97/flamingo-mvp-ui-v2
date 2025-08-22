import { atom } from "jotai";
import {
  BrushSettings,
  BrushPreset,
  DEFAULT_BRUSH_SETTINGS,
  ColorPickerState,
  BRUSH_PRESETS,
} from "@/types/brush";

export const brushSettingsAtom = atom<BrushSettings>(DEFAULT_BRUSH_SETTINGS);

export const currentBrushPresetAtom = atom<string>("pen");

export const brushRadiusAtom = atom(
  (get) => get(brushSettingsAtom).radius,
  (get, set, newRadius: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      radius: Math.max(0.5, Math.min(100, newRadius)),
    });
  }
);

export const brushColorAtom = atom(
  (get) => get(brushSettingsAtom).color,
  (get, set, newColor: string) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, { ...currentSettings, color: newColor });
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

export const brushPressureOpacityAtom = atom(
  (get) => get(brushSettingsAtom).pressureOpacity,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      pressureOpacity: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushPressureSizeAtom = atom(
  (get) => get(brushSettingsAtom).pressureSize,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      pressureSize: Math.max(-2, Math.min(2, newValue)),
    });
  }
);

export const brushSpeedSizeAtom = atom(
  (get) => get(brushSettingsAtom).speedSize,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      speedSize: Math.max(-1, Math.min(1, newValue)),
    });
  }
);

export const brushSmudgeLengthAtom = atom(
  (get) => get(brushSettingsAtom).smudgeLength,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      smudgeLength: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushSmudgeRadiusAtom = atom(
  (get) => get(brushSettingsAtom).smudgeRadius,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      smudgeRadius: Math.max(0.5, Math.min(2, newValue)),
    });
  }
);

export const brushSpacingAtom = atom(
  (get) => get(brushSettingsAtom).spacing,
  (get, set, newSpacing: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      spacing: Math.max(0.01, Math.min(1, newSpacing)),
    });
  }
);

export const brushJitterAtom = atom(
  (get) => get(brushSettingsAtom).jitter,
  (get, set, newJitter: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      jitter: Math.max(0, Math.min(100, newJitter)),
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

export const brushDabsPerSecondAtom = atom(
  (get) => get(brushSettingsAtom).dabsPerSecond,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      dabsPerSecond: Math.max(0, Math.min(200, newValue)),
    });
  }
);

export const brushDabsPerRadiusAtom = atom(
  (get) => get(brushSettingsAtom).dabsPerRadius,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      dabsPerRadius: Math.max(0, Math.min(50, newValue)),
    });
  }
);

export const brushSpeedOpacityAtom = atom(
  (get) => get(brushSettingsAtom).speedOpacity,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      speedOpacity: Math.max(-1, Math.min(1, newValue)),
    });
  }
);

export const brushRandomRadiusAtom = atom(
  (get) => get(brushSettingsAtom).randomRadius,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      randomRadius: Math.max(0, Math.min(2, newValue)),
    });
  }
);

export const brushStrokeThresholdAtom = atom(
  (get) => get(brushSettingsAtom).strokeThreshold,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      strokeThreshold: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushStrokeDurationAtom = atom(
  (get) => get(brushSettingsAtom).strokeDuration,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      strokeDuration: Math.max(0, Math.min(10, newValue)),
    });
  }
);

export const brushSlowTrackingAtom = atom(
  (get) => get(brushSettingsAtom).slowTracking,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      slowTracking: Math.max(0, Math.min(10, newValue)),
    });
  }
);

export const brushSlowTrackingPerDabAtom = atom(
  (get) => get(brushSettingsAtom).slowTrackingPerDab,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      slowTrackingPerDab: Math.max(0, Math.min(10, newValue)),
    });
  }
);

export const brushColorMixingAtom = atom(
  (get) => get(brushSettingsAtom).colorMixing,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      colorMixing: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushEraserAtom = atom(
  (get) => get(brushSettingsAtom).eraser,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      eraser: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushLockAlphaAtom = atom(
  (get) => get(brushSettingsAtom).lockAlpha,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      lockAlpha: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushColorizeModeAtom = atom(
  (get) => get(brushSettingsAtom).colorizeMode,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      colorizeMode: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const brushSnapToPixelAtom = atom(
  (get) => get(brushSettingsAtom).snapToPixel,
  (get, set, newValue: number) => {
    const currentSettings = get(brushSettingsAtom);
    set(brushSettingsAtom, {
      ...currentSettings,
      snapToPixel: Math.max(0, Math.min(1, newValue)),
    });
  }
);

export const applyBrushPresetAtom = atom(null, (get, set, presetId: string) => {
  const preset = BRUSH_PRESETS.find((p) => p.id === presetId);
  if (preset) {
    set(brushSettingsAtom, { ...preset.settings });
    set(currentBrushPresetAtom, presetId);
  }
});

export const colorPickerStateAtom = atom<ColorPickerState>({
  isOpen: false,
  x: 0,
  y: 0,
  anchorEl: null,
});

export const brushPreviewSizeAtom = atom((get) => {
  const radius = get(brushRadiusAtom);
  return Math.min(radius * 2, 60);
});

export const recentColorsAtom = atom<string[]>([]);

export const addRecentColorAtom = atom(null, (get, set, color: string) => {
  const currentColors = get(recentColorsAtom);
  const newColors = [color, ...currentColors.filter((c) => c !== color)].slice(
    0,
    16
  );
  set(recentColorsAtom, newColors);
});
