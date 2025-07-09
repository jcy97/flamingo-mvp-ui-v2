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
      const x = e.clientX - rect.left;

      if (isDragging === "left") {
        const newWidth = Math.max(200, Math.min(400, x));
        setLeftWidth(newWidth);
      } else if (isDragging === "right") {
        const newWidth = Math.max(200, Math.min(400, rect.width - x));
        setRightWidth(newWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

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
          onClick={() => setLeftVisible(true)}
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
                  onClick={() => setLeftVisible(false)}
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
          onClick={() => setRightVisible(true)}
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
                  onClick={() => setRightVisible(false)}
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
