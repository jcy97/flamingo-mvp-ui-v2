import React from "react";
import { useAtom } from "jotai";
import { Eraser, Settings } from "lucide-react";
import {
  eraserSizeAtom,
  eraserOpacityAtom,
  eraserHardnessAtom,
} from "@/stores/eraserStore";

function EraserProperties() {
  const [eraserSize, setEraserSize] = useAtom(eraserSizeAtom);
  const [eraserOpacity, setEraserOpacity] = useAtom(eraserOpacityAtom);
  const [eraserHardness, setEraserHardness] = useAtom(eraserHardnessAtom);

  const getEraserPreviewStyle = () => {
    const size = Math.min(eraserSize, 60);
    const blur = (1 - eraserHardness) * 4;

    return {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: "#ffffff",
      opacity: eraserOpacity,
      filter:
        eraserHardness < 0.99 && blur > 0
          ? `blur(${Math.max(0.1, blur)}px)`
          : "none",
      borderRadius: "50%",
      transition: "all 0.2s ease",
      border: "1px solid #666",
    };
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Eraser size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">지우개</span>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-3">
        <label className="text-xs text-neutral-400 block mb-2">미리보기</label>
        <div className="flex items-center justify-center h-12 bg-neutral-600 rounded relative">
          <div style={getEraserPreviewStyle()} />
        </div>
      </div>

      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Settings size={10} />
            기본 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              크기: {eraserSize}px
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={eraserSize}
              onChange={(e) => setEraserSize(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>1px</span>
              <span>200px</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              불투명도: {Math.round(eraserOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={eraserOpacity * 100}
              onChange={(e) => setEraserOpacity(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              경도: {Math.round(eraserHardness * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={eraserHardness * 100}
              onChange={(e) =>
                setEraserHardness(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>부드러움</span>
              <span>딱딱함</span>
            </div>
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
    </div>
  );
}

export default EraserProperties;
