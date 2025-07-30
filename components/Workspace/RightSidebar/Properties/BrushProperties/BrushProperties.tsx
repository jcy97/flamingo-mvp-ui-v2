import React, { useRef } from "react";
import { useAtom } from "jotai";
import { Paintbrush, Palette, Settings, RotateCw, Shuffle } from "lucide-react";
import {
  brushColorAtom,
  brushSizeAtom,
  brushHardnessAtom,
  brushOpacityAtom,
  brushSpacingAtom,
  brushFlowAtom,
  brushRoundnessAtom,
  brushAngleAtom,
  brushPressureAtom,
  brushSmoothingAtom,
  brushScatterXAtom,
  brushScatterYAtom,
  brushTextureOpacityAtom,
  brushBlendModeAtom,
  brushPreviewSizeAtom,
  colorPickerStateAtom,
} from "@/stores/brushStore";
import ColorPicker from "./ColorPicker";

function BrushProperties() {
  const [brushColor, setBrushColor] = useAtom(brushColorAtom);
  const [brushSize, setBrushSize] = useAtom(brushSizeAtom);
  const [brushHardness, setBrushHardness] = useAtom(brushHardnessAtom);
  const [brushOpacity, setBrushOpacity] = useAtom(brushOpacityAtom);
  const [brushSpacing, setBrushSpacing] = useAtom(brushSpacingAtom);
  const [brushFlow, setBrushFlow] = useAtom(brushFlowAtom);
  const [brushRoundness, setBrushRoundness] = useAtom(brushRoundnessAtom);
  const [brushAngle, setBrushAngle] = useAtom(brushAngleAtom);
  const [brushPressure, setBrushPressure] = useAtom(brushPressureAtom);
  const [brushSmoothing, setBrushSmoothing] = useAtom(brushSmoothingAtom);
  const [brushScatterX, setBrushScatterX] = useAtom(brushScatterXAtom);
  const [brushScatterY, setBrushScatterY] = useAtom(brushScatterYAtom);
  const [brushTextureOpacity, setBrushTextureOpacity] = useAtom(
    brushTextureOpacityAtom
  );
  const [brushBlendMode, setBrushBlendMode] = useAtom(brushBlendModeAtom);
  const [brushPreviewSize] = useAtom(brushPreviewSizeAtom);
  const [colorPickerState, setColorPickerState] = useAtom(colorPickerStateAtom);

  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const handleColorClick = () => {
    if (colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setColorPickerState({
        isOpen: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        anchorEl: colorButtonRef.current,
      });
    }
  };

  const getBrushPreviewStyle = () => {
    const size = Math.min(brushPreviewSize, 60);
    const blur = (1 - brushHardness) * 4;

    let safeColor = brushColor;
    if (!safeColor || !safeColor.startsWith("#")) {
      safeColor = "#000000";
    }

    return {
      width: `${size}px`,
      height: `${size * brushRoundness}px`,
      backgroundColor: safeColor,
      opacity: brushOpacity * brushTextureOpacity,
      filter:
        brushHardness < 0.99 && blur > 0
          ? `blur(${Math.max(0.1, blur)}px)`
          : "none",
      transform: `rotate(${brushAngle}deg)`,
      borderRadius: "50%",
      transition: "all 0.2s ease",
    };
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Paintbrush size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">브러쉬</span>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-3">
        <label className="text-xs text-neutral-400 block mb-2">미리보기</label>
        <div className="flex items-center justify-center h-12 bg-neutral-600 rounded relative">
          <div style={getBrushPreviewStyle()} />
        </div>
      </div>

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
              style={{ backgroundColor: brushColor }}
            >
              <div
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: brushColor === "#ffffff" ? "#000" : "#fff" }}
              >
                <Palette size={12} />
                {brushColor.toUpperCase()}
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              크기: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>1px</span>
              <span>200px</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              경도: {Math.round(brushHardness * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushHardness * 100}
              onChange={(e) => setBrushHardness(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>부드러움</span>
              <span>딱딱함</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              불투명도: {Math.round(brushOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushOpacity * 100}
              onChange={(e) => setBrushOpacity(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              플로우: {Math.round(brushFlow * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushFlow * 100}
              onChange={(e) => setBrushFlow(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              텍스처 불투명도: {Math.round(brushTextureOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushTextureOpacity * 100}
              onChange={(e) =>
                setBrushTextureOpacity(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              블렌드 모드
            </label>
            <select
              value={brushBlendMode}
              onChange={(e) => setBrushBlendMode(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-300 focus:border-primary-500 focus:outline-none"
            >
              <option value="normal">노말</option>
              <option value="multiply">곱하기</option>
              <option value="screen">스크린</option>
              <option value="overlay">오버레이</option>
              <option value="add">더하기</option>
              <option value="subtract">빼기</option>
              <option value="difference">차이</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <RotateCw size={10} />
            모양 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              간격: {(brushSpacing * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="1"
              max="500"
              value={brushSpacing * 100}
              onChange={(e) => setBrushSpacing(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              원형도: {Math.round(brushRoundness * 100)}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={brushRoundness * 100}
              onChange={(e) =>
                setBrushRoundness(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              각도: {brushAngle}°
            </label>
            <input
              type="range"
              min="0"
              max="359"
              value={brushAngle}
              onChange={(e) => setBrushAngle(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Shuffle size={10} />
            산란 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              X 산란: {brushScatterX.toFixed(1)}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="0.1"
              value={brushScatterX}
              onChange={(e) => setBrushScatterX(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              Y 산란: {brushScatterY.toFixed(1)}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="0.1"
              value={brushScatterY}
              onChange={(e) => setBrushScatterY(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300">동적 설정</h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              스무딩: {Math.round(brushSmoothing * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushSmoothing * 100}
              onChange={(e) =>
                setBrushSmoothing(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={brushPressure}
                onChange={(e) => setBrushPressure(e.target.checked)}
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

      <ColorPicker />
    </div>
  );
}

export default BrushProperties;
