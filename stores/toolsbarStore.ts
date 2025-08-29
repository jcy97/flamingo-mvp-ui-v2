import { atom } from "jotai";
import { ToolbarItemIDs } from "@/constants/toolsbarItems";

export const selectedToolIdAtom = atom<string>(ToolbarItemIDs.SELECT);
export const previousToolIdAtom = atom<string>(ToolbarItemIDs.SELECT);
export const isTemporaryHandToolAtom = atom<boolean>(false);
export const isTemporaryZoomInToolAtom = atom<boolean>(false);
export const isTemporaryZoomOutToolAtom = atom<boolean>(false);
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

export const activateTemporaryZoomInToolAtom = atom(null, (get, set) => {
  if (get(isTemporaryZoomInToolAtom) || get(isTemporaryHandToolAtom)) return;

  const currentTool = get(selectedToolIdAtom);
  set(previousToolIdAtom, currentTool);
  set(selectedToolIdAtom, ToolbarItemIDs.ZOOM_IN);
  set(isTemporaryZoomInToolAtom, true);
});

export const deactivateTemporaryZoomInToolAtom = atom(null, (get, set) => {
  if (!get(isTemporaryZoomInToolAtom)) return;

  const previousTool = get(previousToolIdAtom);
  set(selectedToolIdAtom, previousTool);
  set(isTemporaryZoomInToolAtom, false);
});

export const activateTemporaryZoomOutToolAtom = atom(null, (get, set) => {
  if (get(isTemporaryZoomOutToolAtom) || get(isTemporaryHandToolAtom)) return;

  const currentTool = get(selectedToolIdAtom);
  set(previousToolIdAtom, currentTool);
  set(selectedToolIdAtom, ToolbarItemIDs.ZOOM_OUT);
  set(isTemporaryZoomOutToolAtom, true);
});

export const deactivateTemporaryZoomOutToolAtom = atom(null, (get, set) => {
  if (!get(isTemporaryZoomOutToolAtom)) return;

  const previousTool = get(previousToolIdAtom);
  set(selectedToolIdAtom, previousTool);
  set(isTemporaryZoomOutToolAtom, false);
});
