import { atom } from "jotai";

export interface ViewportState {
  zoom: number;
  x: number;
  y: number;
}

export const viewportAtom = atom<ViewportState>({
  zoom: 1.0,
  x: 0,
  y: 0,
});

export const showZoomIndicatorAtom = atom<boolean>(false);

export const setViewportAtom = atom(
  null,
  (get, set, update: Partial<ViewportState>) => {
    const current = get(viewportAtom);
    set(viewportAtom, {
      ...current,
      ...update,
    });
  }
);

export const zoomInAtom = atom(
  null,
  (get, set, point?: { x: number; y: number }) => {
    const current = get(viewportAtom);
    const zoomFactor = 1.2;
    const newZoom = Math.min(current.zoom * zoomFactor, 10);

    if (point && current.zoom !== newZoom) {
      const zoomDelta = newZoom - current.zoom;
      const newX = current.x - point.x * zoomDelta;
      const newY = current.y - point.y * zoomDelta;

      set(viewportAtom, {
        zoom: newZoom,
        x: newX,
        y: newY,
      });
    } else {
      set(viewportAtom, {
        ...current,
        zoom: newZoom,
      });
    }

    set(showZoomIndicatorAtom, true);
    setTimeout(() => set(showZoomIndicatorAtom, false), 1500);
  }
);

export const zoomOutAtom = atom(
  null,
  (get, set, point?: { x: number; y: number }) => {
    const current = get(viewportAtom);
    const zoomFactor = 1 / 1.2;
    const newZoom = Math.max(current.zoom * zoomFactor, 0.1);

    if (point && current.zoom !== newZoom) {
      const zoomDelta = newZoom - current.zoom;
      const newX = current.x - point.x * zoomDelta;
      const newY = current.y - point.y * zoomDelta;

      set(viewportAtom, {
        zoom: newZoom,
        x: newX,
        y: newY,
      });
    } else {
      set(viewportAtom, {
        ...current,
        zoom: newZoom,
      });
    }

    set(showZoomIndicatorAtom, true);
    setTimeout(() => set(showZoomIndicatorAtom, false), 1500);
  }
);

export const resetZoomAtom = atom(null, (get, set) => {
  set(viewportAtom, {
    zoom: 1.0,
    x: 0,
    y: 0,
  });
});

export const panViewportAtom = atom(
  null,
  (get, set, delta: { x: number; y: number }) => {
    const current = get(viewportAtom);
    set(viewportAtom, {
      ...current,
      x: current.x + delta.x,
      y: current.y + delta.y,
    });
  }
);
