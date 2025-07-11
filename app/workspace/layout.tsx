"use client";
import { useCallback, useRef, useState } from "react";

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

  // 최소 사이드바 크기와 중앙 컨텐츠 최소 크기 설정
  const MIN_SIDEBAR_WIDTH = 200;
  const MIN_CONTENT_WIDTH = 300; // 중앙 컨텐츠 영역 최소 크기

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
        // 좌측 사이드바 리사이징
        // 최대 크기: 전체 너비 - 우측 사이드바 크기 - 최소 컨텐츠 크기
        const maxLeftWidth =
          leftVisible && rightVisible
            ? containerWidth - rightWidth - MIN_CONTENT_WIDTH
            : rightVisible
            ? containerWidth - rightWidth - MIN_CONTENT_WIDTH
            : containerWidth - MIN_CONTENT_WIDTH;

        const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxLeftWidth, x));
        setLeftWidth(newWidth);
      } else if (isDragging === "right") {
        // 우측 사이드바 리사이징
        // 최대 크기: 전체 너비 - 좌측 사이드바 크기 - 최소 컨텐츠 크기
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

  // 사이드바 토글 시 크기 재조정
  const toggleLeftSidebar = useCallback(() => {
    if (leftVisible) {
      setLeftVisible(false);
    } else {
      setLeftVisible(true);
      // 토글 시 겹침 방지 체크
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
      // 토글 시 겹침 방지 체크
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
      <div className="w-full h-full bg-gray-100">{children}</div>

      {/* Left Sidebar */}
      {!leftVisible && (
        <button
          onClick={toggleLeftSidebar}
          className="absolute top-4 left-4 z-30 text-neutral-100 p-2 bg-neutral-900 border rounded shadow-sm hover:bg-primary-500"
        >
          →
        </button>
      )}
      {leftVisible && (
        <>
          <div
            className="absolute top-0 left-0 h-full bg-neutral-900 border-r z-20 overflow-hidden"
            style={{ width: leftWidth }}
          >
            <div className="p-4 text-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Left Sidebar</h3>
                <button
                  onClick={toggleLeftSidebar}
                  className="p-1 hover:bg-primary-500 rounded"
                >
                  ←
                </button>
              </div>
              페이지 & 캔버스
            </div>
          </div>
          <div
            className={`absolute top-0 h-full w-1 bg-gray-200 hover:bg-primary-500 cursor-col-resize z-30 ${
              isDragging === "left" ? "bg-primary-500" : ""
            }`}
            style={{ left: leftWidth }}
            onMouseDown={handleMouseDown("left")}
          />
        </>
      )}

      {/* Right Sidebar */}
      {!rightVisible && (
        <button
          onClick={toggleRightSidebar}
          className="absolute top-4 right-4 z-30 p-2 text-neutral-100 bg-neutral-900 border rounded shadow-sm hover:bg-primary-500"
        >
          ←
        </button>
      )}
      {rightVisible && (
        <>
          <div
            className={`absolute top-0 h-full w-1 bg-gray-200 hover:bg-primary-500 cursor-col-resize z-30 ${
              isDragging === "right" ? "bg-primary-500" : ""
            }`}
            style={{ right: rightWidth }}
            onMouseDown={handleMouseDown("right")}
          />
          <div
            className="absolute top-0 right-0 h-full bg-neutral-900 border-l z-20 overflow-hidden"
            style={{ width: rightWidth }}
          >
            <div className="p-4 text-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Right Sidebar</h3>
                <button
                  onClick={toggleRightSidebar}
                  className="p-1 hover:bg-primary-500 rounded"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
