import { useCallback } from "react";
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
import { pixiStateAtom, transformLayerContentAtom } from "@/stores/pixiStore";
import { currentCanvasIdAtom } from "@/stores/canvasStore";
import { viewportAtom } from "@/stores/viewportStore";

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
  const transformLayerContent = useSetAtom(transformLayerContentAtom);

  const activeLayer = useAtomValue(currentActiveLayerAtom);
  const layers = useAtomValue(layersForCurrentCanvasAtom);
  const setSelectedToolId = useSetAtom(selectedToolIdAtom);
  const updateLayer = useSetAtom(updateLayerAtom);
  const pixiState = useAtomValue(pixiStateAtom);
  const currentCanvasId = useAtomValue(currentCanvasIdAtom);

  const getLayerBounds = useCallback(
    (layerId: string): TransformerBounds | null => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer?.data.contentBounds) return null;
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
      return null;
    },
    [layers]
  );

  const activateForLayer = useCallback(
    (layerId: string) => {
      const bounds = getLayerBounds(layerId);
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
    if (
      transformerState.isActive &&
      transformerState.selectedLayerId &&
      activeLayer &&
      transformerState.bounds
    ) {
      const { position, scale, rotation, bounds, selectedLayerId } =
        transformerState;

      const originalBounds = activeLayer.data.contentBounds;
      if (!originalBounds) return;

      const originalWidth = originalBounds.maxX - originalBounds.minX;
      const originalHeight = originalBounds.maxY - originalBounds.minY;
      const originalCenterX = originalBounds.minX + originalWidth / 2;
      const originalCenterY = originalBounds.minY + originalHeight / 2;

      const pivot = {
        x: originalCenterX,
        y: originalCenterY,
      };

      const transformedWidth = originalWidth * scale.x;
      const transformedHeight = originalHeight * scale.y;

      const newBounds = {
        minX: position.x,
        minY: position.y,
        maxX: position.x + transformedWidth,
        maxY: position.y + transformedHeight,
      };

      transformLayerContent({
        layerId: selectedLayerId,
        scale,
        rotation,
        pivot,
        newBounds,
      });

      updateLayer({
        layerId: selectedLayerId,
        updates: {
          data: { ...activeLayer.data, contentBounds: newBounds },
        },
      });
    }
    deactivateTransformer();
  }, [
    deactivateTransformer,
    transformerState,
    activeLayer,
    updateLayer,
    transformLayerContent,
  ]);
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

  const handlePointerUp = useCallback(() => {
    if (transformerState.isDragging) {
      endDrag();
      return true;
    }
    return false;
  }, [transformerState.isDragging, endDrag]);

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

        const newCenterX =
          position.x +
          ((originalBounds.maxX - originalBounds.minX) * scale.x) / 2;
        const newCenterY =
          position.y +
          ((originalBounds.maxY - originalBounds.minY) * scale.y) / 2;
        sprite.position.set(newCenterX, newCenterY);

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

      const originalWidth = initialBounds.width || 1;
      const originalHeight = initialBounds.height || 1;

      const scaleX = newBounds.width / originalWidth;
      const scaleY = newBounds.height / originalHeight;

      updateResize({
        bounds: newBounds,
        position: { x: newBounds.x, y: newBounds.y },
        scale: { x: scaleX, y: scaleY },
      });
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
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      return angle + 90;
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
