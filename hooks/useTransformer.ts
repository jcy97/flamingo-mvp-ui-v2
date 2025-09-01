import { useCallback, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  transformerStateAtom,
  activateTransformerAtom,
  deactivateTransformerAtom,
  startDragTransformerAtom,
  updateDragTransformerAtom,
  endDragTransformerAtom,
  startResizeTransformerAtom,
  updateResizeTransformerAtom,
  endResizeTransformerAtom,
  startRotateTransformerAtom,
  updateRotateTransformerAtom,
  endRotateTransformerAtom,
  updateTransformerPositionAtom,
  updateTransformerScaleAtom,
  updateTransformerRotationAtom,
} from "@/stores/transformerStore";
import {
  currentActiveLayerAtom,
  updateLayerAtom,
  layersForCurrentCanvasAtom,
} from "@/stores/layerStore";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { pixiStateAtom } from "@/stores/pixiStore";
import { currentCanvasIdAtom } from "@/stores/canvasStore";
import { Bounds } from "@/types/common";

export interface TransformerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export const useTransformer = () => {
  const [transformerState, setTransformerState] = useAtom(transformerStateAtom);
  const activateTransformer = useSetAtom(activateTransformerAtom);
  const deactivateTransformer = useSetAtom(deactivateTransformerAtom);
  const startDrag = useSetAtom(startDragTransformerAtom);
  const updateDrag = useSetAtom(updateDragTransformerAtom);
  const endDrag = useSetAtom(endDragTransformerAtom);
  const startResize = useSetAtom(startResizeTransformerAtom);
  const updateResize = useSetAtom(updateResizeTransformerAtom);
  const endResize = useSetAtom(endResizeTransformerAtom);
  const startRotate = useSetAtom(startRotateTransformerAtom);
  const updateRotate = useSetAtom(updateRotateTransformerAtom);
  const endRotate = useSetAtom(endRotateTransformerAtom);
  const updatePosition = useSetAtom(updateTransformerPositionAtom);
  const updateScale = useSetAtom(updateTransformerScaleAtom);
  const updateRotation = useSetAtom(updateTransformerRotationAtom);

  const activeLayer = useAtomValue(currentActiveLayerAtom);
  const layers = useAtomValue(layersForCurrentCanvasAtom);
  const setSelectedToolId = useSetAtom(selectedToolIdAtom);
  const updateLayer = useSetAtom(updateLayerAtom);
  const pixiState = useAtomValue(pixiStateAtom);
  const currentCanvasId = useAtomValue(currentCanvasIdAtom);

  const getLayerBounds = useCallback(
    (layerId: string): TransformerBounds | null => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return null;

      if (layer.data.contentBounds) {
        const { minX, minY, maxX, maxY } = layer.data.contentBounds;
        const width = Math.abs(maxX - minX);
        const height = Math.abs(maxY - minY);

        if (width > 0 && height > 0) {
          return {
            x: minX,
            y: minY,
            width: width,
            height: height,
          };
        }
      }

      const layerGraphic = currentCanvasId
        ? pixiState.layerGraphics[currentCanvasId]?.[layerId]
        : null;

      if (layerGraphic?.pixiSprite) {
        return {
          x: layerGraphic.pixiSprite.x,
          y: layerGraphic.pixiSprite.y,
          width: 100, // 기본 너비
          height: 50, // 기본 높이
        };
      }

      return null;
    },
    [layers, pixiState.layerGraphics, currentCanvasId]
  );

  const activateForLayer = useCallback(
    (layerId: string) => {
      const bounds = getLayerBounds(layerId);
      console.log(bounds);
      if (!bounds) return false;

      setSelectedToolId(ToolbarItemIDs.SELECT);
      activateTransformer({ layerId, bounds });
      return true;
    },
    [activateTransformer, getLayerBounds, setSelectedToolId]
  );

  const canActivateTransformer = useCallback(() => {
    return (
      activeLayer &&
      (activeLayer.type === "brush" || activeLayer.type === "text")
    );
  }, [activeLayer]);

  const activateTransformerForActiveLayer = useCallback(() => {
    if (!activeLayer || !canActivateTransformer()) return false;
    return activateForLayer(activeLayer.id);
  }, [activeLayer, activateForLayer, canActivateTransformer]);

  const deactivateTransformerAndApply = useCallback(() => {
    deactivateTransformer();
  }, [deactivateTransformer]);

  const handlePointerDown = useCallback(
    (event: PointerEvent, point: Point) => {
      if (!transformerState.isActive || !transformerState.bounds) return false;

      const bounds = transformerState.bounds;
      const isInsideBounds =
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height;

      if (isInsideBounds) {
        startDrag(point);
        return true;
      }

      return false;
    },
    [transformerState, startDrag]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent, point: Point) => {
      if (transformerState.isDragging) {
        updateDrag(point);
        return true;
      }
      return false;
    },
    [transformerState.isDragging, updateDrag]
  );

  const applyTransformToPixiObject = useCallback(
    (
      position: { x: number; y: number },
      rotation: number,
      scale: { x: number; y: number }
    ) => {
      if (!transformerState.selectedLayerId || !currentCanvasId || !activeLayer)
        return;

      const layerGraphic =
        pixiState.layerGraphics[currentCanvasId]?.[
          transformerState.selectedLayerId
        ];

      const originalBounds = activeLayer.data.contentBounds;

      if (layerGraphic?.pixiSprite && originalBounds) {
        const sprite = layerGraphic.pixiSprite;

        const originalWidth = originalBounds.maxX - originalBounds.minX;
        const originalHeight = originalBounds.maxY - originalBounds.minY;
        const centerX = originalBounds.minX + originalWidth / 2;
        const centerY = originalBounds.minY + originalHeight / 2;

        sprite.pivot.set(centerX, centerY);

        const dragDeltaX = position.x - originalBounds.minX;
        const dragDeltaY = position.y - originalBounds.minY;
        sprite.position.set(centerX + dragDeltaX, centerY + dragDeltaY);

        sprite.rotation = (rotation * Math.PI) / 180;
        sprite.scale.set(scale.x, scale.y);
      }
    },
    [
      transformerState.selectedLayerId,
      currentCanvasId,
      pixiState.layerGraphics,
      activeLayer,
    ]
  );

  const handlePointerUp = useCallback(() => {
    if (transformerState.isDragging) {
      endDrag();
      return true;
    }
    return false;
  }, [transformerState.isDragging, endDrag]);

  const handleResizeStart = useCallback(
    (side: string, initialBounds: TransformerBounds) => {
      startResize(side);
    },
    [startResize]
  );

  const calculateResizedBounds = useCallback(
    (
      initialBounds: TransformerBounds,
      side: string,
      point: Point
    ): TransformerBounds => {
      const bounds = { ...initialBounds };

      if (side.includes("left")) {
        const newX = Math.min(point.x, bounds.x + bounds.width);
        bounds.width = Math.abs(bounds.x + bounds.width - newX);
        bounds.x = newX;
      }
      if (side.includes("right")) {
        bounds.width = Math.abs(point.x - bounds.x);
      }
      if (side.includes("top")) {
        const newY = Math.min(point.y, bounds.y + bounds.height);
        bounds.height = Math.abs(bounds.y + bounds.height - newY);
        bounds.y = newY;
      }
      if (side.includes("bottom")) {
        bounds.height = Math.abs(point.y - bounds.y);
      }

      return bounds;
    },
    []
  );

  const handleResizeMove = useCallback(
    (initialBounds: TransformerBounds, side: string, point: Point) => {
      const newBounds = calculateResizedBounds(initialBounds, side, point);
      updateResize({ bounds: newBounds });
    },
    [calculateResizedBounds, updateResize]
  );

  const handleResizeEnd = useCallback(() => {
    endResize();
  }, [endResize]);

  const handleRotateStart = useCallback(() => {
    startRotate();
  }, [startRotate]);

  const calculateRotation = useCallback(
    (center: Point, point: Point): number => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    },
    []
  );

  const handleRotateMove = useCallback(
    (center: Point, point: Point) => {
      const rotation = calculateRotation(center, point);
      updateRotate(rotation);
    },
    [calculateRotation, updateRotate]
  );

  const handleRotateEnd = useCallback(() => {
    endRotate();
  }, [endRotate]);

  return {
    transformerState,
    canActivateTransformer,
    activateTransformerForActiveLayer,
    deactivateTransformerAndApply,
    activateForLayer,
    getLayerBounds,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleRotateStart,
    handleRotateMove,
    handleRotateEnd,
    updatePosition,
    updateScale,
    updateRotation,
    applyTransformToPixiObject,
  };
};
