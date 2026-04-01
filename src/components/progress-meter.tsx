"use client";

import { getLevel } from "@/lib/levels";

interface ProgressMeterProps {
  points: number;
  recentActions?: string[];
}

export function ProgressMeter({ points, recentActions }: ProgressMeterProps) {
  const level = getLevel(points);
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - level.progress * circumference;

  return (
    <div className="bg-white border border-navy/8 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-5">
        {/* Progress ring */}
        <div className="relative w-[100px] h-[100px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              className="text-navy/8"
              strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={level.isMax ? 0 : strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4682B4" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-navy leading-none">{points}</span>
            <span className="text-[10px] text-navy/40 mt-0.5">pts</span>
          </div>
        </div>

        {/* Level name + status */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-navy leading-tight">
            {level.name}
          </h2>
          {!level.isMax && (
            <p className="text-xs text-navy/40 mt-1">
              Next: {level.nextLevelName}
            </p>
          )}
        </div>
      </div>

      {/* Recent action chips */}
      {recentActions && recentActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-navy/6">
          {recentActions.map((action, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-navy/50 bg-navy/5 px-2.5 py-1 rounded-full"
            >
              {action}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
