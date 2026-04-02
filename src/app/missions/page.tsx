"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock, ChevronRight } from "lucide-react";
import { MISSION_CATEGORIES } from "@/lib/seed-missions";

interface Mission {
  id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  reflection: string | null;
  points_awarded: number;
}

export default function MissionsPage() {
  const router = useRouter();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [showActivePrompt, setShowActivePrompt] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/missions");
        if (res.ok) {
          const missions: Mission[] = await res.json();
          const active = missions.find((m) => m.status === "active");
          setActiveMission(active ?? null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function acceptMission(title: string, description: string) {
    if (activeMission) {
      setShowActivePrompt(true);
      return;
    }

    setActivating(title);
    try {
      const res = await fetch("/api/missions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, source: "user" }),
      });
      if (res.ok) {
        router.push("/home");
      }
    } catch {
      // ignore
    } finally {
      setActivating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-navy/8 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-navy/60" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Daily Missions</h1>
            <p className="text-xs text-navy/40">
              Pick one. Do it today. Small actions build real confidence.
            </p>
          </div>
        </div>

        {/* Active mission banner */}
        {activeMission && (
          <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-coral" />
              <p className="text-xs font-semibold text-coral uppercase tracking-wide">
                Active Mission
              </p>
            </div>
            <p className="text-sm font-semibold text-navy">{activeMission.title}</p>
            <button
              onClick={() => router.push("/home")}
              className="mt-2 text-xs font-semibold text-coral hover:underline"
            >
              Go to dashboard to complete →
            </button>
          </div>
        )}

        {/* Active mission prompt modal */}
        {showActivePrompt && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-[slide-down_0.3s_ease-out]">
              <p className="text-sm font-semibold text-navy mb-2">
                You already have an active mission
              </p>
              <p className="text-xs text-navy/50 mb-4">
                Complete or skip your current mission before picking a new one.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowActivePrompt(false);
                    router.push("/home");
                  }}
                  className="flex-1 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl"
                >
                  Go to Mission
                </button>
                <button
                  onClick={() => setShowActivePrompt(false)}
                  className="flex-1 py-2.5 bg-navy/5 text-navy/60 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mission categories */}
        {MISSION_CATEGORIES.map((category) => (
          <div key={category.id} className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{category.emoji}</span>
              <h2 className="text-sm font-bold text-navy">{category.label}</h2>
            </div>
            <p className="text-xs text-navy/40 mb-3 ml-7">
              {category.description}
            </p>
            <div className="space-y-2">
              {category.missions.map((mission) => {
                const isActivating = activating === mission.title;
                return (
                  <button
                    key={mission.title}
                    onClick={() =>
                      acceptMission(mission.title, mission.description)
                    }
                    disabled={isActivating}
                    className="w-full bg-white border border-navy/8 rounded-2xl p-4 flex items-center gap-3 hover:border-coral/30 transition-colors shadow-sm text-left disabled:opacity-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy leading-snug">
                        {mission.title}
                      </p>
                      <p className="text-xs text-navy/40 mt-0.5">
                        {mission.description}
                      </p>
                    </div>
                    {isActivating ? (
                      <div className="w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-navy/20 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* History link */}
        <button
          onClick={() => router.push("/missions/history")}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-steel hover:text-steel-dark transition-colors"
        >
          <Check className="w-4 h-4" />
          View Mission History
        </button>
      </div>
    </div>
  );
}
