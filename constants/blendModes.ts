export type BlendMode =
  | "normal"
  | "add"
  | "screen"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "linear-burn"
  | "linear-dodge"
  | "linear-light"
  | "hard-light"
  | "soft-light"
  | "pin-light"
  | "difference"
  | "exclusion"
  | "overlay"
  | "saturation"
  | "color"
  | "luminosity"
  | "add-npm"
  | "subtract"
  | "divide"
  | "vivid-light"
  | "hard-mix"
  | "negation"
  | "multiply";

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "add",
  "screen",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "linear-burn",
  "linear-dodge",
  "linear-light",
  "hard-light",
  "soft-light",
  "pin-light",
  "difference",
  "exclusion",
  "overlay",
  "saturation",
  "color",
  "luminosity",
  "add-npm",
  "subtract",
  "divide",
  "vivid-light",
  "hard-mix",
  "negation",
  "multiply",
];

export const formatBlendModeName = (mode: BlendMode): string => {
  return mode
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
