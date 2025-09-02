"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import * as PIXI from "pixi.js";
import "pixi.js/advanced-blend-modes";
import { BrushEngine, DrawingPoint as BrushDrawingPoint } from "./BrushEngine";
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
import { eraserSettingsAtom } from "@/stores/eraserStore";
import {
  textSettingsAtom,
  getTextTransformAtom,
  updateTextPositionAtom,
  updateTextScaleAtom,
} from "@/stores/textStore";
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
import { pixiStateAtom, refreshCanvasThumbnailAtom } from "@/stores/pixiStore";
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
  autoSelectFirstLayerAtom,
  updateLayerAtom,
} from "@/stores/layerStore";
import {
  selectionStateAtom,
  activateSelectionModeAtom,
  deactivateSelectionModeAtom,
  selectElementAtom,
  clearSelectionAtom,
  startDragAtom,
  updateDragAtom,
  endDragAtom,
} from "@/stores/selectionStore";
import ZoomIndicator from "@/components/Common/ZoomIndicator";
import Transformer from "./Transformer";
import { useTransformer } from "@/hooks/useTransformer";
import { Bounds } from "@/types/common";
import { mergeBounds } from "@/utils/transformer";
import {
  getCanvasCoordinates,
  CanvasCoordinatesParams,
} from "@/utils/coordinate";

type DrawingPoint =
  | BrushDrawingPoint
  | EraserDrawingPoint
  | SpeechBubbleDrawingPoint;

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
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
  const currentCanvasIdRef = useRef(currentCanvasId);
  const currentCanvas = useAtomValue(currentCanvasAtom);
  const activeLayerId = useAtomValue(activeLayerIdAtom);
  const activeLayer = useAtomValue(currentActiveLayerAtom);
  const effectiveActiveLayerId = activeLayer?.id || activeLayerId;
  const layersForCurrentCanvas = useAtomValue(layersForCurrentCanvasAtom);
  const activeLayerRef = useRef(activeLayer);
  const autoCreateTextLayer = useSetAtom(autoCreateTextLayerAtom);
  const deleteLayer = useSetAtom(deleteLayerAtom);
  const addLayer = useSetAtom(addLayerAtom);
  const autoSelectFirstLayer = useSetAtom(autoSelectFirstLayerAtom);
  const refreshCanvasThumbnail = useSetAtom(refreshCanvasThumbnailAtom);

  const updateLayer = useSetAtom(updateLayerAtom);

  const {
    transformerState,
    handlePointerDown: handleTransformerPointerDown,
    handlePointerMove: handleTransformerPointerMove,
    handlePointerUp: handleTransformerPointerUp,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleRotateStart,
    handleRotateMove,
    handleRotateEnd,
    applyTransformToPixiObject,
  } = useTransformer();

  const [selectionState, setSelectionState] = useAtom(selectionStateAtom);
  const activateSelectionMode = useSetAtom(activateSelectionModeAtom);
  const deactivateSelectionMode = useSetAtom(deactivateSelectionModeAtom);
  const selectElement = useSetAtom(selectElementAtom);
  const clearSelection = useSetAtom(clearSelectionAtom);
  const startDrag = useSetAtom(startDragAtom);
  const updateDrag = useSetAtom(updateDragAtom);
  const endDrag = useSetAtom(endDragAtom);

  const getDisplaySize = useCallback(() => {
    if (!currentCanvas) return { width: 800, height: 450 };

    const aspectRatio = currentCanvas.width / currentCanvas.height;
    const maxWidth =
      typeof window !== "undefined" ? window.innerWidth * 0.6 : 1200;
    const maxHeight =
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 800;

    let displayWidth, displayHeight;

    if (aspectRatio > maxWidth / maxHeight) {
      displayWidth = maxWidth;
      displayHeight = maxWidth / aspectRatio;
    } else {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }

    const minSize = 200;
    if (displayWidth < minSize || displayHeight < minSize) {
      if (displayWidth < displayHeight) {
        displayWidth = minSize;
        displayHeight = minSize / aspectRatio;
      } else {
        displayHeight = minSize;
        displayWidth = minSize * aspectRatio;
      }
    }

    return {
      width: displayWidth,
      height: displayHeight,
    };
  }, [currentCanvas]);

  useEffect(() => {
    if (canvasElementRef.current) {
      canvasElementRef.current.style.cursor = cursorStyle;
    }
  }, [cursorStyle]);

  useEffect(() => {
    currentCanvasIdRef.current = currentCanvasId;
  }, [currentCanvasId]);

  useEffect(() => {
    if (canvasElementRef.current && currentCanvas && appRef.current) {
      appRef.current.renderer.resize(currentCanvas.width, currentCanvas.height);

      const displaySize = getDisplaySize();
      const scaleX = displaySize.width / currentCanvas.width;
      const scaleY = displaySize.height / currentCanvas.height;
      const uniformScale = Math.min(scaleX, scaleY);

      canvasElementRef.current.style.width = `${
        currentCanvas.width * uniformScale
      }px`;
      canvasElementRef.current.style.height = `${
        currentCanvas.height * uniformScale
      }px`;
    }
  }, [currentCanvas, getDisplaySize]);

  const getStageTransform = useCallback(() => {
    return `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  }, [viewport]);

  const getCanvasCoordinatesHelper = useCallback(
    (clientX: number, clientY: number) => {
      return getCanvasCoordinates(clientX, clientY, {
        canvasRef,
        appRef,
        viewport,
      });
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
  const eraserSettingsRef = useRef(eraserSettings);
  const textSettingsRef = useRef(textSettings);
  const speechBubbleSettingsRef = useRef(speechBubbleSettings);
  const selectedToolIdRef = useRef(selectedToolId);
  const isTemporaryHandToolRef = useRef(isTemporaryHandTool);
  const isTemporaryZoomInToolRef = useRef(isTemporaryZoomInTool);
  const isTemporaryZoomOutToolRef = useRef(isTemporaryZoomOutTool);

  const handleStrokeComplete = useCallback(
    (bounds: Bounds) => {
      const currentLayer = activeLayerRef.current;

      // 1. 현재 활성화된 레이어가 있는지 확인합니다.
      if (!currentLayer) {
        console.warn("활성 레이어가 없어 bounds를 업데이트할 수 없습니다.");
        return;
      }
      // 2. 기존 bounds와 새로운 stroke의 bounds를 병합합니다.
      const newContentBounds = mergeBounds(
        currentLayer.data.contentBounds,
        bounds
      );
      // 3. `updateLayerAtom`을 호출하여 contentBounds를 업데이트합니다.
      updateLayer({
        layerId: currentLayer.id,
        updates: {
          data: { ...currentLayer.data, contentBounds: newContentBounds },
        },
      });
    },
    [updateLayer]
  );

  useEffect(() => {
    brushSettingsRef.current = brushSettings;
  }, [brushSettings]);

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
    if (selectedToolId !== ToolbarItemIDs.HAND && isPanningRef.current) {
      isPanningRef.current = false;
      lastPanPointRef.current = null;
    }
  }, [selectedToolId]);

  useEffect(() => {
    isTemporaryHandToolRef.current = isTemporaryHandTool;
    if (!isTemporaryHandTool && isPanningRef.current) {
      isPanningRef.current = false;
      lastPanPointRef.current = null;
    }
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
    const isSelectTool = selectedToolId === ToolbarItemIDs.SELECT;

    if (isSelectTool) {
      activateSelectionMode();
      if (activeLayer) {
        if (activeLayer.type === "speechBubble") {
          selectElement({ type: "speechBubble", id: activeLayer.id });
        }
      }
    } else {
      deactivateSelectionMode();
    }
  }, [
    selectedToolId,
    activeLayer,
    activateSelectionMode,
    deactivateSelectionMode,
    selectElement,
  ]);

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
          if (selectedBubbleSettings && effectiveActiveLayerId) {
            event.preventDefault();
            speechBubbleEngineRef.current.deleteSelectedBubble();
            deleteLayer(effectiveActiveLayerId);
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [deleteLayer, effectiveActiveLayerId]);

  const updateCanvasLayer = useCallback(() => {
    if (
      !appRef.current ||
      !currentPageId ||
      !currentCanvasId ||
      !effectiveActiveLayerId
    ) {
      return;
    }

    if (!pixiState.isFullyReady) {
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
      pixiState.layerGraphics[currentCanvasId]?.[effectiveActiveLayerId];
    if (activeLayerGraphic?.renderTexture) {
      activeRenderTextureRef.current = activeLayerGraphic.renderTexture;

      if (brushEngineRef.current) {
        brushEngineRef.current.setSharedRenderTexture(
          activeRenderTextureRef.current
        );
        brushEngineRef.current.setActiveLayer(drawingLayer);
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
    effectiveActiveLayerId,
    layersForCurrentCanvas,
  ]);

  useEffect(() => {
    updateCanvasLayer();
  }, [updateCanvasLayer]);

  useEffect(() => {
    if (!effectiveActiveLayerId && layersForCurrentCanvas.length > 0) {
      autoSelectFirstLayer();
    }
  }, [effectiveActiveLayerId, layersForCurrentCanvas, autoSelectFirstLayer]);

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

        brushEngineRef.current = new BrushEngine(
          app,
          brushSettings,
          handleStrokeComplete
        );
        eraserEngineRef.current = new EraserEngine(app, eraserSettings);
        textEngineRef.current = new TextEngine(app, textSettings);
        textEngineRef.current.setOnLayerDelete(deleteLayer);
        textEngineRef.current.setOnThumbnailUpdate(() => {
          if (currentCanvasIdRef.current) {
            refreshCanvasThumbnail(currentCanvasIdRef.current!);
          }
        });
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
        speechBubbleEngineRef.current.setOnThumbnailUpdate(() => {
          if (currentCanvasIdRef.current) {
            refreshCanvasThumbnail(currentCanvasIdRef.current);
          }
        });

        updateCanvasLayer();

        const canvas = app.canvas as HTMLCanvasElement;
        canvasElementRef.current = canvas;
        canvas.style.cursor = cursorStyle;
        canvas.style.display = "block";
        canvas.style.touchAction = "none";

        if (currentCanvas) {
          app.renderer.resize(currentCanvas.width, currentCanvas.height);

          const displaySize = getDisplaySize();
          const scaleX = displaySize.width / currentCanvas.width;
          const scaleY = displaySize.height / currentCanvas.height;
          const uniformScale = Math.min(scaleX, scaleY);

          canvas.style.width = `${currentCanvas.width * uniformScale}px`;
          canvas.style.height = `${currentCanvas.height * uniformScale}px`;
        }

        const scheduleCanvasThumbnailUpdate = () => {
          if (currentCanvasIdRef.current) {
            setTimeout(() => {
              refreshCanvasThumbnail(currentCanvasIdRef.current!);
            }, 50);
          }
        };

        const handlePointerDown = async (event: PointerEvent) => {
          const isTextEditing = textEngineRef.current?.isCurrentlyEditing();
          if (isTextEditing) {
            return;
          }
          event.preventDefault();

          const coords = getCanvasCoordinatesHelper(
            event.clientX,
            event.clientY
          );
          // if (transformerState.isActive) {
          //   const handled = handleTransformerPointerDown(event, coords);
          //   if (handled) {
          //     canvas.setPointerCapture(event.pointerId);
          //     return;
          //   }
          // }

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

          if (currentTool === ToolbarItemIDs.HAND) {
            isPanningRef.current = true;
            lastPanPointRef.current = {
              x: event.clientX,
              y: event.clientY,
            };
            canvas.setPointerCapture(event.pointerId);
            event.preventDefault();
            return;
          }

          if (currentTool === ToolbarItemIDs.SELECT) {
            const activeLayer = activeLayerRef.current;

            if (
              activeLayer?.type === "speechBubble" &&
              speechBubbleEngineRef.current
            ) {
              const foundBubble =
                speechBubbleEngineRef.current.selectBubbleAt(coords);
              if (foundBubble) {
                selectElement({ type: "speechBubble", id: activeLayer.id });
                startDrag({ x: event.clientX, y: event.clientY });
                return;
              }
            }

            clearSelection();
            return;
          }

          if (
            (currentTool == ToolbarItemIDs.BRUSH ||
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
            const textLayerId = await autoCreateTextLayer();
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
              await addLayer();
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

          if (currentTool === ToolbarItemIDs.BRUSH && brushEngineRef.current) {
            brushEngineRef.current.startStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.startStroke(point);
          }
        };

        const handlePointerMove = (event: PointerEvent) => {
          const coords = getCanvasCoordinatesHelper(
            event.clientX,
            event.clientY
          );

          if (transformerState.isActive) {
            const handled = handleTransformerPointerMove(event, coords);
            if (handled) {
              event.preventDefault();
              return;
            }
          }

          let currentTool = selectedToolIdRef.current;

          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (currentTool === ToolbarItemIDs.HAND && isPanningRef.current) {
            if (lastPanPointRef.current) {
              const deltaX = event.clientX - lastPanPointRef.current.x;
              const deltaY = event.clientY - lastPanPointRef.current.y;

              panViewport({ x: deltaX, y: deltaY });

              lastPanPointRef.current = {
                x: event.clientX,
                y: event.clientY,
              };
            }
            event.preventDefault();
            return;
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

          if (
            currentTool === ToolbarItemIDs.SELECT &&
            selectionState.isDragging
          ) {
            updateDrag({ x: event.clientX, y: event.clientY });

            if (selectionState.dragOffset) {
              const scaledDeltaX = selectionState.dragOffset.x / viewport.zoom;
              const scaledDeltaY = selectionState.dragOffset.y / viewport.zoom;

              if (
                selectionState.selectedElementType === "speechBubble" &&
                speechBubbleEngineRef.current
              ) {
                if (
                  speechBubbleEngineRef.current.isPointInSelectedBubbleBounds(
                    coords.x,
                    coords.y
                  )
                ) {
                  speechBubbleEngineRef.current.handlePointerMove(coords);
                }
              }
            }

            event.preventDefault();
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

          if (currentTool === ToolbarItemIDs.BRUSH && brushEngineRef.current) {
            brushEngineRef.current.continueStroke(point);
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.continueStroke(point);
          }
        };

        const handlePointerUp = (event: PointerEvent) => {
          if (transformerState.isActive) {
            const handled = handleTransformerPointerUp();
            if (handled) {
              canvas.releasePointerCapture(event.pointerId);
              return;
            }
          }

          let currentTool = selectedToolIdRef.current;
          if (isTemporaryZoomInToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_IN;
          } else if (isTemporaryZoomOutToolRef.current) {
            currentTool = ToolbarItemIDs.ZOOM_OUT;
          } else if (isTemporaryHandToolRef.current) {
            currentTool = ToolbarItemIDs.HAND;
          }

          if (isPanningRef.current) {
            isPanningRef.current = false;
            lastPanPointRef.current = null;
            canvas.releasePointerCapture(event.pointerId);
            return;
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
              if (currentCanvasIdRef.current) {
                setTimeout(
                  () => refreshCanvasThumbnail(currentCanvasIdRef.current!),
                  50
                );
              }
            }
            return;
          }

          if (
            currentTool === ToolbarItemIDs.SELECT &&
            selectionState.isDragging
          ) {
            if (
              selectionState.selectedElementType === "speechBubble" &&
              speechBubbleEngineRef.current
            ) {
              speechBubbleEngineRef.current.handlePointerUp();
            }

            endDrag();

            if (currentCanvasIdRef.current) {
              setTimeout(
                () => refreshCanvasThumbnail(currentCanvasIdRef.current!),
                50
              );
            }

            return;
          }

          if (!isDrawingRef.current) return;
          event.preventDefault();
          canvas.releasePointerCapture(event.pointerId);
          isDrawingRef.current = false;
          lastPressureRef.current = 0.5;

          if (currentTool === ToolbarItemIDs.BRUSH && brushEngineRef.current) {
            brushEngineRef.current.endStroke();
            if (currentCanvasIdRef.current) {
              setTimeout(
                () => refreshCanvasThumbnail(currentCanvasIdRef.current!),
                50
              );
            }
          } else if (
            currentTool === ToolbarItemIDs.ERASER &&
            eraserEngineRef.current
          ) {
            eraserEngineRef.current.endStroke();
            if (currentCanvasIdRef.current) {
              setTimeout(
                () => refreshCanvasThumbnail(currentCanvasIdRef.current!),
                50
              );
            }
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

          if (isPanningRef.current) {
            isPanningRef.current = false;
            lastPanPointRef.current = null;
          }

          if (isDrawingRef.current) {
            if (
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
            scheduleCanvasThumbnailUpdate();
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
      <Transformer
        onResizeStart={handleResizeStart}
        onResizeMove={handleResizeMove}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotateMove={handleRotateMove}
        onRotateEnd={handleRotateEnd}
        applyTransformToPixiObject={applyTransformToPixiObject}
        canvasCoordinatesParams={{
          canvasRef,
          appRef,
          viewport,
        }}
      />
    </div>
  );
}

export default Stage;
