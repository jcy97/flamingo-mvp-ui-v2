import AddButton from "@/components/Common/Button/AddButton";
import { useSetAtom, useAtomValue } from "jotai";
import {
  canvasesAtom,
  canvasesForCurrentPageAtom,
  setCurrentCanvasAtom,
  currentCanvasIdAtom,
} from "@/stores/canvasStore";
import { currentPageIdAtom } from "@/stores/pageStore";
import {
  createCanvasContainerAtom,
  switchCanvasAtom,
} from "@/stores/pixiStore";
import { addLayerAtom } from "@/stores/layerStore";
import CanvasConfigModal from "@/components/Common/Modal/CanvasConfigModal";
import React, { useState } from "react";
import sampleData from "@/samples/data";
import { Canvas } from "@/types/canvas";

function CanvasHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setCanvases = useSetAtom(canvasesAtom);
  const setCurrentCanvas = useSetAtom(setCurrentCanvasAtom);
  const setCurrentCanvasId = useSetAtom(currentCanvasIdAtom);
  const createCanvasContainer = useSetAtom(createCanvasContainerAtom);
  const switchCanvas = useSetAtom(switchCanvasAtom);
  const addLayer = useSetAtom(addLayerAtom);
  const currentPageId = useAtomValue(currentPageIdAtom);
  const canvasesForCurrentPage = useAtomValue(canvasesForCurrentPageAtom);

  const handleAddCanvas = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCanvas = (
    width: number,
    height: number,
    backgroundColor: string
  ) => {
    if (!currentPageId) return;

    const newCanvasId = `canvas-${String(Date.now()).slice(-3)}`;

    const newCanvas: Canvas = {
      id: newCanvasId,
      pageId: currentPageId,
      name: `캔버스 ${canvasesForCurrentPage.length + 1}`,
      order: canvasesForCurrentPage.length + 1,
      width,
      height,
      unit: "px",
      backgroundColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCanvases = [...sampleData.canvases, newCanvas];
    sampleData.canvases = updatedCanvases;
    setCanvases(updatedCanvases);

    setCurrentCanvasId(newCanvasId);

    createCanvasContainer({
      pageId: currentPageId,
      canvasId: newCanvasId,
    });

    switchCanvas(newCanvasId);

    setTimeout(() => {
      addLayer();
    }, 100);

    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-start gap-2">
        <p className="text-xs font-bold">캔버스</p>
        <div onClick={handleAddCanvas}>
          <AddButton />
        </div>
      </div>
      <CanvasConfigModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCanvas}
        mode="create"
      />
    </>
  );
}

export default CanvasHeader;
