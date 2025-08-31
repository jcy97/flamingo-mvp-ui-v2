import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

function NumberInput({
  value,
  onChange,
  min = 1,
  max = 50000,
  step = 1,
  disabled = false,
  className = "",
  placeholder,
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    } else {
      onChange(numValue);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-neutral-700 border border-neutral-600 rounded-md pl-3 pr-8 py-2 text-sm text-neutral-200 focus:border-primary-500 focus:outline-none hover:border-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="p-0.5 hover:bg-neutral-600 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <ChevronUp size={12} className="text-neutral-400" />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="p-0.5 hover:bg-neutral-600 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <ChevronDown size={12} className="text-neutral-400" />
        </button>
      </div>
    </div>
  );
}

export default NumberInput;
