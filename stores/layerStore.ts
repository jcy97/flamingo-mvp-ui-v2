import { atom } from "jotai";
import { Layer } from "@/types/layer";
import sampleData from "@/samples/data";
import { currentCanvasIdAtom } from "./canvasStore";

export const layersAtom = atom<Layer[]>(sampleData.layers);

export const layersForCurrentCanvasAtom = atom((get) => {
  const layers = get(layersAtom);
  const currentCanvasId = get(currentCanvasIdAtom);
  if (!currentCanvasId) return [];
  return layers
    .filter((layer) => layer.canvasId === currentCanvasId)
    .sort((a, b) => a.order - b.order);
});

export const addLayerAtom = atom(null, (get, set) => {
  const currentCanvasId = get(currentCanvasIdAtom);
  if (!currentCanvasId) return;

  const layers = get(layersAtom);
  const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
  const newLayerId = `layer-${String(Date.now()).slice(-3)}`;

  const newLayer: Layer = {
    id: newLayerId,
    canvasId: currentCanvasId,
    name: `새 레이어 ${layersForCurrentCanvas.length + 1}`,
    order: layersForCurrentCanvas.length,
    type: "shape",
    blendMode: "normal",
    opacity: 1,
    isVisible: true,
    isLocked: false,
    data: {
      shapeType: "rectangle",
      shapeProperties: {
        fillColor: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 1,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedLayers = [...layers, newLayer];
  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);
});

export const updateLayerAtom = atom(
  null,
  (
    get,
    set,
    { layerId, updates }: { layerId: string; updates: Partial<Layer> }
  ) => {
    const layers = get(layersAtom);
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId
        ? { ...layer, ...updates, updatedAt: new Date() }
        : layer
    );

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);
  }
);

export const deleteLayerAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const updatedLayers = layers.filter((layer) => layer.id !== layerId);

  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);
});

export const toggleLayerVisibilityAtom = atom(
  null,
  (get, set, layerId: string) => {
    const layers = get(layersAtom);
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId
        ? { ...layer, isVisible: !layer.isVisible, updatedAt: new Date() }
        : layer
    );

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);
  }
);

export const toggleLayerLockAtom = atom(null, (get, set, layerId: string) => {
  const layers = get(layersAtom);
  const updatedLayers = layers.map((layer) =>
    layer.id === layerId
      ? { ...layer, isLocked: !layer.isLocked, updatedAt: new Date() }
      : layer
  );

  sampleData.layers = updatedLayers;
  set(layersAtom, updatedLayers);
});

export const reorderLayersAtom = atom(
  null,
  (
    get,
    set,
    { dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }
  ) => {
    const layers = get(layersAtom);
    const layersForCurrentCanvas = get(layersForCurrentCanvasAtom);
    const currentCanvasId = get(currentCanvasIdAtom);

    if (!currentCanvasId) return;

    const draggedLayer = layersForCurrentCanvas[dragIndex];
    const newLayersForCanvas = [...layersForCurrentCanvas];

    newLayersForCanvas.splice(dragIndex, 1);
    newLayersForCanvas.splice(hoverIndex, 0, draggedLayer);

    const reorderedLayersForCanvas = newLayersForCanvas.map((layer, index) => ({
      ...layer,
      order: index,
    }));

    const otherLayers = layers.filter(
      (layer) => layer.canvasId !== currentCanvasId
    );
    const updatedLayers = [...otherLayers, ...reorderedLayersForCanvas];

    sampleData.layers = updatedLayers;
    set(layersAtom, updatedLayers);
  }
);
