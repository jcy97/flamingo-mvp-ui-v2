import * as PIXI from "pixi.js";

export interface ScreenCoordinate {
  x: number;
  y: number;
}

export interface WorldCoordinate {
  x: number;
  y: number;
}

export function worldToScreen(
  app: PIXI.Application,
  worldX: number,
  worldY: number
): ScreenCoordinate {
  const canvas = app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  const scaleX = rect.width / app.screen.width;
  const scaleY = rect.height / app.screen.height;
  const screenX = worldX * scaleX + rect.left;
  const screenY = worldY * scaleY + rect.top;

  return { x: screenX, y: screenY };
}

export function worldToScreenPoint(
  app: PIXI.Application,
  point: WorldCoordinate
): ScreenCoordinate {
  return worldToScreen(app, point.x, point.y);
}

export function getCanvasTransform(app: PIXI.Application) {
  const canvas = app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  return {
    rect,
    scaleX: rect.width / app.screen.width,
    scaleY: rect.height / app.screen.height,
  };
}
