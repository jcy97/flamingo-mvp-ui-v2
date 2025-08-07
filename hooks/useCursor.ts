import { useAtomValue } from "jotai";
import { selectedToolIdAtom } from "@/stores/toolsbarStore";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";

export function useCursor(): string {
  const selectedToolId = useAtomValue(selectedToolIdAtom);

  switch (selectedToolId) {
    case ToolbarItemIDs.SELECT:
      return "default";

    case ToolbarItemIDs.HAND:
      return "grab";

    case ToolbarItemIDs.PEN:
      return "crosshair";

    case ToolbarItemIDs.BRUSH:
      return "crosshair";

    case ToolbarItemIDs.ERASER:
      return "crosshair";

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
