"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import * as PIXI from "pixi.js";
import "pixi.js/advanced-blend-modes";
import { BrushEngine, DrawingPoint as BrushDrawingPoint } from "./BrushEngine";
import { PenEngine, DrawingPoint as PenDrawingPoint } from "./PenEngine";
import {
  EraserEngine,
  DrawingPoint as EraserDrawingPoint,
} from "./EraserEngine";
import { TextEngine, TextPoint } from "./TextEngine";
import {
  SpeechBubbleEngine,
  DrawingPoint as SpeechBubbleDrawingPoint,
} from "./SpeechBubbleEngine";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { eraserSettingsAtom } from "@/stores/eraserStore";
import { textSettingsAtom } from "@/stores/textStore";
import { speechBubbleSettingsAtom } from "@/stores/speechBubbleStore";
import { DEFAULT_SPEECH_BUBBLE_SETTINGS } from "@/types/speechBubble";
import {
  selectedToolIdAtom,
  isTemporaryHandToolAtom,
  isTemporaryZoomInToolAtom,
  isTemporaryZoomOutToolAtom,
} from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { useCursor } from "@/hooks/useCursor";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useGestureControls } from "@/hooks/useGestureControls";
import { pixiStateAtom } from "@/stores/pixiStore";
import { currentPageIdAtom } from "@/stores/pageStore";
import { currentCanvasIdAtom, currentCanvasAtom } from "@/stores/canvasStore";
import {
  viewportAtom,
  zoomInAtom,
  zoomOutAtom,
  panViewportAtom,
} from "@/stores/viewportStore";
import {
  activeLayerIdAtom,
  autoCreateTextLayerAtom,
  currentActiveLayerAtom,
  layersForCurrentCanvasAtom,
  deleteLayerAtom,
  addLayerAtom,
} from "@/stores/layerStore";
import ZoomIndicator from "@/components/Common/ZoomIndicator";

type DrawingPoint =
  | BrushDrawingPoint
  | PenDrawingPoint
  | EraserDrawingPoint
  | SpeechBubbleDrawingPoint;

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const penEngineRef = useRef<PenEngine | null>(null);
  const eraserEngineRef = useRef<EraserEngine | null>(null);
  const textEngineRef = useRef<TextEngine | null>(null);
  const speechBubbleEngineRef = useRef<SpeechBubbleEngine | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentLayerRef = useRef<PIXI.Container | null>(null);
  const activeRenderTextureRef = useRef<PIXI.RenderTexture | null>(null);
  const lastPointerEventRef = useRef<PointerEvent | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const lastPressureRef = useRef<number>(0.5);
  const pressureSmoothing = 0.3;
  const isPanningRef = useRef<boolean>(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

  const [pixiState, setPixiState] = useAtom(pixiStateAtom);
  const { setIsTextEditing, isZoomInModeActive, isZoomOutModeActive } =
    useKeyboardShortcuts();
  const { attachToElement } = useGestureControls();

  const [viewport, setViewport] = useAtom(viewportAtom);
  const zoomIn = useSetAtom(zoomInAtom);
  const zoomOut = useSetAtom(zoomOutAtom);
  const panViewport = useSetAtom(panViewportAtom);

  const [brushSettings] = useAtom(brushSettingsAtom);
  const [penSettings] = useAtom(penSettingsAtom);
  const [eraserSettings] = useAtom(eraserSettingsAtom);
  const [textSettings] = useAtom(textSettingsAtom);
  const [speechBubbleSettings, setSpeechBubbleSettings] = useAtom(
    speechBubbleSettingsAtom
  );
  const [selectedToolId] = useAtom(selectedToolIdAtom);
  const isTemporaryHandTool = useAtomValue(isTemporaryHandToolAtom);
  const isTemporaryZoomInTool = useAtomValue(isTemporaryZoomInToolAtom);
  const isTemporaryZoomOutTool = useAtomValue(isTemporaryZoomOutToolAtom);
  const cursorStyle = useCursor();

  const currentPageId = useAtomValue(currentPageIdAtom);
  const currentCanvasId = useAtomValue(currentCanvasIdAtom);
  const currentCanvas = useAtomValue(currentCanvasAtom);
  const activeLayerId = useAtomValue(activeLayerIdAtom);
  const activeLayer = useAtomValue(currentActiveLayerAtom);
  const layersForCurrentCanvas = useAtomValue(layersForCurrentCanvasAtom);
  const activeLayerRef = useRef(activeLayer);
  const autoCreateTextLayer = useSetAtom(autoCreateTextLayerAtom);
  const deleteLayer = useSetAtom(deleteLayerAtom);
  const addLayer = useSetAtom(addLayerAtom);

  useEffect(() => {
    if (canvasElementRef.current) {
      canvasElementRef.current.style.cursor = cursorStyle;
    }
  }, [cursorStyle]);

  const getStageTransform = useCallback(() => {
    return `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  }, [viewport]);

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!appRef.current || !canvasRef.current) return { x: 0, y: 0 };

      const stageRect = canvasRef.current.getBoundingClientRect();
      const canvas = appRef.current.canvas;

      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;

      const transformedMouseX =
        (clientX - stageCenterX - viewport.x) / viewport.zoom;
      const transformedMouseY =
        (clientY - stageCenterY - viewport.y) / viewport.zoom;

      const canvasCenterX = stageRect.width / 2;
      const canvasCenterY = stageRect.height / 2;

      const scaleX = appRef.current.screen.width / stageRect.width;
      const scaleY = appRef.current.screen.height / stageRect.height;

      return {
        x: (transformedMouseX + canvasCenterX) * scaleX,
        y: (transformedMouseY + canvasCenterY) * scaleY,
      };
    },
    [viewport]
  );

  const getPressure = useCallback((event: PointerEvent): number => {
    let rawPressure: number;

    if (event.pointerType === "pen" && event.pressure > 0) {
      rawPressure = Math.pow(event.pressure, 0.8);
    } else if (event.pointerType === "touch" && event.pressure > 0) {
      rawPressure = Math.pow(event.pressure, 0.9);
    } else if (event.pointerType === "mouse") {
      const baseMousePressure = 0.45;
      const variation = Math.sin(Date.now() * 0.001) * 0.05;
      rawPressure = baseMousePressure + variation;

      if (event.buttons === 1) {
        rawPressure += 0.1;
      }
    } else {
      rawPressure = 0.5;
    }

    const smoothedPressure =
      lastPressureRef.current * (1 - pressureSmoothing) +
      rawPressure * pressureSmoothing;
    lastPressureRef.current = smoothedPressure;

    return Math.max(0.1, Math.min(1.0, smoothedPressure));
  }, []);

  const brushSettingsRef = useRef(brushSettings);
  const penSettingsRef = useRef(penSettings);
  const eraserSettingsRef = useRef(eraserSettings);
  const textSettingsRef = useRef(textSettings);
  const speechBubbleSettingsRef = useRef(speechBubbleSettings);
  const selectedToolIdRef = useRef(selectedToolId);
  const isTemporaryHandToolRef = useRef(isTemporaryHandTool);
  const isTemporaryZoomInToolRef = useRef(isTemporaryZoomInTool);
  const isTemporaryZoomOutToolRef = useRef(isTemporaryZoomOutTool);

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
    textSettingsRef.current = textSettings;
  }, [textSettings]);

  useEffect(() => {
    speechBubbleSettingsRef.current = speechBubbleSettings;
  }, [speechBubbleSettings]);

  useEffect(() => {
    selectedToolIdRef.current = selectedToolId;
  }, [selectedToolId]);

  useEffect(() => {
    isTemporaryHandToolRef.current = isTemporaryHandTool;
  }, [isTemporaryHandTool]);

  useEffect(() => {
    isTemporaryZoomInToolRef.current = isTemporaryZoomInTool;
  }, [isTemporaryZoomInTool]);

  useEffect(() => {
    isTemporaryZoomOutToolRef.current = isTemporaryZoomOutTool;
  }, [isTemporaryZoomOutTool]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    if (canvasRef.current) {
      attachToElement(canvasRef.current);
    }
  }, [attachToElement]);

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

  useEffect(() => {
    if (textEngineRef.current && !isDrawingRef.current) {
      const timeoutId = setTimeout(() => {
        if (textEngineRef.current) {
          textEngineRef.current.updateSettings(textSettingsRef.current);
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [textSettings]);

  useEffect(() => {
    if (speechBubbleEngineRef.current && !isDrawingRef.current) {
      const timeoutId = setTimeout(() => {
        if (speechBubbleEngineRef.current) {
          speechBubbleEngineRef.current.updateSettings(
            speechBubbleSettingsRef.current
          );
        }
      }, 16);
      return () => clearTimeout(timeoutId);
    }
  }, [speechBubbleSettings]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (textEngineRef.current) {
        const isEditing = textEngineRef.current.isCurrentlyEditing();
        setIsTextEditing(isEditing);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [setIsTextEditing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          textEngineRef.current?.isCurrentlyEditing()
        ) {
          return;
        }

        const currentTool = selectedToolIdRef.current;
        if (
          currentTool === ToolbarItemIDs.SPEECH_BUBBLE &&
          speechBubbleEngineRef.current
        ) {
          const selectedBubbleSettings =
            speechBubbleEngineRef.current.getSelectedBubbleSettings();
          if (selectedBubbleSettings && activeLayerId) {
            event.preventDefault();
            speechBubbleEngineRef.current.deleteSelectedBubble();
            deleteLayer(activeLayerId);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteLayer, activeLayerId]);

  const updateCanvasLayer = useCallback(() => {
    if (!appRef.current || !currentPageId || !currentCanvasId || !activeLayerId)
      return;

    if (!pixiState.isFullyReady) {
      console.log(
        "PIXI가 아직 완전히 준비되지 않았습니다. 잠시 후 다시 시도합니다."
      );
      return;
    }

    if (!pixiState.canvasContainers[currentPageId]) {
      console.warn(`페이지 컨테이너가 존재하지 않습니다: ${currentPageId}`);
      return;
    }

    if (currentLayerRef.current) {
      appRef.current.stage.removeChild(currentLayerRef.current);
    }

    const drawingLayer =
      pixiState.canvasContainers[currentPageId][currentCanvasId];
    if (!drawingLayer) {
      console.warn(
        `캔버스 컨테이너가 존재하지 않습니다: ${currentPageId}/${currentCanvasId}`
      );
      return;
    }

    appRef.current.stage.addChild(drawingLayer);
    currentLayerRef.current = drawingLayer;

    drawingLayer.removeChildren();

    const sortedLayers = [...layersForCurrentCanvas].sort(
      (a, b) => a.order - b.order
    );

    sortedLayers.forEach((layer) => {
      const layerGraphic = pixiState.layerGraphics[currentCanvasId]?.[layer.id];
      if (layerGraphic?.pixiSprite) {
        drawingLayer.addChild(layerGraphic.pixiSprite);
        layerGraphic.pixiSprite.visible = layer.isVisible;
        layerGraphic.pixiSprite.alpha = layer.opacity;
        layerGraphic.pixiSprite.blendMode = layer.blendMode as any;
      }
    });

    const activeLayerGraphic =
      pixiState.layerGraphics[currentCanvasId]?.[activeLayerId];
    if (activeLayerGraphic?.renderTexture) {
      activeRenderTextureRef.current = activeLayerGraphic.renderTexture;

      if (brushEngineRef.current) {
        brushEngineRef.current.setSharedRenderTexture(
          activeRenderTextureRef.current
        );
        brushEngineRef.current.setActiveLayer(drawingLayer);
      }

      if (penEngineRef.current) {
        penEngineRef.current.setActiveLayer(drawingLayer);
        penEngineRef.current.setSharedRenderTexture(
          activeRenderTextureRef.current
        );
      }

      if (eraserEngineRef.current) {
        eraserEngineRef.current.setSharedRenderTexture(
          activeRenderTextureRef.current
        );
      }

      if (textEngineRef.current && activeLayerRef.current) {
        if (activeLayerRef.current.type === "text") {
          textEngineRef.current.setActiveLayer(activeLayerRef.current);
          textEngineRef.current.setSharedRenderTexture(
            activeRenderTextureRef.current
          );
        } else {
          textEngineRef.current.setSharedRenderTexture(null);
        }
      }

      if (speechBubbleEngineRef.current) {
        if (activeLayerRef.current?.type === "speechBubble") {
          speechBubbleEngineRef.current.setSharedRenderTexture(
            activeRenderTextureRef.current
          );
          speechBubbleEngineRef.current.setActiveLayer(drawingLayer);
          speechBubbleEngineRef.current.setCurrentLayerId(
            activeLayerRef.current.id
          );
          speechBubbleEngineRef.current.updateLayerSelection(
            activeLayerRef.current.id
          );
        } else {
          speechBubbleEngineRef.current.setSharedRenderTexture(null);
          speechBubbleEngineRef.current.setCurrentLayerId(null);
          speechBubbleEngineRef.current.updateLayerSelection(null);
        }
      }
    }
  }, [
    pixiState,
    currentPageId,
    currentCanvasId,
    activeLayerId,
    layersForCurrentCanvas,
  ]);

  useEffect(() => {
    updateCanvasLayer();
  }, [updateCanvasLayer]);

  useEffect(() => {
    if (pixiState.app && currentCanvas && canvasElementRef.current) {
      const displaySize = getDisplaySize();

      pixiState.app.renderer.resize(currentCanvas.width, currentCanvas.height);

      setTimeout(() => {
        if (canvasElementRef.current) {
          canvasElementRef.current.style.width = `${displaySize.width}px`;
          canvasElementRef.current.style.height = `${displaySize.height}px`;
        }
      }, 0);

      console.log(
        `Stage 좌표 업데이트: PIXI=${currentCanvas.width}x${currentCanvas.height}, Display=${displaySize.width}x${displaySize.height}`
      );
    }
  }, [currentCanvas?.width, currentCanvas?.height, pixiState.app]);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const initApp = async () => {
      try {
        const app = pixiState.app;
        if (!app || !pixiState.isFullyReady) return;
        if (!canvasRef.current) return;

        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);

        brushEngineRef.current = new BrushEngine(app, brushSettings);
        penEngineRef.current = new PenEngine(app, penSettings);
        eraserEngineRef.current = new EraserEngine(app, eraserSettings);
        textEngineRef.current = new TextEngine(app, textSettings);
        textEngineRef.current.setOnLayerDelete(deleteLayer);
        speechBubbleEngineRef.current = new SpeechBubbleEngine(
          app,
          speechBubbleSettings
        );
        speechBubbleEngineRef.current.setOnSelectionChange((settings) => {
          if (settings) {
            setSpeechBubbleSettings((prev) => ({
              ...prev,
              ...settings,
            }));
          } else {
            setSpeechBubbleSettings(DEFAULT_SPEECH_BUBBLE_SETTINGS);
          }
        });

        updateCanvasLayer();

        const canvas = app.canvas as HTMLCanvasElement;
        canvasElementRef.current = canvas;
        canvas.style.cursor = cursorStyle;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.touchAction = "none";

        if (currentCanvas) {
          app.renderer.resize(currentCanvas.width, currentCanvas.height);
        }

        const handlePointerDown = (event: PointerEvent) => {
          const isTextEditing = textEngineRef.current?.isCurrentlyEditing();
          if (isTextEditing) {
            return;
          }
          event.preventDefault();

          const coords = getCanvasCoordinates(event.clientX, event.clientY);

          let currentTool = selectedToolIdRef.current;

          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (currentTool === ToolbarItemIDs.ZOOM_IN) {
            const containerRect = canvasRef.current!.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            const zoomPoint = {
              x: event.clientX - containerRect.left - centerX,
              y: event.clientY - containerRect.top - centerY,
            };

            zoomIn(zoomPoint);
            return;
          }

          if (currentTool === ToolbarItemIDs.ZOOM_OUT) {
            const containerRect = canvasRef.current!.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            const zoomPoint = {
              x: event.clientX - containerRect.left - centerX,
              y: event.clientY - containerRect.top - centerY,
            };

            zoomOut(zoomPoint);
            return;
          }

          if (
            (currentTool == ToolbarItemIDs.BRUSH ||
              currentTool == ToolbarItemIDs.PEN ||
              currentTool == ToolbarItemIDs.ERASER) &&
            activeLayerRef.current?.type === "text"
          ) {
            return;
          }

          if (currentTool === ToolbarItemIDs.TEXT && textEngineRef.current) {
            if (activeLayerRef.current?.type === "text") {
              const existingText = textEngineRef.current.getTextAtPosition(
                coords.x,
                coords.y
              );
              if (existingText) {
                textEngineRef.current.editExistingText(existingText);
                return;
              }
            }
            const textLayerId = autoCreateTextLayer();
            if (!textLayerId) {
              console.error("텍스트 레이어 생성 실패");
              return;
            }

            const textPoint: TextPoint = {
              x: coords.x,
              y: coords.y,
            };
            textEngineRef.current.startTextInput(textPoint, textLayerId);
            return;
          }

          if (
            currentTool === ToolbarItemIDs.SPEECH_BUBBLE &&
            speechBubbleEngineRef.current
          ) {
            const selected =
              speechBubbleEngineRef.current.selectBubbleAt(coords);
            if (!selected) {
              addLayer();
              setTimeout(() => {
                const newActiveLayer = activeLayerRef.current;
                if (newActiveLayer) {
                  speechBubbleEngineRef.current?.setCurrentLayerId(
                    newActiveLayer.id
                  );
                  speechBubbleEngineRef.current?.startDrawing(coords);
                  isDrawingRef.current = true;
                  canvas.setPointerCapture(event.pointerId);
                }
              }, 100);
            }
            return;
          }

          canvas.setPointerCapture(event.pointerId);
          lastPointerEventRef.current = event;
          isDrawingRef.current = true;

          lastPressureRef.current =
            event.pointerType === "pen" ? event.pressure : 0.5;

          const pressure = getPressure(event);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: pressure,
            timestamp: Date.now(),
          };

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
          const coords = getCanvasCoordinates(event.clientX, event.clientY);

          let currentTool = selectedToolIdRef.current;

          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (
            currentTool === ToolbarItemIDs.SPEECH_BUBBLE &&
            speechBubbleEngineRef.current
          ) {
            if (isDrawingRef.current) {
              speechBubbleEngineRef.current.continueDrawing(coords);
            } else {
              speechBubbleEngineRef.current.handlePointerMove(coords);
            }
            if (isDrawingRef.current) {
              event.preventDefault();
            }
            return;
          }

          if (!isDrawingRef.current) {
            return;
          }
          event.preventDefault();
          lastPointerEventRef.current = event;
          const pressure = getPressure(event);
          const point: DrawingPoint = {
            x: coords.x,
            y: coords.y,
            pressure: pressure,
            timestamp: Date.now(),
          };

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
          let currentTool = selectedToolIdRef.current;

          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (
            currentTool === ToolbarItemIDs.SPEECH_BUBBLE &&
            speechBubbleEngineRef.current
          ) {
            speechBubbleEngineRef.current.handlePointerUp();
            if (isDrawingRef.current) {
              speechBubbleEngineRef.current.endDrawing();
              canvas.releasePointerCapture(event.pointerId);
              isDrawingRef.current = false;
            }
            return;
          }

          if (!isDrawingRef.current) return;
          event.preventDefault();
          canvas.releasePointerCapture(event.pointerId);
          isDrawingRef.current = false;
          lastPressureRef.current = 0.5;

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
          let currentTool = selectedToolIdRef.current;

          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (isDrawingRef.current) {
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
            } else if (
              currentTool === ToolbarItemIDs.SPEECH_BUBBLE &&
              speechBubbleEngineRef.current
            ) {
              speechBubbleEngineRef.current.endDrawing();
            }
          }
          isDrawingRef.current = false;
          lastPressureRef.current = 0.5;
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
        if (textEngineRef.current) {
          textEngineRef.current.cleanup();
          textEngineRef.current = null;
        }
        if (speechBubbleEngineRef.current) {
          speechBubbleEngineRef.current.cleanup();
          speechBubbleEngineRef.current = null;
        }
        if (activeRenderTextureRef.current) {
          activeRenderTextureRef.current.destroy();
          activeRenderTextureRef.current = null;
        }
        if (canvasRef.current && canvas && canvasRef.current.contains(canvas)) {
          canvasRef.current.removeChild(canvas);
        }
        appRef.current.destroy();
        appRef.current = null;
        canvasElementRef.current = null;
      }
    };
  }, [pixiState.app, pixiState.isFullyReady]);

  const getDisplaySize = () => {
    if (!currentCanvas) return { width: 800, height: 450 };

    const aspectRatio = currentCanvas.width / currentCanvas.height;
    const maxWidth = window.innerWidth * 0.6;
    const maxHeight = window.innerHeight * 0.8;

    let displayWidth, displayHeight;

    if (aspectRatio > maxWidth / maxHeight) {
      displayWidth = maxWidth;
      displayHeight = maxWidth / aspectRatio;
    } else {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    return {
      width: Math.max(displayWidth, 300),
      height: Math.max(displayHeight, 200),
    };
  };

  const displaySize = getDisplaySize();
  const canvasBackgroundColor =
    currentCanvas?.backgroundColor === "TRANSPARENT"
      ? "transparent"
      : currentCanvas?.backgroundColor || "#FFFFFF";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        ref={canvasRef}
        className="origin-center"
        style={{
          width: `${displaySize.width}px`,
          height: `${displaySize.height}px`,
          backgroundColor:
            canvasBackgroundColor === "transparent"
              ? "#f8f8f8"
              : canvasBackgroundColor,
          backgroundImage:
            canvasBackgroundColor === "transparent"
              ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
              : "none",
          backgroundSize:
            canvasBackgroundColor === "transparent" ? "20px 20px" : "none",
          backgroundPosition:
            canvasBackgroundColor === "transparent" ? "0 0, 10px 10px" : "none",
          transform: getStageTransform(),
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}

export default Stage;
