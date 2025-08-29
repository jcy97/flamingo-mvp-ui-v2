import { useAtomValue } from "jotai";
import {
  selectedToolIdAtom,
  isTemporaryHandToolAtom,
  isTemporaryZoomInToolAtom,
  isTemporaryZoomOutToolAtom,
} from "@/stores/toolsbarStore";
import { brushSettingsAtom } from "@/stores/brushStore";
import { penSettingsAtom } from "@/stores/penStore";
import { eraserSettingsAtom } from "@/stores/eraserStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";
import { createToolCursor } from "@/utils/cursor";

export function useCursor(): string {
  const selectedToolId = useAtomValue(selectedToolIdAtom);
  const isTemporaryHandTool = useAtomValue(isTemporaryHandToolAtom);
  const isTemporaryZoomInTool = useAtomValue(isTemporaryZoomInToolAtom);
  const isTemporaryZoomOutTool = useAtomValue(isTemporaryZoomOutToolAtom);
  const brushSettings = useAtomValue(brushSettingsAtom);
  const penSettings = useAtomValue(penSettingsAtom);
  const eraserSettings = useAtomValue(eraserSettingsAtom);

  let currentTool = selectedToolId;

  if (isTemporaryZoomInTool) {
    currentTool = ToolbarItemIDs.ZOOM_IN;
  } else if (isTemporaryZoomOutTool) {
    currentTool = ToolbarItemIDs.ZOOM_OUT;
  } else if (isTemporaryHandTool) {
    currentTool = ToolbarItemIDs.HAND;
  }

  switch (currentTool) {
    case ToolbarItemIDs.SELECT:
      return "default";

    case ToolbarItemIDs.HAND:
      return "grab";

    case ToolbarItemIDs.PEN:
      return createToolCursor(penSettings.size, penSettings.color);

    case ToolbarItemIDs.BRUSH:
      return createToolCursor(brushSettings.radius, brushSettings.color);

    case ToolbarItemIDs.ERASER:
      return createToolCursor(eraserSettings.size);

    case ToolbarItemIDs.TEXT:
      return "text";

    case ToolbarItemIDs.ZOOM_IN:
      return "zoom-in";

    case ToolbarItemIDs.ZOOM_OUT:
      return "zoom-out";

    default:
      return "default";
  }
}
