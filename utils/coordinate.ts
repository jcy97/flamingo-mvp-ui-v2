import * as PIXI from "pixi.js";
import React from "react";

export interface ScreenCoordinate {
  x: number;
  y: number;
}

export interface WorldCoordinate {
  x: number;
  y: number;
}

export interface BoundsData {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface DimensionData {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface Point {
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

export function calculateDimensions(bounds: BoundsData): DimensionData {
  const width = Math.abs(bounds.maxX - bounds.minX);
  const height = Math.abs(bounds.maxY - bounds.minY);
  const centerX = bounds.minX + width / 2;
  const centerY = bounds.minY + height / 2;
  return { width, height, centerX, centerY };
}

export function calculateTransformedBounds(
  position: Point,
  scale: { x: number; y: number },
  originalDimensions: DimensionData
): BoundsData {
  const transformedWidth = originalDimensions.width * scale.x;
  const transformedHeight = originalDimensions.height * scale.y;
  return {
    minX: position.x,
    minY: position.y,
    maxX: position.x + transformedWidth,
    maxY: position.y + transformedHeight,
  };
}

export function calculateTransformedCenter(
  position: Point,
  scale: { x: number; y: number },
  originalDimensions: DimensionData
): Point {
  return {
    x: position.x + (originalDimensions.width * scale.x) / 2,
    y: position.y + (originalDimensions.height * scale.y) / 2,
  };
}

export function calculateRotation(center: Point, point: Point): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return angle + 90;
}

export interface CanvasCoordinatesParams {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  appRef: React.RefObject<PIXI.Application | null>;
  viewport: { x: number; y: number; zoom: number };
}

export function getCanvasCoordinates(
  clientX: number,
  clientY: number,
  params: CanvasCoordinatesParams
): { x: number; y: number } {
  if (!params.appRef.current || !params.canvasRef.current)
    return { x: 0, y: 0 };

  const stageRect = params.canvasRef.current.getBoundingClientRect();

  const stageCenterX = stageRect.left + stageRect.width / 2;
  const stageCenterY = stageRect.top + stageRect.height / 2;

  const transformedMouseX =
    (clientX - stageCenterX - params.viewport.x) / params.viewport.zoom;
  const transformedMouseY =
    (clientY - stageCenterY - params.viewport.y) / params.viewport.zoom;

  const canvasCenterX = stageRect.width / 2;
  const canvasCenterY = stageRect.height / 2;

  const scaleX = params.appRef.current.screen.width / stageRect.width;
  const scaleY = params.appRef.current.screen.height / stageRect.height;

  return {
    x: (transformedMouseX + canvasCenterX) * scaleX,
    y: (transformedMouseY + canvasCenterY) * scaleY,
  };
}
