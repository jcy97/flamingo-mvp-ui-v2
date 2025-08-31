import React, { useState, useEffect } from "react";
import { Canvas } from "@/types/canvas";
import Modal from "../Modal";
import NumberInput from "../Input/NumberInput";

interface CanvasConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (width: number, height: number, backgroundColor: string) => void;
  mode: "create" | "edit";
  canvasData?: Canvas;
}

const CANVAS_PRESETS = [
  { name: "웹툰 세로형", width: 800, height: 1280 },
  { name: "웹툰 가로형", width: 1280, height: 800 },
  { name: "웹툰 스크롤", width: 800, height: 3000 },
  { name: "인스타그램", width: 1080, height: 1080 },
  { name: "유튜브 썸네일", width: 1280, height: 720 },
  { name: "A4", width: 2480, height: 3508 },
  { name: "커스텀", width: 1920, height: 1080 },
];

const BACKGROUND_COLORS = [
  { name: "흰색", value: "#FFFFFF" },
  { name: "검은색", value: "#000000" },
  { name: "회색", value: "#808080" },
  { name: "투명", value: "TRANSPARENT" },
];

function CanvasConfigModal({
  isOpen,
  onClose,
  onConfirm,
  mode,
  canvasData,
}: CanvasConfigModalProps) {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [selectedPreset, setSelectedPreset] = useState("커스텀");

  useEffect(() => {
    if (mode === "edit" && canvasData) {
      setWidth(canvasData.width);
      setHeight(canvasData.height);
      setBackgroundColor(canvasData.backgroundColor);

      const preset = CANVAS_PRESETS.find(
        (p) => p.width === canvasData.width && p.height === canvasData.height
      );
      setSelectedPreset(preset?.name || "커스텀");
    } else if (mode === "create") {
      setWidth(1920);
      setHeight(1080);
      setBackgroundColor("#FFFFFF");
      setSelectedPreset("커스텀");
    }
  }, [mode, canvasData, isOpen]);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = CANVAS_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setWidth(preset.width);
      setHeight(preset.height);
    }
  };

  const handleConfirm = () => {
    if (width > 0 && height > 0) {
      onConfirm(width, height, backgroundColor);
    }
  };

  const swapDimensions = () => {
    const tempWidth = width;
    setWidth(height);
    setHeight(tempWidth);
    setSelectedPreset("커스텀");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "새 캔버스 생성" : "캔버스 설정"}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            프리셋
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CANVAS_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetChange(preset.name)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedPreset === preset.name
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                }`}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs opacity-75">
                  {preset.width} × {preset.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              너비 (px)
            </label>
            <NumberInput
              value={width}
              onChange={setWidth}
              min={100}
              max={50000}
              placeholder="1920"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              높이 (px)
            </label>
            <NumberInput
              value={height}
              onChange={setHeight}
              min={100}
              max={50000}
              placeholder="1080"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swapDimensions}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md text-sm text-neutral-300 transition-colors"
          >
            ⇄ 가로세로 바꾸기
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            배경색
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setBackgroundColor(color.value)}
                className={`p-3 rounded-md border-2 transition-colors ${
                  backgroundColor === color.value
                    ? "border-primary-500"
                    : "border-neutral-600 hover:border-neutral-500"
                }`}
              >
                <div
                  className="w-full h-8 rounded mb-1"
                  style={{
                    backgroundColor:
                      color.value === "TRANSPARENT" ? "#f0f0f0" : color.value,
                    backgroundImage:
                      color.value === "TRANSPARENT"
                        ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                        : "none",
                    backgroundSize:
                      color.value === "TRANSPARENT" ? "8px 8px" : "none",
                    backgroundPosition:
                      color.value === "TRANSPARENT" ? "0 0, 4px 4px" : "none",
                  }}
                />
                <div className="text-xs text-neutral-400">{color.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md text-sm text-neutral-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={width <= 0 || height <= 0}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-400 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-md text-sm text-white transition-colors"
          >
            {mode === "create" ? "생성" : "적용"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CanvasConfigModal;
