import { atom } from "jotai";

export interface TransformerState {
  isActive: boolean;
  selectedLayerId: string | null;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  rotation: number;
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  dragOffset: {
    x: number;
    y: number;
  } | null;
}

export const transformerStateAtom = atom<TransformerState>({
  isActive: false,
  selectedLayerId: null,
  bounds: null,
  rotation: 0,
  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  isDragging: false,
  isResizing: false,
  isRotating: false,
  dragOffset: null,
});

export const activateTransformerAtom = atom(
  null,
  (
    get,
    set,
    {
      layerId,
      bounds,
    }: {
      layerId: string;
      bounds: { x: number; y: number; width: number; height: number };
    }
  ) => {
    set(transformerStateAtom, {
      ...get(transformerStateAtom),
      isActive: true,
      selectedLayerId: layerId,
      bounds,
      position: { x: bounds.x, y: bounds.y },
      rotation: 0,
      scale: { x: 1, y: 1 },
      isDragging: false,
      isResizing: false,
      isRotating: false,
      dragOffset: null,
    });
  }
);

export const deactivateTransformerAtom = atom(null, (get, set) => {
  set(transformerStateAtom, {
    ...get(transformerStateAtom),
    isActive: false,
    selectedLayerId: null,
    bounds: null,
    rotation: 0,
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    isDragging: false,
    isResizing: false,
    isRotating: false,
    dragOffset: null,
  });
});

export const startDragTransformerAtom = atom(
  null,
  (get, set, { x, y }: { x: number; y: number }) => {
    const state = get(transformerStateAtom);
    if (!state.bounds) return;

    set(transformerStateAtom, {
      ...state,
      isDragging: true,
      dragOffset: {
        x: x - state.position.x,
        y: y - state.position.y,
      },
    });
  }
);

export const updateDragTransformerAtom = atom(
  null,
  (get, set, { x, y }: { x: number; y: number }) => {
    const state = get(transformerStateAtom);
    if (!state.isDragging || !state.dragOffset) return;

    const newPosition = {
      x: x - state.dragOffset.x,
      y: y - state.dragOffset.y,
    };

    set(transformerStateAtom, {
      ...state,
      position: newPosition,
    });
  }
);

export const endDragTransformerAtom = atom(null, (get, set) => {
  const state = get(transformerStateAtom);
  set(transformerStateAtom, {
    ...state,
    isDragging: false,
    dragOffset: null,
  });
});

export const startResizeTransformerAtom = atom(
  null,
  (get, set, side: string) => {
    const state = get(transformerStateAtom);
    set(transformerStateAtom, {
      ...state,
      isResizing: true,
    });
  }
);

export const updateResizeTransformerAtom = atom(
  null,
  (
    get,
    set,
    {
      bounds,
      position,
      scale,
    }: {
      bounds: { x: number; y: number; width: number; height: number };
      position?: { x: number; y: number };
      scale?: { x: number; y: number };
    }
  ) => {
    const state = get(transformerStateAtom);
    if (!state.isResizing) return;

    set(transformerStateAtom, {
      ...state,
      bounds,
      position: position || { x: bounds.x, y: bounds.y },
      scale: scale || state.scale,
    });
  }
);

export const endResizeTransformerAtom = atom(null, (get, set) => {
  const state = get(transformerStateAtom);
  set(transformerStateAtom, {
    ...state,
    isResizing: false,
  });
});

export const startRotateTransformerAtom = atom(null, (get, set) => {
  const state = get(transformerStateAtom);
  set(transformerStateAtom, {
    ...state,
    isRotating: true,
  });
});

export const updateRotateTransformerAtom = atom(
  null,
  (get, set, rotation: number) => {
    const state = get(transformerStateAtom);
    if (!state.isRotating) return;

    set(transformerStateAtom, {
      ...state,
      rotation,
    });
  }
);

export const endRotateTransformerAtom = atom(null, (get, set) => {
  const state = get(transformerStateAtom);
  set(transformerStateAtom, {
    ...state,
    isRotating: false,
  });
});

export const updateTransformerPositionAtom = atom(
  null,
  (get, set, { x, y }: { x: number; y: number }) => {
    const state = get(transformerStateAtom);
    if (!state.bounds) return;

    set(transformerStateAtom, {
      ...state,
      position: { x, y },
      bounds: {
        ...state.bounds,
        x,
        y,
      },
    });
  }
);

export const updateTransformerScaleAtom = atom(
  null,
  (get, set, { scaleX, scaleY }: { scaleX: number; scaleY: number }) => {
    const state = get(transformerStateAtom);
    set(transformerStateAtom, {
      ...state,
      scale: { x: scaleX, y: scaleY },
    });
  }
);

export const updateTransformerRotationAtom = atom(
  null,
  (get, set, rotation: number) => {
    const state = get(transformerStateAtom);
    set(transformerStateAtom, {
      ...state,
      rotation,
    });
  }
);
