import { Bounds } from "@/types/common";

export const mergeBounds = (
  existing: Bounds | null | undefined,
  newBounds: Bounds
): Bounds => {
  if (!existing || existing.minX === Infinity) {
    // 기존 경계가 없거나 초기값일 경우
    return newBounds;
  }
  return {
    minX: Math.min(existing.minX, newBounds.minX),
    minY: Math.min(existing.minY, newBounds.minY),
    maxX: Math.max(existing.maxX, newBounds.maxX),
    maxY: Math.max(existing.maxY, newBounds.maxY),
  };
};
