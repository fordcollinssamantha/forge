"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Calendar, Clock, Flame } from "lucide-react";
import { SEED_EVENTS, type GoEvent } from "@/lib/seed-events";

const ALL_TAGS = Array.from(new Set(SEED_EVENTS.flatMap((e) => e.vibe_tags))).sort();

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function EventCard({ event, onGo }: { event: GoEvent; onGo: () => void }) {
  const cardRouter = useRouter();
  const [interested, setInterested] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-navy/8 overflow-hidden shadow-sm animate-msg-in">
      {/* Image */}
      <div className="relative h-40 bg-navy/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1.5 max-w-[70%]">
          {event.vibe_tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-navy/70 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-navy">{event.title}</h3>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-navy/50">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-navy/50">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {event.time}
          </span>
        </div>

        <p className="mt-2.5 text-sm text-navy/60 leading-relaxed">
          {event.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-steel">
            <Users className="w-3.5 h-3.5" />
            {event.going_solo_count + (interested ? 1 : 0)} going solo
          </div>

          {!interested && (
            <button
              onClick={() => setInterested(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold bg-navy/5 text-navy/60 hover:bg-navy/10 transition-all active:scale-95"
            >
              Count Me In
            </button>
          )}
        </div>

        {/* Are you going solo? — expanded after Count Me In */}
        {interested && (
          <div className="mt-4 pt-4 border-t border-navy/8 animate-msg-in">
            <p className="text-sm font-bold text-navy mb-3">Are you going solo?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onGo}
                className="min-h-[44px] w-full py-3 rounded-xl text-sm font-bold bg-coral text-white hover:bg-coral-hover transition-all active:scale-[0.98]"
              >
                Match me with someone
              </button>
              <button
                onClick={() => cardRouter.push(`/match/${event.id}/confirmed?solo=true`)}
                className="min-h-[44px] w-full py-3 rounded-xl text-sm font-semibold bg-navy/5 text-navy/60 hover:bg-navy/10 transition-all active:scale-[0.98]"
              >
                Yeah, I&apos;ll go alone
              </button>
            </div>
          </div>
        )}

        {/* Dev-only: simulate post-event review */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => cardRouter.push(`/review/${event.id}`)}
            className="mt-3 w-full py-1.5 text-[10px] font-mono text-navy/30 border border-dashed border-navy/10 rounded-lg hover:text-navy/50 hover:border-navy/20 transition-colors"
          >
            [dev] Simulate post-event
          </button>
        )}
      </div>
    </div>
  );
}

export default function GoModePage() {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? SEED_EVENTS.filter((e) => e.vibe_tags.includes(activeTag))
    : SEED_EVENTS;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/home")}
            className="p-2 -ml-2 rounded-lg hover:bg-navy/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Go Mode</h1>
            <p className="text-xs text-navy/45 mt-0.5">
              Real stuff happening near you.
            </p>
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`shrink-0 px-4 py-2 min-h-[36px] rounded-full text-xs font-semibold transition-colors ${
              activeTag === null
                ? "bg-navy text-white"
                : "bg-navy/5 text-navy/50 hover:bg-navy/10"
            }`}
          >
            All
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`shrink-0 px-4 py-2 min-h-[36px] rounded-full text-xs font-semibold transition-colors capitalize ${
                activeTag === tag
                  ? "bg-navy text-white"
                  : "bg-navy/5 text-navy/50 hover:bg-navy/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Event feed */}
        <div className="flex flex-col gap-4 mt-2">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} onGo={() => router.push(`/match/${event.id}`)} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Flame className="w-10 h-10 text-navy/15 mx-auto mb-3" />
              <p className="text-sm font-medium text-navy/40">
                No events match that vibe.
              </p>
              <button
                onClick={() => setActiveTag(null)}
                className="mt-3 text-sm font-semibold text-coral hover:text-coral-hover transition-colors"
              >
                Show all events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
