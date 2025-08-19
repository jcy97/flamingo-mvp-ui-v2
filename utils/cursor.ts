export function createToolCursor(size: number, color?: string): string {
  const canvas = document.createElement("canvas");
  const maxSize = Math.min(128, Math.max(8, size));
  const center = maxSize / 2;

  canvas.width = maxSize;
  canvas.height = maxSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "crosshair";

  ctx.clearRect(0, 0, maxSize, maxSize);

  // 바깥쪽 검은색 테두리
  ctx.beginPath();
  ctx.arc(center, center, center - 1, 0, 2 * Math.PI);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 안쪽 흰색 테두리
  ctx.beginPath();
  ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.stroke();

  return `url(${canvas.toDataURL()}) ${center} ${center}, crosshair`;
}

export function getDefaultCursor(): string {
  return "default";
}
