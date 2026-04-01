"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  PRACTICE_SCENARIOS,
} from "@/lib/practice-data";
import { DIFFICULTY_LABELS } from "@/lib/skills-data";

const DIFFICULTY_COLORS: Record<string, string> = {
  starter: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-navy/8">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/skills")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-navy leading-tight">
              Practice Mode
            </h1>
            <p className="text-xs text-navy/40">
              Role-play real scenarios with AI
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-6">
        <div className="space-y-3">
          {PRACTICE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => router.push(`/skills/practice/${scenario.id}`)}
              className="w-full bg-white border border-navy/8 rounded-2xl p-4 text-left transition-all hover:border-steel/30 hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-[15px] font-semibold text-navy leading-tight">
                  {scenario.title}
                </h3>
                <ChevronRight className="w-4 h-4 text-navy/25 shrink-0 mt-0.5" />
              </div>
              <p className="text-xs text-navy/50 leading-relaxed mb-3">
                {scenario.setting}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    DIFFICULTY_COLORS[scenario.difficulty]
                  }`}
                >
                  {DIFFICULTY_LABELS[scenario.difficulty]}
                </span>
                <span className="text-[11px] text-steel font-medium">
                  Practice
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
