import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { X, Pipette, Palette } from "lucide-react";
import {
  brushColorAtom,
  colorPickerStateAtom,
  recentColorsAtom,
  addRecentColorAtom,
} from "@/stores/brushStore";
import { DEFAULT_COLOR_PRESETS } from "@/types/brush";
import {
  hexToHsv,
  hsvToHex,
  getColorFromPosition,
  getContrastColor,
} from "@/utils/color";

interface ColorPickerProps {
  onClose?: () => void;
  currentColor?: string;
  onColorChange?: (color: string) => void;
}

function ColorPicker({
  onClose,
  currentColor: propCurrentColor,
  onColorChange,
}: ColorPickerProps) {
  const [brushColor, setBrushColor] = useAtom(brushColorAtom);
  const [colorPickerState, setColorPickerState] = useAtom(colorPickerStateAtom);
  const [recentColors] = useAtom(recentColorsAtom);
  const [, addRecentColor] = useAtom(addRecentColorAtom);

  const initialColor = propCurrentColor || brushColor;
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [hsv, setHsv] = useState(
    hexToHsv(initialColor) || { h: 0, s: 100, v: 100 }
  );
  const [isDragging, setIsDragging] = useState<"hue" | "sv" | null>(null);
  const [activeTab, setActiveTab] = useState<"picker" | "presets" | "recent">(
    "picker"
  );

  const svPickerRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const updateColor = useCallback((newHsv: typeof hsv) => {
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setCurrentColor(hex);
    setHsv(newHsv);
  }, []);

  const handleMouseDown = (event: React.MouseEvent, type: "hue" | "sv") => {
    event.preventDefault();
    setIsDragging(type);
    handleMouseMove(event, type);
  };

  const handleMouseMove = (
    event: React.MouseEvent | MouseEvent,
    type?: "hue" | "sv"
  ) => {
    if (!type && !isDragging) return;
    const dragType = type || isDragging;
    if (!dragType) return;

    if (dragType === "sv" && svPickerRef.current) {
      const rect = svPickerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      const s = (x / rect.width) * 100;
      const v = ((rect.height - y) / rect.height) * 100;

      updateColor({ ...hsv, s, v });
    } else if (dragType === "hue" && hueSliderRef.current) {
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const h = (x / rect.width) * 360;

      updateColor({ ...hsv, h });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleApply = () => {
    if (onColorChange) {
      onColorChange(currentColor);
    } else {
      setBrushColor(currentColor);
    }
    addRecentColor(currentColor);
    handleClose();
  };

  const handleClose = () => {
    setColorPickerState({ ...colorPickerState, isOpen: false });
    onClose?.();
  };

  const handlePresetClick = (color: string) => {
    setCurrentColor(color);
    const newHsv = hexToHsv(color);
    if (newHsv) setHsv(newHsv);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(event);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (colorPickerState.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPickerState.isOpen]);

  if (!colorPickerState.isOpen) return null;

  const svBackground = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`;
  const hueBackground =
    "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={handleClose} />
      <div
        ref={pickerRef}
        className="fixed z-[9999] bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 p-4 w-70"
        style={{
          top: colorPickerState.y,
          left: colorPickerState.x,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-200">컬러 선택</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-700 rounded transition-colors"
          >
            <X size={14} className="text-neutral-400" />
          </button>
        </div>

        <div className="flex mb-4 bg-neutral-700 rounded p-1">
          <button
            onClick={() => setActiveTab("picker")}
            className={`flex-1 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === "picker"
                ? "bg-primary-500 text-white"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            <Pipette size={12} className="inline mr-1" />
            픽커
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === "presets"
                ? "bg-primary-500 text-white"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            <Palette size={12} className="inline mr-1" />
            프리셋
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === "recent"
                ? "bg-primary-500 text-white"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            최근
          </button>
        </div>

        {activeTab === "picker" && (
          <div className="space-y-4">
            <div
              ref={svPickerRef}
              className="relative w-full h-48 rounded cursor-crosshair"
              style={{ background: svBackground }}
              onMouseDown={(e) => handleMouseDown(e, "sv")}
            >
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${(hsv.s / 100) * 100}%`,
                  top: `${100 - (hsv.v / 100) * 100}%`,
                  boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                }}
              />
            </div>

            <div
              ref={hueSliderRef}
              className="relative w-full h-4 rounded cursor-pointer"
              style={{ background: hueBackground }}
              onMouseDown={(e) => handleMouseDown(e, "hue")}
            >
              <div
                className="absolute w-3 h-6 bg-white border border-neutral-400 rounded transform -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded border border-neutral-600"
                style={{ backgroundColor: currentColor }}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={currentColor.toUpperCase()}
                  onChange={(e) => {
                    const hex = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                      setCurrentColor(hex);
                      const newHsv = hexToHsv(hex);
                      if (newHsv) setHsv(newHsv);
                    }
                  }}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "presets" && (
          <div className="space-y-4">
            {DEFAULT_COLOR_PRESETS.map((preset) => (
              <div key={preset.id}>
                <h4 className="text-xs text-neutral-400 mb-2">{preset.name}</h4>
                <div className="grid grid-cols-6 gap-2">
                  {preset.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(color)}
                      className="w-8 h-8 rounded border border-neutral-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "recent" && (
          <div>
            {recentColors.length > 0 ? (
              <div className="grid grid-cols-8 gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(color)}
                    className="w-8 h-8 rounded border border-neutral-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 text-xs">
                최근 사용한 색상이 없습니다
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-xs transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-400 rounded text-xs transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </>
  );
}

export default ColorPicker;
