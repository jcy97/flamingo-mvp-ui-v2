import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { Pen, Palette, Settings } from "lucide-react";
import {
  penColorAtom,
  penSizeAtom,
  penOpacityAtom,
  penSmoothingAtom,
  penPressureAtom,
} from "@/stores/penStore";
import {
  colorPickerStateAtom,
  brushColorAtom,
  addRecentColorAtom,
} from "@/stores/brushStore";
import PenPreview from "./PenPreview";
import ColorPicker from "../BrushProperties/ColorPicker";

function PenProperties() {
  const [penColor, setPenColor] = useAtom(penColorAtom);
  const [penSize, setPenSize] = useAtom(penSizeAtom);
  const [penOpacity, setPenOpacity] = useAtom(penOpacityAtom);
  const [penSmoothing, setPenSmoothing] = useAtom(penSmoothingAtom);
  const [penPressure, setPenPressure] = useAtom(penPressureAtom);
  const [brushColor, setBrushColor] = useAtom(brushColorAtom);
  const [, addRecentColor] = useAtom(addRecentColorAtom);
  const [colorPickerState, setColorPickerState] = useAtom(colorPickerStateAtom);

  const colorButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!colorPickerState.isOpen && brushColor !== penColor) {
      setPenColor(brushColor);
      addRecentColor(brushColor);
    }
  }, [
    brushColor,
    colorPickerState.isOpen,
    penColor,
    setPenColor,
    addRecentColor,
  ]);

  const handleColorClick = () => {
    if (colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setBrushColor(penColor);
      setColorPickerState({
        isOpen: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        anchorEl: colorButtonRef.current,
      });
    }
  };

  const handleColorPickerClose = () => {
    setColorPickerState({ ...colorPickerState, isOpen: false });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Pen size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">선화</span>
        </div>
      </div>

      <PenPreview />

      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Settings size={10} />
            기본 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">색상</label>
            <button
              ref={colorButtonRef}
              onClick={handleColorClick}
              className="w-full h-8 rounded border border-neutral-600 hover:border-neutral-500 transition-colors flex items-center gap-2 px-2"
              style={{ backgroundColor: penColor }}
            >
              <div
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: penColor === "#ffffff" ? "#000" : "#fff" }}
              >
                <Palette size={12} />
                {penColor.toUpperCase()}
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              굵기: {penSize.toFixed(1)}px
            </label>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={penSize}
              onChange={(e) => setPenSize(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>0.5px</span>
              <span>50px</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              불투명도: {Math.round(penOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={penOpacity * 100}
              onChange={(e) => setPenOpacity(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              스무딩: {Math.round(penSmoothing * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={penSmoothing * 100}
              onChange={(e) => setPenSmoothing(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={penPressure}
                onChange={(e) => setPenPressure(e.target.checked)}
                className="accent-primary-500"
              />
              <span className="text-neutral-400">압력 감도 사용</span>
            </label>
          </div>
        </div>

        <div className="space-y-2 border-t border-neutral-700 pt-3">
          <button className="w-full px-3 py-2 bg-primary-500 hover:bg-primary-400 rounded text-xs font-medium transition-colors">
            프리셋 저장
          </button>
          <button className="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-xs font-medium transition-colors">
            프리셋 불러오기
          </button>
        </div>
      </div>

      <ColorPicker onClose={handleColorPickerClose} />
    </div>
  );
}

export default PenProperties;
