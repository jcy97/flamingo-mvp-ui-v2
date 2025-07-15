import AddButton from "@/components/Common/Button/AddButton";
import { useSetAtom } from "jotai";
import { addPageAtom } from "@/stores/pageStore";
import { autoSelectFirstCanvasAtom } from "@/stores/canvasStore";
import React from "react";

function PageHeader() {
  const addPage = useSetAtom(addPageAtom);
  const autoSelectFirstCanvas = useSetAtom(autoSelectFirstCanvasAtom);

  const handleAddPage = () => {
    addPage();
    autoSelectFirstCanvas();
  };

  return (
    <div className="flex items-center justify-start gap-2">
      <p className="text-xs font-bold">페이지</p>
      <div onClick={handleAddPage}>
        <AddButton />
      </div>
    </div>
  );
}

export default PageHeader;
