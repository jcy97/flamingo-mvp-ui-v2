import {
  MousePointer,
  PenTool,
  Brush,
  Eraser,
  Type,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Image,
  Move,
  Hand,
  ZoomIn,
  ZoomOut,
  Pipette,
  Pencil,
  LucideIcon,
} from "lucide-react";
import { ToolsbarItem } from "@/types/toolsbar";

export enum ToolbarItemIDs {
  SELECT = "select",
  PEN = "pen",
  BRUSH = "brush",
  ERASER = "eraser",
  TEXT = "text",
  CIRCLE = "circle",
  SQUARE = "square",
  TRIANGLE = "triangle",
  POLYGON = "polygon",
  IMAGE = "image",
  MOVE = "move",
  HAND = "hand",
  ZOOM_IN = "zoom-in",
  ZOOM_OUT = "zoom-out",
  COLOR_PICKER = "color-picker",
  PENCIL = "pencil",
}

export const toolbarItems: ToolsbarItem[] = [
  {
    id: ToolbarItemIDs.SELECT,
    label: "선택",
    icon: MousePointer,
    hasSubItems: true,
    subItems: [
      { id: ToolbarItemIDs.SELECT, label: "선택", icon: MousePointer },
      { id: ToolbarItemIDs.MOVE, label: "이동", icon: Move },
      { id: ToolbarItemIDs.HAND, label: "손", icon: Hand },
    ],
  },
  // {
  //   id: ToolbarItemIDs.PEN,
  //   label: "선화",
  //   icon: Pencil,
  // },
  {
    id: ToolbarItemIDs.BRUSH,
    label: "브러쉬",
    icon: Brush,
  },
  {
    id: ToolbarItemIDs.ERASER,
    label: "지우개",
    icon: Eraser,
  },
  {
    id: ToolbarItemIDs.TEXT,
    label: "텍스트",
    icon: Type,
  },
  {
    id: ToolbarItemIDs.CIRCLE,
    label: "도형",
    icon: Circle,
    hasSubItems: true,
    subItems: [
      { id: ToolbarItemIDs.CIRCLE, label: "원", icon: Circle },
      { id: ToolbarItemIDs.SQUARE, label: "사각형", icon: Square },
      { id: ToolbarItemIDs.TRIANGLE, label: "삼각형", icon: Triangle },
      { id: ToolbarItemIDs.POLYGON, label: "다각형", icon: Hexagon },
    ],
  },
  {
    id: ToolbarItemIDs.ZOOM_IN,
    label: "확대",
    icon: ZoomIn,
    hasSubItems: true,
    subItems: [
      { id: ToolbarItemIDs.ZOOM_IN, label: "확대", icon: ZoomIn },
      { id: ToolbarItemIDs.ZOOM_OUT, label: "축소", icon: ZoomOut },
    ],
  },
  {
    id: ToolbarItemIDs.COLOR_PICKER,
    label: "색 추출",
    icon: Pipette,
  },
];
