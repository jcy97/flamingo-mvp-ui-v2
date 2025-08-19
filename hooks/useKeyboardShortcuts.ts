import { useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { brushRadiusAtom } from "@/stores/brushStore";
import { penSizeAtom } from "@/stores/penStore";
import { eraserSizeAtom } from "@/stores/eraserStore";

interface ShortcutAction {
  key: string | string[];
  action: () => void;
  condition?: () => boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = () => {
  const [selectedToolId, setSelectedToolId] = useAtom(selectedToolIdAtom);
  const [brushSize, setBrushSize] = useAtom(brushRadiusAtom);
  const [penSize, setPenSize] = useAtom(penSizeAtom);
  const [eraserSize, setEraserSize] = useAtom(eraserSizeAtom);
  const isTextEditingRef = useRef(false);

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
        case ToolbarItemIDs.PEN:
          const step = penSize <= 10 ? 1 : penSize <= 20 ? 2 : 4;
          const newPenSize = increase
            ? Math.min(penSize + step, 50)
            : Math.max(penSize - step, 0.5);
          setPenSize(newPenSize);
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
      penSize,
      eraserSize,
      setBrushSize,
      setPenSize,
      setEraserSize,
      calculateSizeStep,
    ]
  );

  const shortcuts: ShortcutAction[] = [
    {
      key: "p",
      action: () => setSelectedToolId(ToolbarItemIDs.PEN),
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
        [
          ToolbarItemIDs.BRUSH,
          ToolbarItemIDs.PEN,
          ToolbarItemIDs.ERASER,
        ].includes(selectedToolId as ToolbarItemIDs),
      preventDefault: true,
    },
    {
      key: "]",
      action: () => adjustToolSize(true),
      condition: () =>
        [
          ToolbarItemIDs.BRUSH,
          ToolbarItemIDs.PEN,
          ToolbarItemIDs.ERASER,
        ].includes(selectedToolId as ToolbarItemIDs),
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return { setIsTextEditing };
};
