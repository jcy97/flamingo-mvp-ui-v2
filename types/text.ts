export interface TextSettings {
  fontSize: number;
  fontFamily: string;
  fill: string;
  letterSpacing: number;
  lineHeight: number;
  fontWeight:
    | "normal"
    | "bold"
    | "bolder"
    | "lighter"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  fontStyle: "normal" | "italic" | "oblique";
  align: "left" | "center" | "right" | "justify";
  wordWrap: boolean;
  wordWrapWidth: number;
}
