import { atom } from "jotai";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";

export const selectedToolIdAtom = atom<string>(ToolbarItemIDs.SELECT);
export const previousToolIdAtom = atom<string>(ToolbarItemIDs.SELECT);
export const isTemporaryHandToolAtom = atom<boolean>(false);
export const openDropdownAtom = atom<string | null>(null);
export const lastSelectedSubItemsAtom = atom<Record<string, string>>({
  [ToolbarItemIDs.SELECT]: ToolbarItemIDs.SELECT,
  [ToolbarItemIDs.ZOOM_IN]: ToolbarItemIDs.ZOOM_IN,
});

export const activateTemporaryHandToolAtom = atom(null, (get, set) => {
  if (get(isTemporaryHandToolAtom)) return;

  const currentTool = get(selectedToolIdAtom);
  set(previousToolIdAtom, currentTool);
  set(selectedToolIdAtom, ToolbarItemIDs.HAND);
  set(isTemporaryHandToolAtom, true);
});

export const deactivateTemporaryHandToolAtom = atom(null, (get, set) => {
  if (!get(isTemporaryHandToolAtom)) return;

  const previousTool = get(previousToolIdAtom);
  set(selectedToolIdAtom, previousTool);
  set(isTemporaryHandToolAtom, false);
});
