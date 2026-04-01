"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProgressMeter } from "@/components/progress-meter";
import { LEVELS } from "@/lib/levels";

interface Breakdown {
  checkin: number;
  companion_chat: number;
  skill_card: number;
  practice: number;
  going_solo: number;
  post_game_review: number;
}

const CATEGORIES = [
  {
    key: "post_game_review" as const,
    label: "Post-Game Reviews",
    description: "Reflected on real-world interactions",
    perAction: 10,
    color: "bg-coral",
  },
  {
    key: "practice" as const,
    label: "Practice Sessions",
    description: "Completed role-play scenarios",
    perAction: 5,
    color: "bg-steel",
  },
  {
    key: "going_solo" as const,
    label: "Going Solo",
    description: "Accepted solo challenges",
    perAction: 5,
    color: "bg-steel",
  },
  {
    key: "skill_card" as const,
    label: "Skills Explored",
    description: "Skill cards read",
    perAction: 3,
    color: "bg-navy/40",
  },
  {
    key: "companion_chat" as const,
    label: "Coach Conversations",
    description: "Talked to your coach",
    perAction: 3,
    color: "bg-navy/40",
  },
  {
    key: "checkin" as const,
    label: "Check-Ins",
    description: "Daily emotional check-ins",
    perAction: 2,
    color: "bg-navy/30",
  },
];

export default function ProgressPage() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [breakdown, setBreakdown] = useState<Breakdown>({
    checkin: 0,
    companion_chat: 0,
    skill_card: 0,
    practice: 0,
    going_solo: 0,
    post_game_review: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/points");
        if (res.ok) {
          const data = await res.json();
          setTotal(data.total);
          setBreakdown(data.breakdown);
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() => router.push("/home")}
          className="p-2 -ml-2 rounded-lg hover:bg-navy/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <h1 className="text-base font-semibold text-navy">My Progress</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-navy/20 border-t-coral rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ProgressMeter points={total} />

            {/* Point breakdown */}
            <div className="bg-white border border-navy/8 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy mb-4">
                Where your points come from
              </h3>

              <div className="space-y-4">
                {CATEGORIES.map((cat) => {
                  const pts = breakdown[cat.key] || 0;
                  const count = cat.perAction > 0 ? Math.floor(pts / cat.perAction) : 0;
                  const pct = total > 0 ? (pts / total) * 100 : 0;

                  return (
                    <div key={cat.key}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-medium text-navy">
                          {cat.label}
                        </span>
                        <span className="text-sm font-semibold text-navy/70">
                          {pts} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-navy/40 mb-1.5">
                        {count} {count === 1 ? "time" : "times"} &times; {cat.perAction} pts each
                      </p>
                      <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weighting callout */}
              <div className="mt-5 pt-4 border-t border-navy/6">
                <p className="text-xs text-navy/40 leading-relaxed">
                  Real-world actions earn the most points. The fastest way to move
                  is to get out there and reflect on how it went.
                </p>
              </div>
            </div>

            {/* Level milestones */}
            <div className="bg-white border border-navy/8 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy mb-3">Milestones</h3>
              <div className="space-y-2">
                {LEVELS.map((l) => {
                  const isCurrent = total >= l.min && total <= l.max;
                  const isReached = total >= l.min;
                  return (
                    <div
                      key={l.level}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                        isCurrent
                          ? "bg-coral/8 border border-coral/20"
                          : isReached
                            ? "bg-navy/3"
                            : ""
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCurrent ? "bg-coral" : isReached ? "bg-navy/30" : "bg-navy/10"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          isCurrent ? "text-navy" : isReached ? "text-navy/60" : "text-navy/30"
                        }`}
                      >
                        {l.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold text-coral">You're here</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
