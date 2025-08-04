"use client";
import { LeftSidebar } from "@/components/Workspace/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/Workspace/RightSidebar/RightSidebar";
import Toolsbar from "@/components/Workspace/Toolsbar/Toolsbar";
import { initPixiAppAtom } from "@/stores/pixiStore";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  /*******
   * 상태관리 *
   * *******/
  const [leftWidth, setLeftWidth] = useState<number>(240);
  const [rightWidth, setRightWidth] = useState<number>(280);
  const [leftVisible, setLeftVisible] = useState<boolean>(true);
  const [rightVisible, setRightVisible] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  //PIXI JS 관련 atom
  const [, initPixiApp] = useAtom(initPixiAppAtom);

  const containerRef = useRef<HTMLDivElement>(null);

  // 최소 사이드바 크기와 중앙 컨텐츠 최소 크기 설정
  const MIN_SIDEBAR_WIDTH = 200;
  const MIN_CONTENT_WIDTH = 300;

  /**PIXI JS 초기화 */
  useEffect(() => {
    const initializePixi = async () => {
      await initPixiApp();
    };

    initializePixi();
  }, []);

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
    </div>
  );
}
