"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Calendar, MapPin, Clock } from "lucide-react";
import { SEED_EVENTS } from "@/lib/seed-events";
import { SEED_PROFILES } from "@/lib/seed-profiles";

export default function ConfirmedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profile");
  const isSolo = searchParams.get("solo") === "true";

  const event = SEED_EVENTS.find((e) => e.id === eventId);
  const profile = profileId
    ? SEED_PROFILES.find((p) => p.id === profileId)
    : null;

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream text-navy/50">
        Event not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Check icon */}
        <div className="w-16 h-16 rounded-full bg-steel/10 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-steel" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-navy leading-snug">
          You&apos;re set for {event.title}.
        </h1>

        {/* Subtitle */}
        {isSolo ? (
          <p className="text-sm text-navy/50 mt-2 leading-relaxed max-w-xs">
            Flying solo — respect. We&apos;ll check in after to see how it
            went.
          </p>
        ) : profile ? (
          <p className="text-sm text-navy/50 mt-2 leading-relaxed max-w-xs">
            {profile.name} will meet you there. We&apos;ll check in after to
            see how it went.
          </p>
        ) : (
          <p className="text-sm text-navy/50 mt-2 leading-relaxed max-w-xs">
            We&apos;ll check in after to see how it went.
          </p>
        )}

        {/* Event details card */}
        <div className="w-full mt-8 bg-white rounded-2xl border border-navy/8 p-5 text-left">
          <h3 className="text-sm font-bold text-navy">{event.title}</h3>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-navy/50">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-navy/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.time}
            </span>
          </div>

          {profile && !isSolo && (
            <div className="mt-4 pt-3 border-t border-navy/6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-steel/10 flex items-center justify-center">
                <span className="text-sm font-bold text-steel">
                  {profile.name[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">
                  Meeting {profile.name}
                </p>
                <p className="text-xs text-navy/40">
                  {profile.name} is also going solo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-8 pt-4 flex flex-col gap-3">
        <button
          onClick={() => router.push("/go-mode")}
          className="w-full py-3 bg-coral text-white text-sm font-bold rounded-xl hover:bg-coral-hover transition-colors"
        >
          Back to events
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 bg-white text-navy/60 text-sm font-semibold rounded-xl border border-navy/8 hover:bg-navy/3 transition-colors"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
