import { useEffect, useCallback, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  selectedToolIdAtom,
  activateTemporaryHandToolAtom,
  deactivateTemporaryHandToolAtom,
  activateTemporaryZoomInToolAtom,
  deactivateTemporaryZoomInToolAtom,
  activateTemporaryZoomOutToolAtom,
  deactivateTemporaryZoomOutToolAtom,
} from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { brushRadiusAtom } from "@/stores/brushStore";
import { eraserSizeAtom } from "@/stores/eraserStore";
import { zoomInAtom, zoomOutAtom } from "@/stores/viewportStore";
import { useTransformer } from "@/hooks/useTransformer";

interface ShortcutAction {
  key: string | string[];
  action: () => void;
  condition?: () => boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = () => {
  const [selectedToolId, setSelectedToolId] = useAtom(selectedToolIdAtom);
  const [brushSize, setBrushSize] = useAtom(brushRadiusAtom);
  const [eraserSize, setEraserSize] = useAtom(eraserSizeAtom);
  const activateTemporaryHandTool = useSetAtom(activateTemporaryHandToolAtom);
  const deactivateTemporaryHandTool = useSetAtom(
    deactivateTemporaryHandToolAtom
  );
  const activateTemporaryZoomInTool = useSetAtom(
    activateTemporaryZoomInToolAtom
  );
  const deactivateTemporaryZoomInTool = useSetAtom(
    deactivateTemporaryZoomInToolAtom
  );
  const activateTemporaryZoomOutTool = useSetAtom(
    activateTemporaryZoomOutToolAtom
  );
  const deactivateTemporaryZoomOutTool = useSetAtom(
    deactivateTemporaryZoomOutToolAtom
  );
  const zoomIn = useSetAtom(zoomInAtom);
  const zoomOut = useSetAtom(zoomOutAtom);
  const {
    canActivateTransformer,
    activateTransformerForActiveLayer,
    deactivateTransformerAndApply,
    transformerState,
  } = useTransformer();
  const isTextEditingRef = useRef(false);
  const spaceKeyPressedRef = useRef(false);
  const zKeyPressedRef = useRef(false);
  const xKeyPressedRef = useRef(false);

  const setIsTextEditing = useCallback((value: boolean) => {
    isTextEditingRef.current = value;
  }, []);

  const calculateSizeStep = useCallback((currentSize: number): number => {
    if (currentSize <= 32) return 4;
    if (currentSize <= 64) return 8;
    return 16;
  }, []);

  const adjustToolSize = useCallback(
    (increase: boolean) => {
      switch (selectedToolId) {
        case ToolbarItemIDs.BRUSH:
          const newBrushSize = increase
            ? Math.min(brushSize + calculateSizeStep(brushSize), 200)
            : Math.max(brushSize - calculateSizeStep(brushSize), 1);
          setBrushSize(newBrushSize);
          break;

        case ToolbarItemIDs.ERASER:
          const newEraserSize = increase
            ? Math.min(eraserSize + calculateSizeStep(eraserSize), 200)
            : Math.max(eraserSize - calculateSizeStep(eraserSize), 1);
          setEraserSize(newEraserSize);
          break;
      }
    },
    [
      selectedToolId,
      brushSize,
      eraserSize,
      setBrushSize,
      setEraserSize,
      calculateSizeStep,
    ]
  );

  const shortcuts: ShortcutAction[] = [
    {
      key: "v",
      action: () => setSelectedToolId(ToolbarItemIDs.SELECT),
      preventDefault: true,
    },

    {
      key: "b",
      action: () => setSelectedToolId(ToolbarItemIDs.BRUSH),
      preventDefault: true,
    },
    {
      key: "e",
      action: () => setSelectedToolId(ToolbarItemIDs.ERASER),
      preventDefault: true,
    },
    {
      key: "t",
      action: () => setSelectedToolId(ToolbarItemIDs.TEXT),
      preventDefault: true,
    },
    {
      key: "[",
      action: () => adjustToolSize(false),
      condition: () =>
        [ToolbarItemIDs.BRUSH, ToolbarItemIDs.ERASER].includes(
          selectedToolId as ToolbarItemIDs
        ),
      preventDefault: true,
    },
    {
      key: "]",
      action: () => adjustToolSize(true),
      condition: () =>
        [ToolbarItemIDs.BRUSH, ToolbarItemIDs.ERASER].includes(
          selectedToolId as ToolbarItemIDs
        ),
      preventDefault: true,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextEditingRef.current) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      const key = event.key.toLowerCase();

      if (event.ctrlKey && key === "t") {
        event.preventDefault();
        if (canActivateTransformer() && !transformerState.isActive) {
          activateTransformerForActiveLayer();
        }
        return;
      }

      if (key === "enter" && transformerState.isActive) {
        event.preventDefault();
        deactivateTransformerAndApply();
        return;
      }

      if (key === " " && !spaceKeyPressedRef.current) {
        event.preventDefault();
        spaceKeyPressedRef.current = true;
        activateTemporaryHandTool();
        return;
      }

      if (key === "z" && !zKeyPressedRef.current) {
        event.preventDefault();
        zKeyPressedRef.current = true;
        activateTemporaryZoomInTool();
        return;
      }

      if (key === "x" && !xKeyPressedRef.current) {
        event.preventDefault();
        xKeyPressedRef.current = true;
        activateTemporaryZoomOutTool();
        return;
      }

      for (const shortcut of shortcuts) {
        const keys = Array.isArray(shortcut.key)
          ? shortcut.key
          : [shortcut.key];
        if (keys.includes(key)) {
          if (shortcut.condition && !shortcut.condition()) continue;

          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isTextEditingRef.current) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      const key = event.key.toLowerCase();

      if (key === " " && spaceKeyPressedRef.current) {
        event.preventDefault();
        spaceKeyPressedRef.current = false;
        deactivateTemporaryHandTool();
        return;
      }

      if (key === "z" && zKeyPressedRef.current) {
        event.preventDefault();
        zKeyPressedRef.current = false;
        deactivateTemporaryZoomInTool();
        return;
      }

      if (key === "x" && xKeyPressedRef.current) {
        event.preventDefault();
        xKeyPressedRef.current = false;
        deactivateTemporaryZoomOutTool();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    shortcuts,
    activateTemporaryHandTool,
    deactivateTemporaryHandTool,
    activateTemporaryZoomInTool,
    deactivateTemporaryZoomInTool,
    activateTemporaryZoomOutTool,
    deactivateTemporaryZoomOutTool,
    zoomIn,
    zoomOut,
    canActivateTransformer,
    activateTransformerForActiveLayer,
    deactivateTransformerAndApply,
    transformerState.isActive,
  ]);

  return {
    setIsTextEditing,
    isZoomInModeActive: () => zKeyPressedRef.current,
    isZoomOutModeActive: () => xKeyPressedRef.current,
  };
};
