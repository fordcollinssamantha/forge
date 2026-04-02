"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Check, SkipForward } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  reflection: string | null;
  points_awarded: number;
}

export default function MissionHistoryPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/missions");
        if (res.ok) {
          setMissions(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeMission = missions.find((m) => m.status === "active");
  const completedMissions = missions.filter((m) => m.status === "completed");
  const skippedMissions = missions.filter((m) => m.status === "skipped");

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
            <h1 className="text-xl font-bold text-navy">Mission History</h1>
            <p className="text-xs text-navy/40">
              {completedMissions.length} mission
              {completedMissions.length !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>

        {/* Active mission */}
        {activeMission && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wide mb-2 ml-1">
              Active
            </p>
            <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-coral" />
                <p className="text-sm font-semibold text-navy">
                  {activeMission.title}
                </p>
              </div>
              <p className="text-xs text-navy/40 ml-6">
                Started{" "}
                {new Date(activeMission.created_at).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </p>
            </div>
          </div>
        )}

        {/* Completed missions */}
        {completedMissions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wide mb-2 ml-1">
              Completed
            </p>
            <div className="space-y-2">
              {completedMissions.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-navy/8 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy leading-snug">
                        {m.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-navy/35">
                          {m.completed_at
                            ? new Date(m.completed_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : ""}
                        </p>
                        <span className="text-xs text-coral font-semibold">
                          +{m.points_awarded} pts
                        </span>
                      </div>
                      {m.reflection && (
                        <p className="text-xs text-navy/50 mt-2 bg-cream rounded-lg px-3 py-2 italic">
                          &ldquo;{m.reflection}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skipped */}
        {skippedMissions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wide mb-2 ml-1">
              Skipped
            </p>
            <div className="space-y-2">
              {skippedMissions.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-navy/6 rounded-2xl p-3 flex items-center gap-3 opacity-60"
                >
                  <SkipForward className="w-4 h-4 text-navy/30 shrink-0" />
                  <p className="text-xs text-navy/50">{m.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {missions.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-10 h-10 text-navy/15 mx-auto mb-3" />
            <p className="text-sm font-semibold text-navy/40">
              No missions yet
            </p>
            <p className="text-xs text-navy/30 mt-1">
              Pick your first one from the mission browser.
            </p>
            <button
              onClick={() => router.push("/missions")}
              className="mt-4 py-2 px-4 bg-coral text-white text-sm font-semibold rounded-xl"
            >
              Browse Missions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
