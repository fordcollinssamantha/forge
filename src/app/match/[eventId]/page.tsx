"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SEED_EVENTS } from "@/lib/seed-events";
import { getMatchesForEvent, type SoloProfile } from "@/lib/seed-profiles";

function ProfileCard({
  profile,
  onSayHi,
}: {
  profile: SoloProfile;
  onSayHi: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-navy/8 p-5">
      {/* Avatar placeholder — initial, not a photo */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-steel/10 flex items-center justify-center">
          <span className="text-xl font-bold text-steel">
            {profile.name[0]}
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-navy">
            {profile.name}, {profile.age}
          </h3>
          <p className="text-xs text-navy/45 mt-0.5">Also going solo</p>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-3 text-sm text-navy/60 leading-relaxed">
        {profile.bio}
      </p>

      {/* Interests */}
      <div className="flex flex-wrap gap-2 mt-3">
        {profile.interests.map((interest) => (
          <span
            key={interest}
            className="px-2.5 py-1 text-xs font-semibold bg-steel/8 text-steel rounded-lg"
          >
            {interest}
          </span>
        ))}
      </div>

      {/* Say Hi */}
      <button
        onClick={onSayHi}
        className="w-full mt-4 py-3 min-h-[44px] bg-coral text-white text-sm font-bold rounded-xl hover:bg-coral-hover transition-colors active:scale-[0.98]"
      >
        Say Hi
      </button>
    </div>
  );
}

export default function MatchPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();

  const event = SEED_EVENTS.find((e) => e.id === eventId);
  const matches = getMatchesForEvent(eventId);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream text-navy/50">
        Event not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {/* Header */}
        <button
          onClick={() => router.push("/go-mode")}
          className="flex items-center gap-2 text-sm text-navy/50 hover:text-navy transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-navy leading-snug">
            Going to {event.title} solo?
          </h1>
          <p className="text-lg font-bold text-navy leading-snug">
            Meet your crew.
          </p>
          <p className="text-xs text-navy/45 mt-1.5">
            {matches.length === 1
              ? "1 other person"
              : `${matches.length} other people`}{" "}
            going to {event.venue} alone — just like you.
          </p>
        </div>

        {/* Profile cards */}
        <div className="flex flex-col gap-4">
          {matches.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSayHi={() =>
                router.push(`/match/${eventId}/chat?profile=${profile.id}`)
              }
            />
          ))}
        </div>

      </div>
    </div>
  );
}
