import AddButton from "@/components/Common/Button/AddButton";
import { useSetAtom, useAtomValue } from "jotai";
import {
  canvasesForCurrentPageAtom,
  addCanvasAtom,
} from "@/stores/canvasStore";
import { currentPageIdAtom } from "@/stores/pageStore";
import CanvasConfigModal from "@/components/Common/Modal/CanvasConfigModal";
import React, { useState } from "react";

function CanvasHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addCanvas = useSetAtom(addCanvasAtom);
  const currentPageId = useAtomValue(currentPageIdAtom);
  const canvasesForCurrentPage = useAtomValue(canvasesForCurrentPageAtom);

  const handleAddCanvas = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCanvas = async (
    width: number,
    height: number,
    backgroundColor: string
  ) => {
    if (!currentPageId) return;

    await addCanvas({
      pageId: currentPageId,
      name: `캔버스 ${canvasesForCurrentPage.length + 1}`,
      width,
      height,
      backgroundColor,
    });

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
