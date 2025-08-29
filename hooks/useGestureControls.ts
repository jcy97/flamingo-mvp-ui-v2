import { useCallback, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import {
  zoomInAtom,
  zoomOutAtom,
  panViewportAtom,
} from "@/stores/viewportStore";

interface UseGestureControlsOptions {
  enabled?: boolean;
  zoomSensitivity?: number;
  panSensitivity?: number;
}

export const useGestureControls = (options: UseGestureControlsOptions = {}) => {
  const {
    enabled = true,
    zoomSensitivity = 0.005,
    panSensitivity = 1.0,
  } = options;

  const zoomIn = useSetAtom(zoomInAtom);
  const zoomOut = useSetAtom(zoomOutAtom);
  const panViewport = useSetAtom(panViewportAtom);

  const containerRef = useRef<HTMLElement | null>(null);
  const lastTouchesRef = useRef<{
    x: number;
    y: number;
    distance: number;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getTouchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchCenter = useCallback((touches: TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled || event.touches.length !== 2) return;

      event.preventDefault();
      event.stopPropagation();

      const center = getTouchCenter(event.touches);
      const distance = getTouchDistance(event.touches);

      lastTouchesRef.current = { x: center.x, y: center.y, distance };
    },
    [enabled, getTouchCenter, getTouchDistance]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || event.touches.length !== 2 || !lastTouchesRef.current)
        return;

      event.preventDefault();
      event.stopPropagation();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!lastTouchesRef.current || !containerRef.current) return;

        const center = getTouchCenter(event.touches);
        const distance = getTouchDistance(event.touches);

        const containerRect = containerRef.current.getBoundingClientRect();
        const isInsideContainer =
          center.x >= containerRect.left &&
          center.x <= containerRect.right &&
          center.y >= containerRect.top &&
          center.y <= containerRect.bottom;

        if (!isInsideContainer) return;

        const centerDelta = {
          x: center.x - lastTouchesRef.current.x,
          y: center.y - lastTouchesRef.current.y,
        };

        const distanceDelta = distance - lastTouchesRef.current.distance;

        if (Math.abs(distanceDelta) > 5) {
          const containerCenterX = containerRect.left + containerRect.width / 2;
          const containerCenterY = containerRect.top + containerRect.height / 2;

          const zoomPoint = {
            x: center.x - containerCenterX,
            y: center.y - containerCenterY,
          };

          if (distanceDelta > 0) {
            zoomIn(zoomPoint);
          } else {
            zoomOut(zoomPoint);
          }
        } else if (Math.abs(centerDelta.x) > 1 || Math.abs(centerDelta.y) > 1) {
          panViewport({
            x: centerDelta.x * panSensitivity,
            y: centerDelta.y * panSensitivity,
          });
        }

        lastTouchesRef.current = { x: center.x, y: center.y, distance };
      });
    },
    [
      enabled,
      getTouchCenter,
      getTouchDistance,
      zoomIn,
      zoomOut,
      panViewport,
      panSensitivity,
    ]
  );

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (event.touches.length < 2) {
      lastTouchesRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enabled || !containerRef.current) return;

      const { ctrlKey, metaKey, deltaX, deltaY, shiftKey } = event;
      const isZoomGesture = ctrlKey || metaKey;
      const isPanGesture =
        !isZoomGesture && (shiftKey || Math.abs(deltaX) > Math.abs(deltaY));

      if (!isZoomGesture && !isPanGesture) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const isInsideContainer =
        event.clientX >= containerRect.left &&
        event.clientX <= containerRect.right &&
        event.clientY >= containerRect.top &&
        event.clientY <= containerRect.bottom;

      if (!isInsideContainer) return;

      event.preventDefault();
      event.stopPropagation();

      if (isZoomGesture) {
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const zoomPoint = {
          x: event.clientX - containerRect.left - centerX,
          y: event.clientY - containerRect.top - centerY,
        };

        if (deltaY < 0) {
          zoomIn(zoomPoint);
        } else {
          zoomOut(zoomPoint);
        }
      } else if (isPanGesture) {
        panViewport({
          x: -deltaX * panSensitivity,
          y: -deltaY * panSensitivity,
        });
      }
    },
    [enabled, zoomIn, zoomOut, panViewport, panSensitivity]
  );

  const attachToElement = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchend", handleTouchEnd, {
      passive: false,
      capture: true,
    });
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
      document.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      });
      document.removeEventListener("touchend", handleTouchEnd, {
        capture: true,
      });
      document.removeEventListener("wheel", handleWheel, { capture: true });

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      document.body.style.touchAction = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  return { attachToElement };
};
