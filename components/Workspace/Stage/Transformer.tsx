import React, { useCallback, useEffect, useRef } from "react";
import { useTransformer } from "@/hooks/useTransformer";
import { viewportAtom } from "@/stores/viewportStore";
import { useAtomValue } from "jotai";

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_DISTANCE = 24;

interface TransformerProps {
  onResizeStart: (side: string, initialBounds: any) => void;
  onResizeMove: (
    initialBounds: any,
    side: string,
    point: { x: number; y: number }
  ) => void;
  onResizeEnd: () => void;
  onRotateStart: () => void;
  onRotateMove: (
    center: { x: number; y: number },
    point: { x: number; y: number }
  ) => void;
  onRotateEnd: () => void;
  applyTransformToPixiObject: (
    position: { x: number; y: number },
    rotation: number,
    scale: { x: number; y: number }
  ) => void;
}

function Transformer({
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onRotateStart,
  onRotateMove,
  onRotateEnd,
  applyTransformToPixiObject,
}: TransformerProps) {
  const { transformerState } = useTransformer();
  const viewport = useAtomValue(viewportAtom);
  const svgRef = useRef<SVGSVGElement>(null);
  const isResizingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const currentSideRef = useRef<string>("");
  const initialBoundsRef = useRef<any>(null);

  const getTransformedBounds = useCallback(() => {
    if (!transformerState.bounds) return null;

    const { bounds, position, scale } = transformerState;

    return {
      x: position.x,
      y: position.y,
      width: bounds.width * scale.x,
      height: bounds.height * scale.y,
    };
  }, [transformerState]);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const stageElement = document.querySelector(".origin-center");
      if (!stageElement) return { x: clientX, y: clientY };

      const stageRect = stageElement.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;

      const transformedMouseX =
        (clientX - stageCenterX - viewport.x) / viewport.zoom;
      const transformedMouseY =
        (clientY - stageCenterY - viewport.y) / viewport.zoom;

      const canvasCenterX = stageRect.width / 2;
      const canvasCenterY = stageRect.height / 2;

      return {
        x: transformedMouseX + canvasCenterX,
        y: transformedMouseY + canvasCenterY,
      };
    },
    [viewport]
  );

  const getStageTransform = useCallback(() => {
    return `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  }, [viewport]);

  useEffect(() => {
    if (transformerState.isActive && transformerState.bounds) {
      applyTransformToPixiObject(
        transformerState.position,
        transformerState.rotation,
        transformerState.scale
      );
    }
  }, [
    transformerState.position,
    transformerState.rotation,
    transformerState.scale,
    transformerState.isActive,
    transformerState.bounds,
    applyTransformToPixiObject,
  ]);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, side: string) => {
      e.stopPropagation();
      if (!transformerState.bounds) return;

      isResizingRef.current = true;
      currentSideRef.current = side;
      initialBoundsRef.current = { ...transformerState.bounds };

      onResizeStart(side, initialBoundsRef.current);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isResizingRef.current || !initialBoundsRef.current) return;

        const point = getCanvasPoint(moveEvent.clientX, moveEvent.clientY);
        onResizeMove(initialBoundsRef.current, currentSideRef.current, point);
      };

      const handlePointerUp = () => {
        isResizingRef.current = false;
        currentSideRef.current = "";
        initialBoundsRef.current = null;
        onResizeEnd();

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [
      transformerState.bounds,
      onResizeStart,
      onResizeMove,
      onResizeEnd,
      getCanvasPoint,
    ]
  );

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const bounds = getTransformedBounds();
      if (!bounds) return;

      isRotatingRef.current = true;
      onRotateStart();

      const center = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isRotatingRef.current) return;

        const point = getCanvasPoint(moveEvent.clientX, moveEvent.clientY);
        onRotateMove(center, point);
      };

      const handlePointerUp = () => {
        isRotatingRef.current = false;
        onRotateEnd();

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [getTransformedBounds, onRotateStart, onRotateMove, onRotateEnd]
  );

  if (!transformerState.isActive || !transformerState.bounds) {
    return null;
  }

  const bounds = getTransformedBounds();
  if (!bounds) return null;

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const rotateHandleY = bounds.y - ROTATE_HANDLE_DISTANCE;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        transform: getStageTransform(),
        transformOrigin: "center center",
      }}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      >
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          fill="transparent"
          stroke="#0b99ff"
          strokeWidth="1"
          strokeDasharray="2,2"
          style={{
            transform: `rotate(${transformerState.rotation}deg)`,
            transformOrigin: `${centerX}px ${centerY}px`,
          }}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-nwse-resize"
          x={bounds.x - HANDLE_SIZE / 2}
          y={bounds.y - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "top-left")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-ns-resize"
          x={centerX - HANDLE_SIZE / 2}
          y={bounds.y - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "top")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-nesw-resize"
          x={bounds.x + bounds.width - HANDLE_SIZE / 2}
          y={bounds.y - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "top-right")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-ew-resize"
          x={bounds.x - HANDLE_SIZE / 2}
          y={centerY - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "left")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-ew-resize"
          x={bounds.x + bounds.width - HANDLE_SIZE / 2}
          y={centerY - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "right")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-nesw-resize"
          x={bounds.x - HANDLE_SIZE / 2}
          y={bounds.y + bounds.height - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "bottom-left")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-ns-resize"
          x={centerX - HANDLE_SIZE / 2}
          y={bounds.y + bounds.height - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "bottom")}
        />

        <rect
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-nwse-resize"
          x={bounds.x + bounds.width - HANDLE_SIZE / 2}
          y={bounds.y + bounds.height - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          onPointerDown={(e) => handleResizePointerDown(e, "bottom-right")}
        />

        <line
          x1={centerX}
          y1={bounds.y - HANDLE_SIZE / 2}
          x2={centerX}
          y2={rotateHandleY + HANDLE_SIZE / 2}
          stroke="#0b99ff"
          strokeWidth="1"
        />

        <circle
          className="pointer-events-auto fill-white stroke-[#0b99ff] stroke-[1px] cursor-grab"
          cx={centerX}
          cy={rotateHandleY}
          r={HANDLE_SIZE / 2}
          onPointerDown={handleRotatePointerDown}
        />
      </svg>
    </div>
  );
}

export default Transformer;
