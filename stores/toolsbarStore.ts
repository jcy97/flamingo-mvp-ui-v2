import { atom } from "jotai";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";

export const selectedToolIdAtom = atom<string>(ToolbarItemIDs.SELECT);
export const openDropdownAtom = atom<string | null>(null);
export const lastSelectedSubItemsAtom = atom<Record<string, string>>({
  [ToolbarItemIDs.SELECT]: ToolbarItemIDs.SELECT,
  [ToolbarItemIDs.ZOOM_IN]: ToolbarItemIDs.ZOOM_IN,
});
