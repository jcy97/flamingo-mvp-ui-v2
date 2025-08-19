import React, { useRef } from "react";
import { useAtom } from "jotai";
import { Paintbrush, Palette, Settings, RotateCw } from "lucide-react";
import {
  brushColorAtom,
  brushRadiusAtom,
  brushHardnessAtom,
  brushOpacityAtom,
  brushSpacingAtom,
  brushJitterAtom,
  brushRoundnessAtom,
  brushAngleAtom,
  brushPressureOpacityAtom,
  brushPressureSizeAtom,
  brushSpeedSizeAtom,
  brushSmudgeLengthAtom,
  brushSmudgeRadiusAtom,
  brushPreviewSizeAtom,
  colorPickerStateAtom,
  applyBrushPresetAtom,
  currentBrushPresetAtom,
} from "@/stores/brushStore";
import { BRUSH_PRESETS } from "@/types/brush";
import ColorPicker from "./ColorPicker";

function BrushProperties() {
  const [currentPreset] = useAtom(currentBrushPresetAtom);
  const [, applyPreset] = useAtom(applyBrushPresetAtom);
  const [brushColor, setBrushColor] = useAtom(brushColorAtom);
  const [brushRadius, setBrushRadius] = useAtom(brushRadiusAtom);
  const [brushHardness, setBrushHardness] = useAtom(brushHardnessAtom);
  const [brushOpacity, setBrushOpacity] = useAtom(brushOpacityAtom);
  const [brushSpacing, setBrushSpacing] = useAtom(brushSpacingAtom);
  const [brushJitter, setBrushJitter] = useAtom(brushJitterAtom);
  const [brushRoundness, setBrushRoundness] = useAtom(brushRoundnessAtom);
  const [brushAngle, setBrushAngle] = useAtom(brushAngleAtom);
  const [brushPressureOpacity, setBrushPressureOpacity] = useAtom(
    brushPressureOpacityAtom
  );
  const [brushPressureSize, setBrushPressureSize] = useAtom(
    brushPressureSizeAtom
  );
  const [brushSpeedSize, setBrushSpeedSize] = useAtom(brushSpeedSizeAtom);
  const [brushSmudgeLength, setBrushSmudgeLength] = useAtom(
    brushSmudgeLengthAtom
  );
  const [brushSmudgeRadius, setBrushSmudgeRadius] = useAtom(
    brushSmudgeRadiusAtom
  );
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

  const handlePresetChange = (presetId: string) => {
    applyPreset(presetId);
  };

  const getBrushPreviewStyle = () => {
    const size = Math.min(brushPreviewSize, 40);
    const blur = (1 - brushHardness) * 3;

    let safeColor = brushColor;
    if (!safeColor || !safeColor.startsWith("#")) {
      safeColor = "#000000";
    }

    return {
      width: `${size}px`,
      height: `${size * brushRoundness}px`,
      backgroundColor: safeColor,
      opacity: brushOpacity,
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
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Paintbrush size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">브러쉬</span>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-neutral-700 rounded-lg p-2">
        <div className="flex-shrink-0 w-16 h-12 bg-neutral-600 rounded flex items-center justify-center relative">
          <div style={getBrushPreviewStyle()} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-neutral-400 block mb-1">프리셋</label>
          <select
            value={currentPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-neutral-600 border border-neutral-500 text-white text-xs rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {BRUSH_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
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
              반경: {brushRadius.toFixed(1)}px
            </label>
            <input
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
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
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <RotateCw size={10} />
            다이나믹 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              압력 → 불투명도: {Math.round(brushPressureOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushPressureOpacity * 100}
              onChange={(e) =>
                setBrushPressureOpacity(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              압력 → 크기: {Math.round(brushPressureSize * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushPressureSize * 100}
              onChange={(e) =>
                setBrushPressureSize(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              속도 → 크기: {Math.round(brushSpeedSize * 100)}%
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={brushSpeedSize * 100}
              onChange={(e) =>
                setBrushSpeedSize(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300">스머지 설정</h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              스머지 길이: {Math.round(brushSmudgeLength * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushSmudgeLength * 100}
              onChange={(e) =>
                setBrushSmudgeLength(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              스머지 반경: {Math.round(brushSmudgeRadius * 100)}%
            </label>
            <input
              type="range"
              min="50"
              max="200"
              value={brushSmudgeRadius * 100}
              onChange={(e) =>
                setBrushSmudgeRadius(parseInt(e.target.value) / 100)
              }
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300">고급 설정</h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              간격: {Math.round(brushSpacing * 100)}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={brushSpacing * 100}
              onChange={(e) => setBrushSpacing(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              지터: {brushJitter}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brushJitter}
              onChange={(e) => setBrushJitter(parseInt(e.target.value))}
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
              max="360"
              value={brushAngle}
              onChange={(e) => setBrushAngle(parseInt(e.target.value))}
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
        </div>
      </div>

      <ColorPicker />
    </div>
  );
}

export default BrushProperties;
