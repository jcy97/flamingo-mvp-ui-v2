import { useAtom } from "jotai";
import { useMemo } from "react";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { eraserSettingsAtom } from "@/stores/eraserStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { createToolCursor, getDefaultCursor } from "@/utils/cursor";

export function useCursor() {
  const [selectedToolId] = useAtom(selectedToolIdAtom);
  const [brushSettings] = useAtom(brushSettingsAtom);
  const [penSettings] = useAtom(penSettingsAtom);
  const [eraserSettings] = useAtom(eraserSettingsAtom);

  const cursorStyle = useMemo(() => {
    switch (selectedToolId) {
      case ToolbarItemIDs.PEN:
        return createToolCursor(penSettings.size, penSettings.color);

      case ToolbarItemIDs.BRUSH:
        return createToolCursor(brushSettings.size, brushSettings.color);

      case ToolbarItemIDs.ERASER:
        return createToolCursor(eraserSettings.size);

      default:
        return getDefaultCursor();
    }
  }, [
    selectedToolId,
    penSettings.size,
    penSettings.color,
    brushSettings.size,
    brushSettings.color,
    eraserSettings.size,
  ]);

  return cursorStyle;
}
