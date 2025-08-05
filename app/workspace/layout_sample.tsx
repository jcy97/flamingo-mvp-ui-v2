"use client";
import { LeftSidebar } from "@/components/Workspace/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/Workspace/RightSidebar/RightSidebar";
import Toolsbar from "@/components/Workspace/Toolsbar/Toolsbar";
import { useCallback, useRef, useState, useEffect } from "react";
import { useAtom } from "jotai";
import * as PIXI from "pixi.js";
import {
  pixiStateAtom,
  initPixiAppAtom,
  createPageContainersAtom,
  createCanvasContainerAtom,
  switchPageAtom,
  switchCanvasAtom,
  switchLayerAtom,
  getCanvasContainerAtom,
} from "@/stores/pixiStore";
import { currentPageIdAtom, currentPageAtom } from "@/stores/pageStore";
import {
  currentCanvasIdAtom,
  currentCanvasAtom,
  autoSelectFirstCanvasAtom,
} from "@/stores/canvasStore";
import {
  layersForCurrentCanvasAtom,
  activeLayerIdAtom,
  currentActiveLayerAtom,
  addLayerAtom,
  autoSelectFirstLayerAtom,
  setActiveLayerAtom,
} from "@/stores/layerStore";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [leftWidth, setLeftWidth] = useState<number>(240);
  const [rightWidth, setRightWidth] = useState<number>(280);
  const [leftVisible, setLeftVisible] = useState<boolean>(true);
  const [rightVisible, setRightVisible] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  const [pixiState, setPixiState] = useAtom(pixiStateAtom);
  const [, initPixiApp] = useAtom(initPixiAppAtom);
  const [, createPageContainers] = useAtom(createPageContainersAtom);
  const [, createCanvasContainer] = useAtom(createCanvasContainerAtom);
  const [, switchPage] = useAtom(switchPageAtom);
  const [, switchCanvas] = useAtom(switchCanvasAtom);
  const [, switchLayer] = useAtom(switchLayerAtom);
  const [canvasContainer] = useAtom(getCanvasContainerAtom);

  const [currentPageId] = useAtom(currentPageIdAtom);
  const [currentPage] = useAtom(currentPageAtom);
  const [currentCanvasId] = useAtom(currentCanvasIdAtom);
  const [currentCanvas] = useAtom(currentCanvasAtom);
  const [, autoSelectFirstCanvas] = useAtom(autoSelectFirstCanvasAtom);

  const [layersForCurrentCanvas] = useAtom(layersForCurrentCanvasAtom);
  const [activeLayerId] = useAtom(activeLayerIdAtom);
  const [currentActiveLayer] = useAtom(currentActiveLayerAtom);
  const [, addLayer] = useAtom(addLayerAtom);
  const [, autoSelectFirstLayer] = useAtom(autoSelectFirstLayerAtom);
  const [, setActiveLayer] = useAtom(setActiveLayerAtom);

  const MIN_SIDEBAR_WIDTH = 200;
  const MIN_CONTENT_WIDTH = 300;

  useEffect(() => {
    const initializePixi = async () => {
      if (isInitializedRef.current || pixiState.isInitialized) return;

      try {
        await initPixiApp();
        isInitializedRef.current = true;
      } catch (error) {
        console.error("PIXI 초기화 실패:", error);
      }
    };

    initializePixi();
  }, [pixiState.isInitialized, initPixiApp]);

  useEffect(() => {
    if (!pixiState.isInitialized || !currentPageId) return;

    if (!pixiState.pageContainers[currentPageId]) {
      createPageContainers(currentPageId);
    }

    if (pixiState.activePageId !== currentPageId) {
      switchPage(currentPageId);
    }
  }, [
    pixiState.isInitialized,
    currentPageId,
    pixiState.pageContainers,
    pixiState.activePageId,
    createPageContainers,
    switchPage,
  ]);

  useEffect(() => {
    if (!pixiState.isInitialized || !currentPageId || !currentCanvasId) return;

    if (!pixiState.pageContainers[currentPageId]?.[currentCanvasId]) {
      createCanvasContainer({
        pageId: currentPageId,
        canvasId: currentCanvasId,
      });
    }

    if (pixiState.activeCanvasId !== currentCanvasId) {
      switchCanvas(currentCanvasId);
    }
  }, [
    pixiState.isInitialized,
    currentPageId,
    currentCanvasId,
    pixiState.pageContainers,
    pixiState.activeCanvasId,
    createCanvasContainer,
    switchCanvas,
  ]);

  useEffect(() => {
    if (!currentPageId) return;
    autoSelectFirstCanvas();
  }, [currentPageId, autoSelectFirstCanvas]);

  useEffect(() => {
    if (!currentCanvasId || layersForCurrentCanvas.length === 0) return;

    if (layersForCurrentCanvas.length === 0) {
      addLayer();
    } else {
      autoSelectFirstLayer();
    }
  }, [
    currentCanvasId,
    layersForCurrentCanvas.length,
    addLayer,
    autoSelectFirstLayer,
  ]);

  useEffect(() => {
    if (!activeLayerId) return;
    if (pixiState.activeLayerId !== activeLayerId) {
      switchLayer(activeLayerId);
    }
  }, [activeLayerId, pixiState.activeLayerId, switchLayer]);

  const handleMouseDown = useCallback(
    (side: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(side);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const x = e.clientX - rect.left;

      if (isDragging === "left") {
        const maxLeftWidth =
          leftVisible && rightVisible
            ? containerWidth - rightWidth - MIN_CONTENT_WIDTH
            : rightVisible
            ? containerWidth - rightWidth - MIN_CONTENT_WIDTH
            : containerWidth - MIN_CONTENT_WIDTH;

        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxLeftWidth, x));
        setLeftWidth(newWidth);
      } else if (isDragging === "right") {
        const maxRightWidth =
          leftVisible && rightVisible
            ? containerWidth - leftWidth - MIN_CONTENT_WIDTH
            : leftVisible
            ? containerWidth - leftWidth - MIN_CONTENT_WIDTH
            : containerWidth - MIN_CONTENT_WIDTH;

        const newWidth = Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(maxRightWidth, containerWidth - x)
        );
        setRightWidth(newWidth);
      }
    },
    [isDragging, leftWidth, rightWidth, leftVisible, rightVisible]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    if (leftVisible) {
      setLeftVisible(false);
    } else {
      setLeftVisible(true);
      if (containerRef.current) {
        const containerWidth =
          containerRef.current.getBoundingClientRect().width;
        const maxAllowedWidth = rightVisible
          ? containerWidth - rightWidth - MIN_CONTENT_WIDTH
          : containerWidth - MIN_CONTENT_WIDTH;

        if (leftWidth > maxAllowedWidth) {
          setLeftWidth(Math.max(MIN_SIDEBAR_WIDTH, maxAllowedWidth));
        }
      }
    }
  }, [leftVisible, rightVisible, leftWidth, rightWidth]);

  const toggleRightSidebar = useCallback(() => {
    if (rightVisible) {
      setRightVisible(false);
    } else {
      setRightVisible(true);
      if (containerRef.current) {
        const containerWidth =
          containerRef.current.getBoundingClientRect().width;
        const maxAllowedWidth = leftVisible
          ? containerWidth - leftWidth - MIN_CONTENT_WIDTH
          : containerWidth - MIN_CONTENT_WIDTH;

        if (rightWidth > maxAllowedWidth) {
          setRightWidth(Math.max(MIN_SIDEBAR_WIDTH, maxAllowedWidth));
        }
      }
    }
  }, [rightVisible, leftVisible, leftWidth, rightWidth]);

  return (
    <div
      ref={containerRef}
      className="h-screen relative bg-neutral-600"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          marginLeft: leftVisible ? `${leftWidth}px` : "0",
          marginRight: rightVisible ? `${rightWidth}px` : "0",
        }}
      >
        {children}
      </div>

      <LeftSidebar
        width={leftWidth}
        visible={leftVisible}
        isDragging={isDragging === "left"}
        onToggle={toggleLeftSidebar}
        onMouseDown={handleMouseDown("left")}
      />
      <RightSidebar
        width={rightWidth}
        visible={rightVisible}
        isDragging={isDragging === "right"}
        onToggle={toggleRightSidebar}
        onMouseDown={handleMouseDown("right")}
      />
      <Toolsbar />
    </div>
  );
}
