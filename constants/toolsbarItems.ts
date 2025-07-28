import { ToolsbarItem } from "@/types/toolsbar";
import {
  MousePointer,
  Paintbrush,
  Eraser,
  Type,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Hand,
  Pen,
} from "lucide-react";

export const ToolbarItemIDs = {
  SELECT: "select",
  ZOOM_IN: "zoomin",
  ZOOM_OUT: "zoomout",
  HAND: "hand",
  PEN: "pen",
  BRUSH: "brush",
  ERASER: "eraser",
  TEXT: "text",
  COMMENT: "comment",
};

export const toolbarItems: ToolsbarItem[] = [
  {
    id: ToolbarItemIDs.SELECT,
    label: "선택",
    icon: MousePointer,
    hasSubItems: true,
    subItems: [
      {
        id: ToolbarItemIDs.SELECT,
        label: "선택",
        icon: MousePointer,
      },
      {
        id: ToolbarItemIDs.HAND,
        label: "이동",
        icon: Hand,
      },
    ],
  },
  {
    id: ToolbarItemIDs.ZOOM_IN,
    label: "확대",
    icon: ZoomIn,
    hasSubItems: true,
    subItems: [
      {
        id: ToolbarItemIDs.ZOOM_IN,
        label: "확대",
        icon: ZoomIn,
      },
      {
        id: ToolbarItemIDs.ZOOM_OUT,
        label: "축소",
        icon: ZoomOut,
      },
    ],
  },
  {
    id: ToolbarItemIDs.PEN,
    label: "Pen",
    icon: Pen,
  },
  {
    id: ToolbarItemIDs.BRUSH,
    label: "Brush",
    icon: Paintbrush,
  },
  {
    id: ToolbarItemIDs.ERASER,
    label: "Eraser",
    icon: Eraser,
  },
  {
    id: ToolbarItemIDs.TEXT,
    label: "Text",
    icon: Type,
  },
  {
    id: ToolbarItemIDs.COMMENT,
    label: "Comment",
    icon: MessageSquare,
  },
];
