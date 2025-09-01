import { atom } from "jotai";
import { TextSettings } from "@/types/text";

export interface TextTransformState {
  position: { x: number; y: number };
  scale: { x: number; y: number };
}

export const DEFAULT_TEXT_SETTINGS: TextSettings = {
  fontSize: 16,
  fontFamily: "Arial",
  fill: "#000000",
  letterSpacing: 0,
  lineHeight: 1.2,
  fontWeight: "normal",
  fontStyle: "normal",
  align: "left",
  wordWrap: false,
  wordWrapWidth: 400,
};

export const DEFAULT_TEXT_TRANSFORM: TextTransformState = {
  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
};

export const textSettingsAtom = atom<TextSettings>(DEFAULT_TEXT_SETTINGS);

export const textFontSizeAtom = atom(
  (get) => get(textSettingsAtom).fontSize,
  (get, set, newFontSize: number) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, {
      ...currentSettings,
      fontSize: Math.max(1, Math.min(200, newFontSize)),
    });
  }
);

export const textFontFamilyAtom = atom(
  (get) => get(textSettingsAtom).fontFamily,
  (get, set, newFontFamily: string) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, fontFamily: newFontFamily });
  }
);

export const textFillAtom = atom(
  (get) => get(textSettingsAtom).fill,
  (get, set, newFill: string) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, fill: newFill });
  }
);

export const textLetterSpacingAtom = atom(
  (get) => get(textSettingsAtom).letterSpacing,
  (get, set, newLetterSpacing: number) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, {
      ...currentSettings,
      letterSpacing: Math.max(-10, Math.min(50, newLetterSpacing)),
    });
  }
);

export const textLineHeightAtom = atom(
  (get) => get(textSettingsAtom).lineHeight,
  (get, set, newLineHeight: number) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, {
      ...currentSettings,
      lineHeight: Math.max(0.5, Math.min(5, newLineHeight)),
    });
  }
);

export const textFontWeightAtom = atom(
  (get) => get(textSettingsAtom).fontWeight,
  (get, set, newFontWeight: TextSettings["fontWeight"]) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, fontWeight: newFontWeight });
  }
);

export const textFontStyleAtom = atom(
  (get) => get(textSettingsAtom).fontStyle,
  (get, set, newFontStyle: TextSettings["fontStyle"]) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, fontStyle: newFontStyle });
  }
);

export const textAlignAtom = atom(
  (get) => get(textSettingsAtom).align,
  (get, set, newAlign: TextSettings["align"]) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, align: newAlign });
  }
);

export const textWordWrapAtom = atom(
  (get) => get(textSettingsAtom).wordWrap,
  (get, set, newWordWrap: boolean) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, { ...currentSettings, wordWrap: newWordWrap });
  }
);

export const textWordWrapWidthAtom = atom(
  (get) => get(textSettingsAtom).wordWrapWidth,
  (get, set, newWordWrapWidth: number) => {
    const currentSettings = get(textSettingsAtom);
    set(textSettingsAtom, {
      ...currentSettings,
      wordWrapWidth: Math.max(50, Math.min(1000, newWordWrapWidth)),
    });
  }
);

export const textTransformStateAtom = atom<Record<string, TextTransformState>>(
  {}
);

export const getTextTransformAtom = atom((get) => (layerId: string) => {
  const transforms = get(textTransformStateAtom);
  return transforms[layerId] || DEFAULT_TEXT_TRANSFORM;
});

export const setTextTransformAtom = atom(
  null,
  (
    get,
    set,
    {
      layerId,
      transform,
    }: { layerId: string; transform: Partial<TextTransformState> }
  ) => {
    const currentTransforms = get(textTransformStateAtom);
    const currentTransform =
      currentTransforms[layerId] || DEFAULT_TEXT_TRANSFORM;

    set(textTransformStateAtom, {
      ...currentTransforms,
      [layerId]: {
        ...currentTransform,
        ...transform,
      },
    });
  }
);

export const updateTextPositionAtom = atom(
  null,
  (
    get,
    set,
    {
      layerId,
      position,
    }: { layerId: string; position: { x: number; y: number } }
  ) => {
    set(setTextTransformAtom, { layerId, transform: { position } });
  }
);

export const updateTextScaleAtom = atom(
  null,
  (
    get,
    set,
    { layerId, scale }: { layerId: string; scale: { x: number; y: number } }
  ) => {
    set(setTextTransformAtom, { layerId, transform: { scale } });
  }
);
