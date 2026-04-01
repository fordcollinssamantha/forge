"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, ChevronRight } from "lucide-react";
import { ProgressMeter } from "@/components/progress-meter";

interface ProfileData {
  totalPoints: number;
  firstName: string;
  lessonsCompleted: number;
  streak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData({
            totalPoints: json.totalPoints,
            firstName: json.firstName,
            lessonsCompleted: json.lessonsCompleted,
            streak: json.streak,
          });
        }
      } catch {
        setData({ totalPoints: 0, firstName: "Player", lessonsCompleted: 0, streak: 0 });
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Profile</h1>
          <p className="text-sm text-navy/45 mt-0.5">
            {user?.primaryEmailAddress?.emailAddress || "Your account"}
          </p>
        </div>

        {/* Name + avatar */}
        <div className="bg-white border border-navy/8 rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center">
              <span className="text-xl font-bold text-coral">
                {data?.firstName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">
                {data?.firstName || "Loading..."}
              </h2>
              <p className="text-xs text-navy/40 mt-0.5">
                {data ? `${data.streak} day streak` : "..."}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {data && (
          <div className="mb-4">
            <ProgressMeter points={data.totalPoints} />
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/progress")}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-navy/8 rounded-xl shadow-sm hover:bg-navy/3 transition-colors"
          >
            <span className="text-sm font-medium text-navy/70">
              View full progress
            </span>
            <ChevronRight className="w-4 h-4 text-navy/25" />
          </button>
          <button
            onClick={() => router.push("/checkin")}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-navy/8 rounded-xl shadow-sm hover:bg-navy/3 transition-colors"
          >
            <span className="text-sm font-medium text-navy/70">
              New check-in
            </span>
            <ChevronRight className="w-4 h-4 text-navy/25" />
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-full flex items-center justify-center gap-2 mt-8 py-3.5 text-sm font-medium text-navy/40 hover:text-navy/60 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
