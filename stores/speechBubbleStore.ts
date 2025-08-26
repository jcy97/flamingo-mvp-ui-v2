import { atom } from "jotai";
import {
  SpeechBubbleSettings,
  DEFAULT_SPEECH_BUBBLE_SETTINGS,
  BubbleStyle,
  TailStyle,
  TailPosition,
} from "@/types/speechBubble";

export const speechBubbleSettingsAtom = atom<SpeechBubbleSettings>(
  DEFAULT_SPEECH_BUBBLE_SETTINGS
);

export const bubbleStyleAtom = atom(
  (get) => get(speechBubbleSettingsAtom).style,
  (get, set, newStyle: BubbleStyle) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, { ...currentSettings, style: newStyle });
  }
);

export const bubbleTextAtom = atom(
  (get) => get(speechBubbleSettingsAtom).text,
  (get, set, newText: string) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, { ...currentSettings, text: newText });
  }
);

export const bubbleFontSizeAtom = atom(
  (get) => get(speechBubbleSettingsAtom).fontSize,
  (get, set, newSize: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      fontSize: Math.max(8, Math.min(72, newSize)),
    });
  }
);

export const bubbleFontFamilyAtom = atom(
  (get) => get(speechBubbleSettingsAtom).fontFamily,
  (get, set, newFamily: string) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      fontFamily: newFamily,
    });
  }
);

export const bubbleTextColorAtom = atom(
  (get) => get(speechBubbleSettingsAtom).textColor,
  (get, set, newColor: string) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, { ...currentSettings, textColor: newColor });
  }
);

export const bubbleBackgroundColorAtom = atom(
  (get) => get(speechBubbleSettingsAtom).backgroundColor,
  (get, set, newColor: string) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      backgroundColor: newColor,
    });
  }
);

export const bubbleBorderColorAtom = atom(
  (get) => get(speechBubbleSettingsAtom).borderColor,
  (get, set, newColor: string) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      borderColor: newColor,
    });
  }
);

export const bubbleBorderWidthAtom = atom(
  (get) => get(speechBubbleSettingsAtom).borderWidth,
  (get, set, newWidth: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      borderWidth: Math.max(0, Math.min(10, newWidth)),
    });
  }
);

export const bubblePaddingAtom = atom(
  (get) => get(speechBubbleSettingsAtom).padding,
  (get, set, newPadding: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      padding: Math.max(5, Math.min(50, newPadding)),
    });
  }
);

export const bubbleWidthAtom = atom(
  (get) => get(speechBubbleSettingsAtom).width,
  (get, set, newWidth: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    const roundedWidth = Math.round(newWidth * 100) / 100;
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      width: Math.max(50, Math.min(500, roundedWidth)),
    });
  }
);

export const bubbleHeightAtom = atom(
  (get) => get(speechBubbleSettingsAtom).height,
  (get, set, newHeight: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    const roundedHeight = Math.round(newHeight * 100) / 100;
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      height: Math.max(30, Math.min(400, roundedHeight)),
    });
  }
);

export const bubbleAutoSizeAtom = atom(
  (get) => get(speechBubbleSettingsAtom).autoSize,
  (get, set, newAutoSize: boolean) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      autoSize: newAutoSize,
    });
  }
);

export const bubbleTailStyleAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailStyle,
  (get, set, newStyle: TailStyle) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, { ...currentSettings, tailStyle: newStyle });
  }
);

export const bubbleTailPositionAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailPosition,
  (get, set, newPosition: TailPosition) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      tailPosition: newPosition,
    });
  }
);

export const bubbleTailLengthAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailLength,
  (get, set, newLength: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      tailLength: Math.max(5, Math.min(200, newLength)),
    });
  }
);

export const bubbleTailWidthAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailWidth,
  (get, set, newWidth: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      tailWidth: Math.max(5, Math.min(50, newWidth)),
    });
  }
);

export const bubbleTailCurveAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailCurve,
  (get, set, newCurve: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      tailCurve: Math.max(0, Math.min(1, newCurve)),
    });
  }
);

export const bubbleTailAngleAtom = atom(
  (get) => get(speechBubbleSettingsAtom).tailAngle,
  (get, set, newAngle: number | undefined) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      tailAngle:
        newAngle !== undefined ? ((newAngle % 360) + 360) % 360 : undefined,
    });
  }
);

export const bubbleCornerRadiusAtom = atom(
  (get) => get(speechBubbleSettingsAtom).cornerRadius,
  (get, set, newRadius: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      cornerRadius: Math.max(0, Math.min(50, newRadius)),
    });
  }
);

export const bubbleOpacityAtom = atom(
  (get) => get(speechBubbleSettingsAtom).opacity,
  (get, set, newOpacity: number) => {
    const currentSettings = get(speechBubbleSettingsAtom);
    set(speechBubbleSettingsAtom, {
      ...currentSettings,
      opacity: Math.max(0, Math.min(1, newOpacity)),
    });
  }
);
