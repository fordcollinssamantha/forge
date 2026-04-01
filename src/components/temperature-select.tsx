"use client";

import { TEMPERATURE_OPTIONS, type ReceptionTemperature } from "@/lib/practice-data";

interface TemperatureSelectProps {
  onSelect: (temp: ReceptionTemperature) => void;
}

const TEMP_STYLES: Record<ReceptionTemperature, { bg: string; border: string; icon: string }> = {
  warm: { bg: "bg-green-50", border: "border-green-200 hover:border-green-400", icon: "☀️" },
  medium: { bg: "bg-amber-50", border: "border-amber-200 hover:border-amber-400", icon: "⛅" },
  cold: { bg: "bg-blue-50", border: "border-blue-200 hover:border-blue-400", icon: "❄️" },
  surprise: { bg: "bg-purple-50", border: "border-purple-200 hover:border-purple-400", icon: "🎲" },
};

export default function TemperatureSelect({ onSelect }: TemperatureSelectProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <h2 className="text-base font-semibold text-navy text-center mb-1">
        How should they receive you?
      </h2>
      <p className="text-xs text-navy/40 text-center mb-5">
        This sets the other person's mood, not yours.
      </p>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {TEMPERATURE_OPTIONS.map((opt) => {
          const style = TEMP_STYLES[opt.value];
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`${style.bg} ${style.border} border-2 rounded-2xl p-4 text-left transition-all active:scale-[0.98]`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-lg">{style.icon}</span>
                <span className="text-[15px] font-semibold text-navy">
                  {opt.label}
                </span>
              </div>
              <p className="text-[13px] text-navy/60 leading-relaxed pl-[30px]">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
