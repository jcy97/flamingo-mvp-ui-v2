import { useAtomValue } from "jotai";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { eraserSettingsAtom } from "@/stores/eraserStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { createToolCursor } from "@/utils/cursor";

export function useCursor(): string {
  const selectedToolId = useAtomValue(selectedToolIdAtom);
  const brushSettings = useAtomValue(brushSettingsAtom);
  const penSettings = useAtomValue(penSettingsAtom);
  const eraserSettings = useAtomValue(eraserSettingsAtom);

  switch (selectedToolId) {
    case ToolbarItemIDs.SELECT:
      return "default";

    case ToolbarItemIDs.HAND:
      return "grab";

    case ToolbarItemIDs.PEN:
      return createToolCursor(penSettings.size, penSettings.color);

    case ToolbarItemIDs.BRUSH:
      return createToolCursor(brushSettings.size, brushSettings.color);

    case ToolbarItemIDs.ERASER:
      return createToolCursor(eraserSettings.size);

    case ToolbarItemIDs.TEXT:
      return "text";

    case ToolbarItemIDs.ZOOM_IN:
      return "zoom-in";

    case ToolbarItemIDs.ZOOM_OUT:
      return "zoom-out";

    case ToolbarItemIDs.COMMENT:
      return "pointer";

    default:
      return "default";
  }
}
