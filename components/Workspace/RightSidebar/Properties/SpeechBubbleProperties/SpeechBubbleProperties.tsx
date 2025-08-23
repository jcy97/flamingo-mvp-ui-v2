import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { MessageSquare, Palette, Settings, Type, Move } from "lucide-react";
import {
  speechBubbleSettingsAtom,
  bubbleStyleAtom,
  bubbleTextAtom,
  bubbleFontSizeAtom,
  bubbleFontFamilyAtom,
  bubbleTextColorAtom,
  bubbleBackgroundColorAtom,
  bubbleBorderColorAtom,
  bubbleBorderWidthAtom,
  bubblePaddingAtom,
  bubbleWidthAtom,
  bubbleHeightAtom,
  bubbleAutoSizeAtom,
  bubbleTailStyleAtom,
  bubbleTailPositionAtom,
  bubbleTailLengthAtom,
  bubbleTailWidthAtom,
  bubbleTailCurveAtom,
  bubbleCornerRadiusAtom,
  bubbleOpacityAtom,
} from "@/stores/speechBubbleStore";
import { colorPickerStateAtom, addRecentColorAtom } from "@/stores/brushStore";
import ColorPicker from "../BrushProperties/ColorPicker";

function SpeechBubbleProperties() {
  const [settings, setSettings] = useAtom(speechBubbleSettingsAtom);
  const [style, setStyle] = useAtom(bubbleStyleAtom);
  const [text, setText] = useAtom(bubbleTextAtom);
  const [fontSize, setFontSize] = useAtom(bubbleFontSizeAtom);
  const [fontFamily, setFontFamily] = useAtom(bubbleFontFamilyAtom);
  const [textColor, setTextColor] = useAtom(bubbleTextColorAtom);
  const [backgroundColor, setBackgroundColor] = useAtom(
    bubbleBackgroundColorAtom
  );
  const [borderColor, setBorderColor] = useAtom(bubbleBorderColorAtom);
  const [borderWidth, setBorderWidth] = useAtom(bubbleBorderWidthAtom);
  const [padding, setPadding] = useAtom(bubblePaddingAtom);
  const [width, setWidth] = useAtom(bubbleWidthAtom);
  const [height, setHeight] = useAtom(bubbleHeightAtom);
  const [autoSize, setAutoSize] = useAtom(bubbleAutoSizeAtom);
  const [tailStyle, setTailStyle] = useAtom(bubbleTailStyleAtom);
  const [tailPosition, setTailPosition] = useAtom(bubbleTailPositionAtom);
  const [tailLength, setTailLength] = useAtom(bubbleTailLengthAtom);
  const [tailWidth, setTailWidth] = useAtom(bubbleTailWidthAtom);
  const [tailCurve, setTailCurve] = useAtom(bubbleTailCurveAtom);
  const [cornerRadius, setCornerRadius] = useAtom(bubbleCornerRadiusAtom);
  const [opacity, setOpacity] = useAtom(bubbleOpacityAtom);

  const [colorPickerState, setColorPickerState] = useAtom(colorPickerStateAtom);
  const [, addRecentColor] = useAtom(addRecentColorAtom);

  const bgColorButtonRef = useRef<HTMLButtonElement>(null);
  const borderColorButtonRef = useRef<HTMLButtonElement>(null);
  const textColorButtonRef = useRef<HTMLButtonElement>(null);
  const [activeColorPicker, setActiveColorPicker] = React.useState<
    "bg" | "border" | "text" | null
  >(null);
  const textTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    if (textTimeoutRef.current) {
      clearTimeout(textTimeoutRef.current);
    }

    textTimeoutRef.current = setTimeout(() => {
      setSettings((prev) => ({ ...prev, text }));
    }, 300);

    return () => {
      if (textTimeoutRef.current) {
        clearTimeout(textTimeoutRef.current);
      }
    };
  }, [text, setSettings]);

  const handleColorClick = (
    type: "bg" | "border" | "text",
    buttonRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setActiveColorPicker(type);
      setColorPickerState({
        isOpen: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        anchorEl: buttonRef.current,
      });
    }
  };

  useEffect(() => {
    if (
      !colorPickerState.isOpen &&
      activeColorPicker &&
      (colorPickerState as any).selectedColor
    ) {
      const selectedColor = (colorPickerState as any).selectedColor;
      switch (activeColorPicker) {
        case "bg":
          setBackgroundColor(selectedColor);
          break;
        case "border":
          setBorderColor(selectedColor);
          break;
        case "text":
          setTextColor(selectedColor);
          break;
      }
      addRecentColor(selectedColor);
      setActiveColorPicker(null);
    }
  }, [
    colorPickerState,
    activeColorPicker,
    setBackgroundColor,
    setBorderColor,
    setTextColor,
    addRecentColor,
  ]);

  const handleColorPickerClose = () => {
    setColorPickerState({ ...colorPickerState, isOpen: false });
  };

  const bubbleStyles = [
    { value: "speech", label: "말풍선" },
    { value: "thought", label: "생각" },
    { value: "shout", label: "외침" },
    { value: "whisper", label: "속삭임" },
    { value: "rectangle", label: "사각형" },
    { value: "ellipse", label: "타원" },
    { value: "cloud", label: "구름" },
    { value: "jagged", label: "들쭉날쭉" },
  ];

  const tailStyles = [
    { value: "pointed", label: "뾰족한" },
    { value: "curved", label: "곡선" },
    { value: "wavy", label: "물결" },
    { value: "double", label: "이중" },
    { value: "bubble", label: "버블" },
    { value: "none", label: "없음" },
  ];

  const tailPositions = [
    { value: "bottom-left", label: "하단 왼쪽" },
    { value: "bottom-center", label: "하단 중앙" },
    { value: "bottom-right", label: "하단 오른쪽" },
    { value: "top-left", label: "상단 왼쪽" },
    { value: "top-center", label: "상단 중앙" },
    { value: "top-right", label: "상단 오른쪽" },
    { value: "left", label: "왼쪽" },
    { value: "right", label: "오른쪽" },
  ];

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Courier New",
    "Impact",
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded">
          <MessageSquare size={12} className="text-neutral-400" />
          <span className="text-xs font-medium">말풍선</span>
        </div>
      </div>

      <div className="flex-1 bg-neutral-800 rounded-md p-3 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Type size={10} />
            텍스트 내용
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">대사</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200 resize-none h-20"
              placeholder="말풍선 텍스트를 입력하세요..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={autoSize}
                onChange={(e) => setAutoSize(e.target.checked)}
                className="accent-primary-500"
              />
              <span className="text-neutral-400">
                텍스트에 맞게 자동 크기 조절
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Settings size={10} />
            기본 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              스타일
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200"
            >
              {bubbleStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-400 block mb-2">
                너비
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                disabled={autoSize}
                className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-2">
                높이
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                disabled={autoSize}
                className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              모서리 둥글기: {cornerRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              패딩: {padding}px
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={padding}
              onChange={(e) => setPadding(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              불투명도: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Palette size={10} />
            색상 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              배경색
            </label>
            <button
              ref={bgColorButtonRef}
              onClick={() => handleColorClick("bg", bgColorButtonRef)}
              className="w-full h-8 rounded border border-neutral-600 hover:border-neutral-500 transition-colors"
              style={{ backgroundColor }}
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: backgroundColor === "#FFFFFF" ? "#000" : "#FFF",
                }}
              >
                {backgroundColor.toUpperCase()}
              </span>
            </button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              테두리색
            </label>
            <button
              ref={borderColorButtonRef}
              onClick={() => handleColorClick("border", borderColorButtonRef)}
              className="w-full h-8 rounded border border-neutral-600 hover:border-neutral-500 transition-colors"
              style={{ backgroundColor: borderColor }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: borderColor === "#FFFFFF" ? "#000" : "#FFF" }}
              >
                {borderColor.toUpperCase()}
              </span>
            </button>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              테두리 굵기: {borderWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={borderWidth}
              onChange={(e) => setBorderWidth(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Type size={10} />
            텍스트 스타일
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">폰트</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              글자 크기: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              글자색
            </label>
            <button
              ref={textColorButtonRef}
              onClick={() => handleColorClick("text", textColorButtonRef)}
              className="w-full h-8 rounded border border-neutral-600 hover:border-neutral-500 transition-colors"
              style={{ backgroundColor: textColor }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: textColor === "#FFFFFF" ? "#000" : "#FFF" }}
              >
                {textColor.toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-medium text-neutral-300 flex items-center gap-1">
            <Move size={10} />
            꼬리 설정
          </h4>

          <div>
            <label className="text-xs text-neutral-400 block mb-2">
              꼬리 스타일
            </label>
            <select
              value={tailStyle}
              onChange={(e) => setTailStyle(e.target.value as any)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200"
            >
              {tailStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {tailStyle !== "none" && (
            <>
              <div>
                <label className="text-xs text-neutral-400 block mb-2">
                  꼬리 위치
                </label>
                <select
                  value={tailPosition}
                  onChange={(e) => setTailPosition(e.target.value as any)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200"
                >
                  {tailPositions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-2">
                  꼬리 길이: {tailLength}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tailLength}
                  onChange={(e) => setTailLength(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-2">
                  꼬리 너비: {tailWidth}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={tailWidth}
                  onChange={(e) => setTailWidth(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              {tailStyle === "curved" && (
                <div>
                  <label className="text-xs text-neutral-400 block mb-2">
                    꼬리 곡률: {Math.round(tailCurve * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tailCurve * 100}
                    onChange={(e) =>
                      setTailCurve(parseInt(e.target.value) / 100)
                    }
                    className="w-full accent-primary-500"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ColorPicker onClose={handleColorPickerClose} />
    </div>
  );
}

export default SpeechBubbleProperties;
