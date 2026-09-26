import React from "react";

export function WeightSlider({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-[#1E1E1E]">{label}</label>
        <span className="text-sm text-gray-500">{(value * 100).toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#94BD88]"
      />
    </div>
  );
}
