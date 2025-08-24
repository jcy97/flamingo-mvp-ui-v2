import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import {
  Type,
  Palette,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  textSettingsAtom,
  textFontSizeAtom,
  textFontFamilyAtom,
  textFillAtom,
  textLetterSpacingAtom,
  textLineHeightAtom,
  textFontWeightAtom,
  textFontStyleAtom,
  textAlignAtom,
  textWordWrapAtom,
  textWordWrapWidthAtom,
} from "@/stores/textStore";
import {
  colorPickerStateAtom,
  brushColorAtom,
  addRecentColorAtom,
} from "@/stores/brushStore";
import ColorPicker from "../BrushProperties/ColorPicker";

function TextProperties() {
  const [textSettings] = useAtom(textSettingsAtom);
  const [fontSize, setFontSize] = useAtom(textFontSizeAtom);
  const [fontFamily, setFontFamily] = useAtom(textFontFamilyAtom);
  const [fill, setFill] = useAtom(textFillAtom);
  const [letterSpacing, setLetterSpacing] = useAtom(textLetterSpacingAtom);
  const [lineHeight, setLineHeight] = useAtom(textLineHeightAtom);
  const [fontWeight, setFontWeight] = useAtom(textFontWeightAtom);
  const [fontStyle, setFontStyle] = useAtom(textFontStyleAtom);
  const [align, setAlign] = useAtom(textAlignAtom);
  const [wordWrap, setWordWrap] = useAtom(textWordWrapAtom);
  const [wordWrapWidth, setWordWrapWidth] = useAtom(textWordWrapWidthAtom);
  const [brushColor, setBrushColor] = useAtom(brushColorAtom);
  const [, addRecentColor] = useAtom(addRecentColorAtom);
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

  const handleColorChange = (color: string) => {
    setFill(color);
    setBrushColor(color);
  };

  const handleColorPickerClose = () => {
    setColorPickerState({ ...colorPickerState, isOpen: false });
  };

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Impact",
    "Comic Sans MS",
    "Courier New",
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <Type size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">텍스트</span>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-3">
        <label className="text-xs text-neutral-400 block mb-2">미리보기</label>
        <div className="flex items-center justify-center h-12 bg-white rounded relative">
          <span
            style={{
              fontSize: `${Math.min(fontSize, 24)}px`,
              fontFamily: fontFamily,
              color: fill,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight,
            }}
          >
            예시 텍스트
          </span>
        </div>
      </div>

      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Settings size={10} />
            기본 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">폰트</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded px-2 text-xs text-neutral-200 hover:border-neutral-500 transition-colors"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">색상</label>
            <button
              ref={colorButtonRef}
              onClick={handleColorClick}
              className="w-full h-8 rounded border border-neutral-600 hover:border-neutral-500 transition-colors flex items-center gap-2 px-2"
              style={{ backgroundColor: fill }}
            >
              <div
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: fill === "#ffffff" ? "#000" : "#fff" }}
              >
                <Palette size={12} />
                {fill.toUpperCase()}
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              크기: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>8px</span>
              <span>200px</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400 block mb-2">
                굵기
              </label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value as any)}
                className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded px-2 text-xs text-neutral-200 hover:border-neutral-500 transition-colors"
              >
                <option value="normal">일반</option>
                <option value="bold">굵게</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-2">
                스타일
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value as any)}
                className="w-full h-8 bg-neutral-700 border border-neutral-600 rounded px-2 text-xs text-neutral-200 hover:border-neutral-500 transition-colors"
              >
                <option value="normal">일반</option>
                <option value="italic">기울임</option>
                <option value="oblique">비스듬히</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">정렬</label>
            <div className="flex gap-1">
              <button
                onClick={() => setAlign("left")}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  align === "left"
                    ? "bg-primary-500 border-primary-500"
                    : "border-neutral-600 hover:border-neutral-500"
                }`}
              >
                <AlignLeft size={14} />
              </button>
              <button
                onClick={() => setAlign("center")}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  align === "center"
                    ? "bg-primary-500 border-primary-500"
                    : "border-neutral-600 hover:border-neutral-500"
                }`}
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => setAlign("right")}
                className={`flex-1 h-8 rounded border transition-colors flex items-center justify-center ${
                  align === "right"
                    ? "bg-primary-500 border-primary-500"
                    : "border-neutral-600 hover:border-neutral-500"
                }`}
              >
                <AlignRight size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              자간: {letterSpacing}px
            </label>
            <input
              type="range"
              min="-10"
              max="50"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>-10px</span>
              <span>50px</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              행간: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>0.5</span>
              <span>5.0</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="accent-primary-500"
              />
              <span className="text-neutral-400">자동 줄바꿈</span>
            </label>
          </div>

          {wordWrap && (
            <div>
              <label className="text-xs text-neutral-400 block mb-2">
                줄바꿈 너비: {wordWrapWidth}px
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                value={wordWrapWidth}
                onChange={(e) => setWordWrapWidth(parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>50px</span>
                <span>1000px</span>
              </div>
            </div>
          )}
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

      <ColorPicker
        onClose={handleColorPickerClose}
        currentColor={fill}
        onColorChange={handleColorChange}
      />
    </div>
  );
}

export default TextProperties;
