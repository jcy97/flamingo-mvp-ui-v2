"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import * as PIXI from "pixi.js";
import { brushSettingsAtom } from "@/stores/brushStore";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { layersForCurrentCanvasAtom } from "@/stores/layerStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { BrushEngine, DrawingPoint } from "./BrushEngine";
import { cleanupBrushTextures } from "@/utils/brush";

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const brushEngineRef = useRef<BrushEngine | null>(null);
  const layersRef = useRef<Map<string, PIXI.Container>>(new Map());
  const activeLayerContainerRef = useRef<PIXI.Container | null>(null);

  const [brushSettings] = useAtom(brushSettingsAtom);
  const [selectedToolId] = useAtom(selectedToolIdAtom);
  const [layersForCurrentCanvas] = useAtom(layersForCurrentCanvasAtom);

  // 브러쉬 엔진 초기화
  const initializeBrushEngine = useCallback(() => {
    if (!appRef.current) return;

    if (brushEngineRef.current) {
      brushEngineRef.current.cleanup();
    }

    brushEngineRef.current = new BrushEngine(appRef.current, brushSettings);

    // 활성 레이어 설정
    if (activeLayerContainerRef.current) {
      brushEngineRef.current.setActiveLayer(activeLayerContainerRef.current);
    }
  }, [brushSettings]);

  // 브러쉬 설정 업데이트
  useEffect(() => {
    if (brushEngineRef.current) {
      brushEngineRef.current.updateSettings(brushSettings);
    }
  }, [brushSettings]);

  // 레이어 관리
  useEffect(() => {
    if (!appRef.current) return;

    // 기존 레이어들 정리
    layersRef.current.forEach((container, layerId) => {
      if (!layersForCurrentCanvas.find((l) => l.id === layerId)) {
        appRef.current!.stage.removeChild(container);
        container.destroy();
        layersRef.current.delete(layerId);
      }
    });

    // 새로운 레이어들 생성
    layersForCurrentCanvas.forEach((layer) => {
      if (!layersRef.current.has(layer.id)) {
        const container = new PIXI.Container();
        container.name = layer.name;
        container.visible = layer.isVisible;
        container.alpha = layer.opacity;

        appRef.current!.stage.addChild(container);
        layersRef.current.set(layer.id, container);
      } else {
        const container = layersRef.current.get(layer.id)!;
        container.visible = layer.isVisible;
        container.alpha = layer.opacity;
      }
    });

    // 활성 레이어 설정 (첫 번째 레이어를 활성으로 설정)
    if (layersForCurrentCanvas.length > 0) {
      const activeLayer = layersRef.current.get(layersForCurrentCanvas[0].id);
      if (activeLayer) {
        activeLayerContainerRef.current = activeLayer;
        if (brushEngineRef.current) {
          brushEngineRef.current.setActiveLayer(activeLayer);
        }
      }
    } else {
      // 레이어가 없으면 기본 레이어 생성
      if (!activeLayerContainerRef.current && appRef.current) {
        const defaultContainer = new PIXI.Container();
        defaultContainer.name = "Default Layer";
        appRef.current.stage.addChild(defaultContainer);
        activeLayerContainerRef.current = defaultContainer;

        if (brushEngineRef.current) {
          brushEngineRef.current.setActiveLayer(defaultContainer);
        }
      }
    }
  }, [layersForCurrentCanvas]);

  // 마우스/터치 이벤트 처리
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!appRef.current?.canvas) return null;

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

  const handlePointerStart = useCallback(
    (event: PointerEvent) => {
      if (!brushEngineRef.current || selectedToolId !== "brush") return;

      event.preventDefault();
      const coords = getCanvasCoordinates(event.clientX, event.clientY);
      if (!coords) return;

      const point: DrawingPoint = {
        x: coords.x,
        y: coords.y,
        pressure: event.pressure || 1,
        timestamp: Date.now(),
      };

      brushEngineRef.current.startStroke(point);
    },
    [selectedToolId, getCanvasCoordinates]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (
        !brushEngineRef.current ||
        !brushEngineRef.current.isCurrentlyDrawing()
      )
        return;

      event.preventDefault();
      const coords = getCanvasCoordinates(event.clientX, event.clientY);
      if (!coords) return;

      const point: DrawingPoint = {
        x: coords.x,
        y: coords.y,
        pressure: event.pressure || 1,
        timestamp: Date.now(),
      };

      brushEngineRef.current.continueStroke(point);
    },
    [getCanvasCoordinates]
  );

  const handlePointerEnd = useCallback((event: PointerEvent) => {
    if (!brushEngineRef.current) return;

    event.preventDefault();
    brushEngineRef.current.endStroke();
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (brushEngineRef.current) {
      brushEngineRef.current.endStroke();
    }
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!brushEngineRef.current) return;

      switch (event.key) {
        case "[":
          event.preventDefault();
          brushEngineRef.current.adjustBrushSize(-5);
          break;
        case "]":
          event.preventDefault();
          brushEngineRef.current.adjustBrushSize(5);
          break;
        case "{":
          event.preventDefault();
          brushEngineRef.current.adjustBrushHardness(-0.1);
          break;
        case "}":
          event.preventDefault();
          brushEngineRef.current.adjustBrushHardness(0.1);
          break;
        case "-":
          if (event.ctrlKey) {
            event.preventDefault();
            brushEngineRef.current.adjustBrushOpacity(-0.1);
          }
          break;
        case "=":
          if (event.ctrlKey) {
            event.preventDefault();
            brushEngineRef.current.adjustBrushOpacity(0.1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // PIXI JS 초기화
  useEffect(() => {
    if (!canvasRef.current) return;

    const initApp = async () => {
      try {
        console.log("드로잉 엔진 초기화");
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

        // 캔버스 스타일 설정
        const canvas = app.canvas;
        canvas.style.cursor = "crosshair";
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.touchAction = "none"; // 터치 스크롤 방지

        // 이벤트 리스너 등록 (Pointer Events 사용)
        canvas.addEventListener("pointerdown", handlePointerStart);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerEnd);
        canvas.addEventListener("pointerleave", handlePointerLeave);
        canvas.addEventListener("pointercancel", handlePointerEnd);

        console.log("이벤트 리스너 등록 완료");

        // 기본 레이어 생성 (레이어가 없을 때)
        if (!activeLayerContainerRef.current) {
          const defaultContainer = new PIXI.Container();
          defaultContainer.name = "Default Layer";
          app.stage.addChild(defaultContainer);
          activeLayerContainerRef.current = defaultContainer;
        }

        // 브러쉬 엔진 초기화 (기본 레이어 생성 후)
        setTimeout(() => {
          initializeBrushEngine();
        }, 100);

        console.log("드로잉 엔진 초기화 완료");

        // 정리 함수
        return () => {
          console.log("캔버스 정리");
          canvas.removeEventListener("pointerdown", handlePointerStart);
          canvas.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("pointerup", handlePointerEnd);
          canvas.removeEventListener("pointerleave", handlePointerLeave);
          canvas.removeEventListener("pointercancel", handlePointerEnd);

          if (brushEngineRef.current) {
            brushEngineRef.current.cleanup();
            brushEngineRef.current = null;
          }

          cleanupBrushTextures();

          if (
            canvasRef.current &&
            app.canvas &&
            canvasRef.current.contains(app.canvas)
          ) {
            canvasRef.current.removeChild(app.canvas);
          }
          app.destroy();
        };
      } catch (error) {
        console.error("드로잉 엔진 초기화 실패", error);
      }
    };

    const cleanup = initApp();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, [
    initializeBrushEngine,
    handlePointerStart,
    handlePointerMove,
    handlePointerEnd,
    handlePointerLeave,
  ]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* 스테이지(PIXIJS) */}
      <div
        ref={canvasRef}
        className="border-4 border-gray-300 rounded-lg"
        style={{
          width: "800px",
          height: "600px",
          backgroundColor: "#f8f8f8",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />

      {/* 도구 정보 표시 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {selectedToolId === "brush" && "브러쉬 도구"}
        {selectedToolId === "select" && "선택 도구"}
        {selectedToolId !== "brush" &&
          selectedToolId !== "select" &&
          "도구 선택"}
      </div>

      {/* 브러쉬 설정 표시 (브러쉬 도구일 때만) */}
      {selectedToolId === "brush" && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          크기: {brushSettings.size}px | 경도:{" "}
          {Math.round(brushSettings.hardness * 100)}% | 불투명도:{" "}
          {Math.round(brushSettings.opacity * 100)}%
        </div>
      )}
    </div>
  );
}

export default Stage;
