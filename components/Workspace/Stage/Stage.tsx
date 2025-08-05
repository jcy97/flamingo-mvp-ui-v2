"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import * as PIXI from "pixi.js";
import { BrushEngine, DrawingPoint as BrushDrawingPoint } from "./BrushEngine";
import { PenEngine, DrawingPoint as PenDrawingPoint } from "./PenEngine";
import {
  EraserEngine,
  DrawingPoint as EraserDrawingPoint,
} from "./EraserEngine";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { eraserSettingsAtom } from "@/stores/eraserStore";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { useCursor } from "@/hooks/useCursor";
import { pixiStateAtom } from "@/stores/pixiStore";
import { currentPageIdAtom } from "@/stores/pageStore";
import { currentCanvasIdAtom } from "@/stores/canvasStore";
import { activeLayerIdAtom } from "@/stores/layerStore";

type DrawingPoint = BrushDrawingPoint | PenDrawingPoint | EraserDrawingPoint;

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const penEngineRef = useRef<PenEngine | null>(null);
  const eraserEngineRef = useRef<EraserEngine | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentLayerRef = useRef<PIXI.Container | null>(null);
  const sharedRenderTextureRef = useRef<PIXI.RenderTexture | null>(null);
  const sharedSpriteRef = useRef<PIXI.Sprite | null>(null);
  const lastPointerEventRef = useRef<PointerEvent | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  const [pixiState, setPixiState] = useAtom(pixiStateAtom);

  const [brushSettings] = useAtom(brushSettingsAtom);
  const [penSettings] = useAtom(penSettingsAtom);
  const [eraserSettings] = useAtom(eraserSettingsAtom);
  const [selectedToolId] = useAtom(selectedToolIdAtom);
  const cursorStyle = useCursor();

  const currentPageId = useAtomValue(currentPageIdAtom);
  const currentCanvasId = useAtomValue(currentCanvasIdAtom);
  const activeLayerId = useAtomValue(activeLayerIdAtom);

  useEffect(() => {
    if (canvasElementRef.current) {
      canvasElementRef.current.style.cursor = cursorStyle;
    }
  }, [cursorStyle]);

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!appRef.current) return { x: 0, y: 0 };
      const canvas = appRef.current.canvas;
      const rect = canvas.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 600 / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const getPressure = useCallback((event: PointerEvent): number => {
    if (event.pointerType === "pen" && event.pressure > 0) {
      return event.pressure;
    }
    if (event.pointerType === "touch" && event.pressure > 0) {
      return event.pressure;
    }
    return Math.random() * 0.3 + 0.5;
  }, []);

  const brushSettingsRef = useRef(brushSettings);
  const penSettingsRef = useRef(penSettings);
  const eraserSettingsRef = useRef(eraserSettings);
  const selectedToolIdRef = useRef(selectedToolId);

  useEffect(() => {
    brushSettingsRef.current = brushSettings;
  }, [brushSettings]);

  useEffect(() => {
    penSettingsRef.current = penSettings;
  }, [penSettings]);

  useEffect(() => {
    eraserSettingsRef.current = eraserSettings;
  }, [eraserSettings]);

  useEffect(() => {
    selectedToolIdRef.current = selectedToolId;
  }, [selectedToolId]);

  useEffect(() => {
    if (brushEngineRef.current && !isDrawingRef.current) {
      const timeoutId = setTimeout(() => {
        if (brushEngineRef.current) {
          brushEngineRef.current.updateSettings(brushSettingsRef.current);
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [brushSettings]);

  useEffect(() => {
    if (penEngineRef.current && !isDrawingRef.current) {
      const timeoutId = setTimeout(() => {
        if (penEngineRef.current) {
          penEngineRef.current.updateSettings(penSettingsRef.current);
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [penSettings]);

  useEffect(() => {
    if (eraserEngineRef.current && !isDrawingRef.current) {
      const timeoutId = setTimeout(() => {
        if (eraserEngineRef.current) {
          eraserEngineRef.current.updateSettings(eraserSettingsRef.current);
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [eraserSettings]);

  const updateCanvasLayer = useCallback(() => {
    if (!appRef.current || !currentPageId || !currentCanvasId || !activeLayerId)
      return;
    if (currentLayerRef.current) {
      appRef.current.stage.removeChild(currentLayerRef.current);
    }

    if (sharedSpriteRef.current && currentLayerRef.current) {
      currentLayerRef.current.removeChild(sharedSpriteRef.current);
    }

    const drawingLayer =
      pixiState.canvasContainers[currentPageId][currentCanvasId];
    appRef.current.stage.addChild(drawingLayer);
    currentLayerRef.current = drawingLayer;

    sharedRenderTextureRef.current =
      pixiState.layerGraphics[currentCanvasId][activeLayerId].renderTexture!;
    sharedSpriteRef.current =
      pixiState.layerGraphics[currentCanvasId][activeLayerId].pixiSprite!;
    drawingLayer.addChild(sharedSpriteRef.current);

    if (brushEngineRef.current) {
      brushEngineRef.current.setSharedRenderTexture(
        sharedRenderTextureRef.current
      );
    }

    if (penEngineRef.current) {
      penEngineRef.current.setActiveLayer(drawingLayer);
      penEngineRef.current.setSharedRenderTexture(
        sharedRenderTextureRef.current
      );
    }

    if (eraserEngineRef.current) {
      eraserEngineRef.current.setSharedRenderTexture(
        sharedRenderTextureRef.current
      );
    }
  }, [pixiState, currentPageId, currentCanvasId, activeLayerId]);

  useEffect(() => {
    updateCanvasLayer();
  }, [updateCanvasLayer]);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const initApp = async () => {
      try {
        const app = pixiState.app;
        if (!app) return;
        if (!canvasRef.current) return;

        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);

        brushEngineRef.current = new BrushEngine(app, brushSettings);
        penEngineRef.current = new PenEngine(app, penSettings);
        eraserEngineRef.current = new EraserEngine(app, eraserSettings);

        updateCanvasLayer();

        const canvas = app.canvas as HTMLCanvasElement;
        canvasElementRef.current = canvas;
        canvas.style.cursor = cursorStyle;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.touchAction = "none";

        const handlePointerDown = (event: PointerEvent) => {
          event.preventDefault();
          canvas.setPointerCapture(event.pointerId);
          lastPointerEventRef.current = event;
          isDrawingRef.current = true;
          const coords = getCanvasCoordinates(event.clientX, event.clientY);
          const pressure = getPressure(event);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: pressure,
            timestamp: Date.now(),
          };

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.startStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.BRUSH &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.startStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.startStroke(point);
          }
        };

        const handlePointerMove = (event: PointerEvent) => {
          if (!isDrawingRef.current) {
            return;
          }
          event.preventDefault();
          lastPointerEventRef.current = event;
          const coords = getCanvasCoordinates(event.clientX, event.clientY);
          const pressure = getPressure(event);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: pressure,
            timestamp: Date.now(),
          };

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.continueStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.BRUSH &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.continueStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.continueStroke(point);
          }
        };

        const handlePointerUp = (event: PointerEvent) => {
          if (!isDrawingRef.current) return;
          event.preventDefault();
          canvas.releasePointerCapture(event.pointerId);
          isDrawingRef.current = false;

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.endStroke();
          } else if (
            currentTool === ToolbarItemIDs.BRUSH &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.endStroke();
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.endStroke();
          }
        };

        const handlePointerLeave = () => {
          if (isDrawingRef.current) {
            const currentTool = selectedToolIdRef.current;
            if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
              penEngineRef.current.endStroke();
            } else if (
              currentTool === ToolbarItemIDs.BRUSH &&
              brushEngineRef.current
            ) {
              brushEngineRef.current.endStroke();
            } else if (
              currentTool === ToolbarItemIDs.ERASER &&
              eraserEngineRef.current
            ) {
              eraserEngineRef.current.endStroke();
            }
          }
          isDrawingRef.current = false;
        };

        canvas.addEventListener("pointerdown", handlePointerDown, {
          passive: false,
        });
        canvas.addEventListener("pointermove", handlePointerMove, {
          passive: false,
        });
        canvas.addEventListener("pointerup", handlePointerUp, {
          passive: false,
        });
        canvas.addEventListener("pointerleave", handlePointerLeave, {
          passive: false,
        });

        return () => {
          canvas.removeEventListener("pointerdown", handlePointerDown);
          canvas.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("pointerup", handlePointerUp);
          canvas.removeEventListener("pointerleave", handlePointerLeave);
        };
      } catch (error) {
        console.error("Drawing engine initialization failed", error);
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        const canvas = appRef.current.canvas;
        if (brushEngineRef.current) {
          brushEngineRef.current.cleanup();
          brushEngineRef.current = null;
        }
        if (penEngineRef.current) {
          penEngineRef.current.cleanup();
          penEngineRef.current = null;
        }
        if (eraserEngineRef.current) {
          eraserEngineRef.current.cleanup();
          eraserEngineRef.current = null;
        }
        if (sharedSpriteRef.current) {
          sharedSpriteRef.current.destroy();
          sharedSpriteRef.current = null;
        }
        if (sharedRenderTextureRef.current) {
          sharedRenderTextureRef.current.destroy();
          sharedRenderTextureRef.current = null;
        }
        if (canvasRef.current && canvas && canvasRef.current.contains(canvas)) {
          canvasRef.current.removeChild(canvas);
        }
        appRef.current.destroy();
        appRef.current = null;
        canvasElementRef.current = null;
      }
    };
  }, [pixiState.app]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        ref={canvasRef}
        className="border-4 border-gray-300 rounded-lg"
        style={{ width: "800px", height: "600px", backgroundColor: "#f8f8f8" }}
      />
    </div>
  );
}

export default Stage;
