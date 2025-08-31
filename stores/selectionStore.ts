import { atom } from "jotai";

export interface SelectionState {
  isActive: boolean;
  selectedElementType: "speechBubble" | "layer" | null;
  selectedElementId: string | null;
  isDragging: boolean;
  dragStartPoint: { x: number; y: number } | null;
  dragOffset: { x: number; y: number } | null;
}

export const DEFAULT_SELECTION_STATE: SelectionState = {
  isActive: false,
  selectedElementType: null,
  selectedElementId: null,
  isDragging: false,
  dragStartPoint: null,
  dragOffset: null,
};

export const selectionStateAtom = atom<SelectionState>(DEFAULT_SELECTION_STATE);

export const isSelectionActiveAtom = atom(
  (get) => get(selectionStateAtom).isActive,
  (get, set, isActive: boolean) => {
    const current = get(selectionStateAtom);
    set(selectionStateAtom, { ...current, isActive });
  }
);

export const selectedElementAtom = atom(
  (get) => {
    const state = get(selectionStateAtom);
    return {
      type: state.selectedElementType,
      id: state.selectedElementId,
    };
  },
  (
    get,
    set,
    element: {
      type: "speechBubble" | "layer" | null;
      id: string | null;
    }
  ) => {
    const current = get(selectionStateAtom);
    set(selectionStateAtom, {
      ...current,
      selectedElementType: element.type,
      selectedElementId: element.id,
    });
  }
);

export const isDraggingAtom = atom(
  (get) => get(selectionStateAtom).isDragging,
  (get, set, isDragging: boolean) => {
    const current = get(selectionStateAtom);
    set(selectionStateAtom, { ...current, isDragging });
  }
);

export const dragStateAtom = atom(
  (get) => {
    const state = get(selectionStateAtom);
    return {
      isDragging: state.isDragging,
      startPoint: state.dragStartPoint,
      offset: state.dragOffset,
    };
  },
  (
    get,
    set,
    dragState: {
      startPoint: { x: number; y: number } | null;
      offset: { x: number; y: number } | null;
    }
  ) => {
    const current = get(selectionStateAtom);
    set(selectionStateAtom, {
      ...current,
      dragStartPoint: dragState.startPoint,
      dragOffset: dragState.offset,
    });
  }
);

export const startDragAtom = atom(
  null,
  (get, set, startPoint: { x: number; y: number }) => {
    const current = get(selectionStateAtom);
    set(selectionStateAtom, {
      ...current,
      isDragging: true,
      dragStartPoint: startPoint,
    });
  }
);

export const updateDragAtom = atom(
  null,
  (get, set, currentPoint: { x: number; y: number }) => {
    const current = get(selectionStateAtom);
    if (!current.dragStartPoint) return;

    const offset = {
      x: currentPoint.x - current.dragStartPoint.x,
      y: currentPoint.y - current.dragStartPoint.y,
    };

    set(selectionStateAtom, {
      ...current,
      dragOffset: offset,
    });
  }
);

export const endDragAtom = atom(null, (get, set) => {
  const current = get(selectionStateAtom);
  set(selectionStateAtom, {
    ...current,
    isDragging: false,
    dragStartPoint: null,
    dragOffset: null,
  });
});

export const clearSelectionAtom = atom(null, (get, set) => {
  set(selectionStateAtom, DEFAULT_SELECTION_STATE);
});

export const selectElementAtom = atom(
  null,
  (get, set, element: { type: "speechBubble" | "layer"; id: string }) => {
    set(selectionStateAtom, {
      ...DEFAULT_SELECTION_STATE,
      isActive: true,
      selectedElementType: element.type,
      selectedElementId: element.id,
    });
  }
);

export const activateSelectionModeAtom = atom(null, (get, set) => {
  const current = get(selectionStateAtom);
  set(selectionStateAtom, {
    ...current,
    isActive: true,
  });
});

export const deactivateSelectionModeAtom = atom(null, (get, set) => {
  set(selectionStateAtom, DEFAULT_SELECTION_STATE);
});
