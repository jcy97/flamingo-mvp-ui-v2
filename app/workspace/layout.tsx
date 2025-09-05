"use client";
import { LeftSidebar } from "@/components/Workspace/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/Workspace/RightSidebar/RightSidebar";
import Toolsbar from "@/components/Workspace/Toolsbar/Toolsbar";
import ZoomIndicator from "@/components/Common/ZoomIndicator";
import { initPixiAppAtom } from "@/stores/pixiStore";
import {
  selectedToolIdAtom,
  isTemporaryHandToolAtom,
} from "@/stores/toolsbarStore";
import {
  zoomInAtom,
  zoomOutAtom,
  panViewportAtom,
} from "@/stores/viewportStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loadWorkspaceDataAtom,
  workspaceDataAtom,
  workspaceStatusAtom,
} from "@/stores";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  /****************
    상태관리 
   * **************/
  const [leftWidth, setLeftWidth] = useState<number>(240);
  const [rightWidth, setRightWidth] = useState<number>(280);
  const [leftVisible, setLeftVisible] = useState<boolean>(true);
  const [rightVisible, setRightVisible] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const selectedToolId = useAtomValue(selectedToolIdAtom);
  const isTemporaryHandTool = useAtomValue(isTemporaryHandToolAtom);
  const zoomIn = useSetAtom(zoomInAtom);
  const zoomOut = useSetAtom(zoomOutAtom);
  const panViewport = useSetAtom(panViewportAtom);

  const isPanningRef = useRef<boolean>(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

  //PIXI JS 관련 atom
  const [, initPixiApp] = useAtom(initPixiAppAtom);

  const containerRef = useRef<HTMLDivElement>(null);

  // 최소 사이드바 크기와 중앙 컨텐츠 최소 크기 설정
  const MIN_SIDEBAR_WIDTH = 200;
  const MIN_CONTENT_WIDTH = 300;

  // ProjectId 가져오기
  const searchParams = useSearchParams();
  let projectId = searchParams.get("projectId");

  // 워크스페이스 관련 아톰
  const workspaceData = useAtomValue(workspaceDataAtom);
  const loadWorkspace = useSetAtom(loadWorkspaceDataAtom);

  useEffect(() => {
    const initWorkspace = async (projectId: string) => {
      await loadWorkspace(projectId);
    };
    if (projectId) {
      initWorkspace(projectId);
    }
  }, [projectId]);

  /**PIXI JS 초기화 */
  useEffect(() => {
    const initializePixi = async () => {
      if (!workspaceData) return;
      await initPixiApp();
    };

    initializePixi();
  }, [workspaceData]);

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

  const handleWorkspacePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const currentTool = isTemporaryHandTool
        ? ToolbarItemIDs.HAND
        : selectedToolId;

      if (currentTool === ToolbarItemIDs.ZOOM_IN) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const mouseX = event.clientX - centerX;
          const mouseY = event.clientY - centerY;

          zoomIn({ x: mouseX, y: mouseY });
        }
        event.preventDefault();
        return;
      }

      if (currentTool === ToolbarItemIDs.ZOOM_OUT) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const mouseX = event.clientX - centerX;
          const mouseY = event.clientY - centerY;

          zoomOut({ x: mouseX, y: mouseY });
        }
        event.preventDefault();
        return;
      }

      if (currentTool === ToolbarItemIDs.HAND) {
        isPanningRef.current = true;
        lastPanPointRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        if (containerRef.current) {
          containerRef.current.setPointerCapture(event.pointerId);
          containerRef.current.style.cursor = "grabbing";
        }
        event.preventDefault();
        return;
      }
    },
    [selectedToolId, isTemporaryHandTool, zoomIn, zoomOut]
  );

  const handleWorkspacePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const currentTool = isTemporaryHandTool
        ? ToolbarItemIDs.HAND
        : selectedToolId;

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
    },
    [selectedToolId, isTemporaryHandTool, panViewport]
  );

  const handleWorkspacePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const currentTool = isTemporaryHandTool
        ? ToolbarItemIDs.HAND
        : selectedToolId;

      if (currentTool === ToolbarItemIDs.HAND && isPanningRef.current) {
        isPanningRef.current = false;
        lastPanPointRef.current = null;
        if (containerRef.current) {
          containerRef.current.releasePointerCapture(event.pointerId);
          containerRef.current.style.cursor = "grab";
        }
        return;
      }
    },
    [selectedToolId, isTemporaryHandTool]
  );

  return (
    <div
      ref={containerRef}
      className="h-screen relative bg-neutral-600"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onPointerDown={handleWorkspacePointerDown}
      onPointerMove={handleWorkspacePointerMove}
      onPointerUp={handleWorkspacePointerUp}
      style={{
        cursor: isTemporaryHandTool
          ? "grab"
          : selectedToolId === ToolbarItemIDs.HAND
          ? "grab"
          : selectedToolId === ToolbarItemIDs.ZOOM_IN
          ? "zoom-in"
          : selectedToolId === ToolbarItemIDs.ZOOM_OUT
          ? "zoom-out"
          : "default",
      }}
    >
      <div>{children}</div>

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
      <ZoomIndicator />
    </div>
  );
}
