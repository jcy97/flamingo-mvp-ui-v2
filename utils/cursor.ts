export function createToolCursor(size: number, color?: string): string {
  const canvas = document.createElement("canvas");
  const maxSize = Math.min(128, Math.max(8, size));
  const center = maxSize / 2;

  canvas.width = maxSize;
  canvas.height = maxSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "crosshair";

  const isLightColor = color ? isColorLight(color) : false;
  const strokeColor = isLightColor ? "#000000" : "#FFFFFF";
  const fillColor = "transparent";

  ctx.clearRect(0, 0, maxSize, maxSize);

  ctx.beginPath();
  ctx.arc(center, center, center - 1, 0, 2 * Math.PI);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  return `url(${canvas.toDataURL()}) ${center} ${center}, crosshair`;
}

function isColorLight(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export function getDefaultCursor(): string {
  return "default";
}
