export interface SpeechBubbleSettings {
  style: BubbleStyle;
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  padding: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  autoSize: boolean;
  tailStyle: TailStyle;
  tailPosition: TailPosition;
  tailLength: number;
  tailWidth: number;
  tailCurve: number;
  cornerRadius: number;
  opacity: number;
}

export type BubbleStyle =
  | "speech"
  | "thought"
  | "shout"
  | "whisper"
  | "rectangle"
  | "ellipse"
  | "cloud"
  | "jagged";

export type TailStyle =
  | "pointed"
  | "curved"
  | "wavy"
  | "none"
  | "double"
  | "bubble";

export type TailPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right"
  | "left"
  | "right";

export interface BubblePoint {
  x: number;
  y: number;
}

export interface BubbleTail {
  start: BubblePoint;
  end: BubblePoint;
  control1?: BubblePoint;
  control2?: BubblePoint;
  style: TailStyle;
}

export interface BubbleShape {
  points: BubblePoint[];
  type: BubbleStyle;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SpeechBubbleData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layerId?: string | null;
  settings: SpeechBubbleSettings;
}

export const DEFAULT_SPEECH_BUBBLE_SETTINGS: SpeechBubbleSettings = {
  style: "speech",
  text: "",
  fontSize: 16,
  fontFamily: "Arial",
  textColor: "#000000",
  backgroundColor: "#FFFFFF",
  borderColor: "#000000",
  borderWidth: 2,
  padding: 20,
  width: 200,
  height: 100,
  minWidth: 100,
  minHeight: 50,
  autoSize: true,
  tailStyle: "pointed",
  tailPosition: "bottom-center",
  tailLength: 30,
  tailWidth: 20,
  tailCurve: 0.3,
  cornerRadius: 15,
  opacity: 1,
};
