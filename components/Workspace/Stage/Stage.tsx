"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import * as PIXI from "pixi.js";
import { BrushEngine, DrawingPoint as BrushDrawingPoint } from "./BrushEngine";
import { PenEngine, DrawingPoint as PenDrawingPoint } from "./PenEngine";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";

type DrawingPoint = BrushDrawingPoint | PenDrawingPoint;

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const penEngineRef = useRef<PenEngine | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentLayerRef = useRef<PIXI.Container | null>(null);

  const [brushSettings] = useAtom(brushSettingsAtom);
  const [penSettings] = useAtom(penSettingsAtom);
  const [selectedToolId] = useAtom(selectedToolIdAtom);

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

  const brushSettingsRef = useRef(brushSettings);
  const penSettingsRef = useRef(penSettings);
  const selectedToolIdRef = useRef(selectedToolId);

  useEffect(() => {
    brushSettingsRef.current = brushSettings;
  }, [brushSettings]);

  useEffect(() => {
    penSettingsRef.current = penSettings;
  }, [penSettings]);

  useEffect(() => {
    selectedToolIdRef.current = selectedToolId;
  }, [selectedToolId]);

  useEffect(() => {
    if (brushEngineRef.current && !isDrawingRef.current) {
      const settings =
        selectedToolIdRef.current === ToolbarItemIDs.ERASER
          ? { ...brushSettingsRef.current, color: "#FFFFFF" }
          : brushSettingsRef.current;
      const timeoutId = setTimeout(() => {
        if (brushEngineRef.current) {
          brushEngineRef.current.updateSettings(settings);
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [brushSettings, selectedToolId]);

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
    if (!canvasRef.current || appRef.current) return;

    const initApp = async () => {
      try {
        const app = new PIXI.Application();
        await app.init({
          width: 800,
          height: 600,
          backgroundColor: 0xffffff,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!canvasRef.current) return;

        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);

        const drawingLayer = new PIXI.Container();
        app.stage.addChild(drawingLayer);
        currentLayerRef.current = drawingLayer;

        brushEngineRef.current = new BrushEngine(app, brushSettings);
        brushEngineRef.current.setActiveLayer(drawingLayer);

        penEngineRef.current = new PenEngine(app, penSettings);
        penEngineRef.current.setActiveLayer(drawingLayer);

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.cursor = "crosshair";
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const handleMouseDown = (event: MouseEvent) => {
          event.preventDefault();
          isDrawingRef.current = true;
          const coords = getCanvasCoordinates(event.clientX, event.clientY);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: 1.0,
            timestamp: Date.now(),
          };

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.startStroke(point);
          } else if (
            (currentTool === ToolbarItemIDs.BRUSH ||
              currentTool === ToolbarItemIDs.ERASER) &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.startStroke(point);
          }
        };

        const handleMouseMove = (event: MouseEvent) => {
          if (!isDrawingRef.current) {
            return;
          }
          event.preventDefault();
          const coords = getCanvasCoordinates(event.clientX, event.clientY);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: 1.0,
            timestamp: Date.now(),
          };

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.continueStroke(point);
          } else if (
            (currentTool === ToolbarItemIDs.BRUSH ||
              currentTool === ToolbarItemIDs.ERASER) &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.continueStroke(point);
          }
        };

        const handleMouseUp = (event: MouseEvent) => {
          if (!isDrawingRef.current) return;
          event.preventDefault();
          isDrawingRef.current = false;

          const currentTool = selectedToolIdRef.current;
          if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
            penEngineRef.current.endStroke();
          } else if (
            (currentTool === ToolbarItemIDs.BRUSH ||
              currentTool === ToolbarItemIDs.ERASER) &&
            brushEngineRef.current
          ) {
            brushEngineRef.current.endStroke();
          }
        };

        const handleMouseLeave = () => {
          if (isDrawingRef.current) {
            const currentTool = selectedToolIdRef.current;
            if (currentTool === ToolbarItemIDs.PEN && penEngineRef.current) {
              penEngineRef.current.endStroke();
            } else if (
              (currentTool === ToolbarItemIDs.BRUSH ||
                currentTool === ToolbarItemIDs.ERASER) &&
              brushEngineRef.current
            ) {
              brushEngineRef.current.endStroke();
            }
          }
          isDrawingRef.current = false;
        };

        canvas.addEventListener("mousedown", handleMouseDown, {
          passive: false,
        });
        canvas.addEventListener("mousemove", handleMouseMove, {
          passive: false,
        });
        canvas.addEventListener("mouseup", handleMouseUp, { passive: false });
        canvas.addEventListener("mouseleave", handleMouseLeave, {
          passive: false,
        });

        return () => {
          canvas.removeEventListener("mousedown", handleMouseDown);
          canvas.removeEventListener("mousemove", handleMouseMove);
          canvas.removeEventListener("mouseup", handleMouseUp);
          canvas.removeEventListener("mouseleave", handleMouseLeave);
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
        if (canvasRef.current && canvas && canvasRef.current.contains(canvas)) {
          canvasRef.current.removeChild(canvas);
        }
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, []);

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
