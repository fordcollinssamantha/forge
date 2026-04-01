"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MessageCircle,
  BookOpen,
  Calendar,
  Flame as FlameIcon,
  TrendingUp,
} from "lucide-react";
import { ProgressMeter } from "@/components/progress-meter";
import { ConfidenceChart } from "@/components/confidence-chart";
import { SkeletonDashboard } from "@/components/skeleton";
import { SEED_EVENTS } from "@/lib/seed-events";

interface DashboardData {
  firstName: string;
  totalPoints: number;
  lessonsCompleted: number;
  streak: number;
  weeklyProgress: { week: string; points: number }[];
  recentReflection: {
    actual_score: number;
    rating_tier: string;
    notes: string;
    created_at: string;
  } | null;
  hasCheckin: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function getNextEvent() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = SEED_EVENTS.filter((e) => new Date(e.date + "T00:00:00") >= now).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (upcoming.length === 0) return null;
  const event = upcoming[0];
  const eventDate = new Date(event.date + "T00:00:00");
  const daysAway = Math.round(
    (eventDate.getTime() - now.getTime()) / 86400000
  );
  return { ...event, daysAway };
}

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const nextEvent = getNextEvent();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.status === 404) {
          const body = await res.json();
          if (body.needsOnboarding) {
            router.replace("/onboarding");
            return;
          }
        }
        if (res.ok) {
          const dashboard = await res.json();
          if (!dashboard.hasCheckin) {
            router.replace("/checkin");
            return;
          }
          setData(dashboard);
        }
      } catch {
        // Fallback for demo
        setData({
          firstName: "Player",
          totalPoints: 0,
          lessonsCompleted: 0,
          streak: 0,
          weeklyProgress: [],
          recentReflection: null,
          hasCheckin: true,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream">
        <SkeletonDashboard />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            {getGreeting()}, {data.firstName}
          </h1>
          <p className="text-sm text-navy/45 mt-0.5">
            {data.streak > 0
              ? `${data.streak} day streak. Keep building.`
              : "Ready to build your edge."}
          </p>
        </div>

        {/* Check-in prompt */}
        <button
          onClick={() => router.push("/checkin")}
          className="w-full bg-white border border-navy/8 rounded-2xl p-4 flex items-center gap-4 hover:border-coral/30 transition-colors mb-4 shadow-sm"
        >
          <div className="w-11 h-11 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
            <span className="text-lg">👋</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-navy">
              How are you doing today?
            </p>
            <p className="text-xs text-navy/40 mt-0.5">
              Quick check-in — takes 2 min
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-navy/25" />
        </button>

        {/* Upcoming event */}
        {nextEvent && (
          <button
            onClick={() => router.push(`/match/${nextEvent.id}`)}
            className="w-full bg-white border border-navy/8 rounded-2xl p-4 flex items-center gap-4 hover:border-steel/30 transition-colors mb-4 shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-steel/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-steel" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-navy">
                {nextEvent.title}
              </p>
              <p className="text-xs text-navy/40 mt-0.5">
                {nextEvent.venue} &middot;{" "}
                {nextEvent.daysAway === 0
                  ? "Today"
                  : nextEvent.daysAway === 1
                    ? "Tomorrow"
                    : `${nextEvent.daysAway} days away`}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-navy/25" />
          </button>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-navy/8 rounded-2xl p-3.5 text-center shadow-sm">
            <p className="text-xl font-bold text-navy">{data.streak}</p>
            <p className="text-[10px] font-semibold text-navy/40 mt-0.5 uppercase tracking-wide">
              Day Streak
            </p>
          </div>
          <div className="bg-white border border-navy/8 rounded-2xl p-3.5 text-center shadow-sm">
            <p className="text-xl font-bold text-navy">
              {data.lessonsCompleted}
              <span className="text-sm font-medium text-navy/30">/21</span>
            </p>
            <p className="text-[10px] font-semibold text-navy/40 mt-0.5 uppercase tracking-wide">
              Lessons
            </p>
          </div>
          <div className="bg-white border border-navy/8 rounded-2xl p-3.5 text-center shadow-sm">
            <p className="text-xl font-bold text-navy">{data.totalPoints}</p>
            <p className="text-[10px] font-semibold text-navy/40 mt-0.5 uppercase tracking-wide">
              Points
            </p>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mb-4">
          <ProgressMeter points={data.totalPoints} />
        </div>

        {/* Confidence progress chart */}
        <div className="bg-white border border-navy/8 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-steel" />
            <h3 className="text-sm font-bold text-navy">Your Progress</h3>
          </div>
          <ConfidenceChart data={data.weeklyProgress} />
        </div>

        {/* Recent post-game review */}
        {data.recentReflection && (
          <div className="bg-white border border-navy/8 rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wide mb-2">
              Last Post-Game
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {data.recentReflection.actual_score >= 7
                  ? "\u{1F525}"
                  : data.recentReflection.actual_score >= 4
                    ? "\u{1F914}"
                    : "\u{1F4AA}"}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">
                  Rated {data.recentReflection.actual_score}/10
                </p>
                <p className="text-xs text-navy/40 mt-0.5">
                  {data.recentReflection.rating_tier === "good"
                    ? "Solid night. The data says you're better at this than you think."
                    : data.recentReflection.rating_tier === "mixed"
                      ? "Mixed results — but you showed up. That's the rep that counts."
                      : "Tough one — but you went. The muscle is building."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/companion")}
            className="flex items-center gap-3 p-4 bg-white border border-navy/8 rounded-2xl hover:border-coral/30 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-coral" />
            <span className="text-xs font-semibold text-navy/60">
              Talk to Coach
            </span>
          </button>
          <button
            onClick={() => router.push("/skills")}
            className="flex items-center gap-3 p-4 bg-white border border-navy/8 rounded-2xl hover:border-coral/30 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-coral" />
            <span className="text-xs font-semibold text-navy/60">
              Skills Library
            </span>
          </button>
          <button
            onClick={() => router.push("/go-mode")}
            className="col-span-2 flex items-center justify-center gap-2 p-4 bg-coral/10 border border-coral/20 rounded-2xl hover:border-coral/40 transition-colors"
          >
            <FlameIcon className="w-5 h-5 text-coral" />
            <span className="text-sm font-bold text-coral">Go Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
