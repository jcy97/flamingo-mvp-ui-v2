import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BrushPreset, BRUSH_PRESETS } from "@/types/brush";

interface BrushPresetSelectorProps {
  currentPreset: string;
  onPresetChange: (presetId: string) => void;
}

function BrushPresetSelector({
  currentPreset,
  onPresetChange,
}: BrushPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPreset = BRUSH_PRESETS.find(
    (preset) => preset.id === currentPreset
  );

  const handlePresetSelect = (presetId: string) => {
    onPresetChange(presetId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-neutral-600 border border-neutral-500 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 hover:bg-neutral-550 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedPreset && (
              <img
                src={selectedPreset.imagePath}
                alt={selectedPreset.name}
                className="w-6 h-6 rounded object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            )}
            <span className="text-xs text-white">
              {selectedPreset?.name || "프리셋 선택"}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp size={12} className="text-neutral-400" />
          ) : (
            <ChevronDown size={12} className="text-neutral-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-700 border border-neutral-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto custom-scrollbar">
          {BRUSH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`w-full flex items-center gap-3 p-2 text-left hover:bg-neutral-600 transition-colors ${
                currentPreset === preset.id ? "bg-neutral-600" : ""
              }`}
            >
              <img
                src={preset.imagePath}
                alt={preset.name}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <span className="text-xs text-white min-w-0 flex-1">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrushPresetSelector;
