"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame } from "lucide-react";
import { SEED_EVENTS } from "@/lib/seed-events";

type Step = "rate" | "details" | "closing";

function ratingTier(rating: number): "good" | "mixed" | "rough" {
  if (rating >= 7) return "good";
  if (rating >= 4) return "mixed";
  return "rough";
}

const SLIDER_EMOJI: Record<number, string> = {
  1: "\u{1F62B}", // 😫
  2: "\u{1F61E}", // 😞
  3: "\u{1F615}", // 😕
  4: "\u{1F610}", // 😐
  5: "\u{1F636}", // 😶
  6: "\u{1F914}", // 🤔
  7: "\u{1F642}", // 🙂
  8: "\u{1F60A}", // 😊
  9: "\u{1F604}", // 😄
  10: "\u{1F525}", // 🔥
};

// Mock prediction — in production this would come from a pre-event prediction saved earlier
function getMockPrediction(eventId: string): number | null {
  const predictions: Record<string, number> = {
    "pickup-basketball": 5,
    "trivia-night": 4,
    "group-hike": 6,
    "comedy-open-mic": 3,
    "rec-volleyball": 5,
    "gaming-tournament": 7,
  };
  return predictions[eventId] ?? null;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();

  const event = SEED_EVENTS.find((e) => e.id === eventId);

  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(5);
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatWasAwkward, setWhatWasAwkward] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream text-navy/50">
        Event not found.
      </div>
    );
  }

  const tier = ratingTier(rating);
  const prediction = getMockPrediction(eventId);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: null, // mock events don't have Supabase UUIDs
          predictionScore: prediction,
          actualScore: rating,
          notes: [
            whatWentWell && `Went well: ${whatWentWell}`,
            whatWasAwkward && `Awkward: ${whatWasAwkward}`,
            nextTime && `Next time: ${nextTime}`,
          ]
            .filter(Boolean)
            .join("\n"),
          ratingTier: tier,
          whatWentWell: whatWentWell || null,
          whatWasAwkward: whatWasAwkward || null,
          nextTime: nextTime || null,
        }),
      });
    } catch {
      // Silently continue for demo — data may not save without auth
    } finally {
      setSaving(false);
      setSaved(true);
    }
  }

  // ─── STEP: RATE ────────────────────────────────────────────
  if (step === "rate") {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream">
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
          <button
            onClick={() => router.push("/go-mode")}
            className="flex items-center gap-2 text-sm text-navy/50 hover:text-navy transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="text-xl font-bold text-navy leading-snug">
            How&apos;d {event.title} go?
          </h1>
          <p className="text-xs text-navy/45 mt-1">
            {event.venue} &middot; Be honest — this is just for you.
          </p>

          {/* Rating slider */}
          <div className="mt-10 flex flex-col items-center">
            <span className="text-5xl mb-2">{SLIDER_EMOJI[rating]}</span>
            <span className="text-3xl font-bold text-navy">{rating}/10</span>
          </div>

          <div className="mt-6 px-2">
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-2 bg-navy/10 rounded-full appearance-none cursor-pointer accent-coral"
            />
            <div className="flex justify-between text-xs text-navy/30 mt-2 px-0.5">
              <span>Rough</span>
              <span>Solid</span>
              <span>Great</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={() => setStep("details")}
            className="w-full py-3.5 bg-coral text-white text-sm font-bold rounded-xl hover:bg-coral-hover transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP: DETAILS ─────────────────────────────────────────
  if (step === "details") {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream">
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
          <button
            onClick={() => setStep("rate")}
            className="flex items-center gap-2 text-sm text-navy/50 hover:text-navy transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{SLIDER_EMOJI[rating]}</span>
            <span className="text-lg font-bold text-navy">{rating}/10</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                What went well?
              </label>
              <textarea
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="The conversation at the bar was easy..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                What was awkward?
              </label>
              <textarea
                value={whatWasAwkward}
                onChange={(e) => setWhatWasAwkward(e.target.value)}
                placeholder="I didn't know anyone at first..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={() => {
              handleSave();
              setStep("closing");
            }}
            className="w-full py-3.5 bg-coral text-white text-sm font-bold rounded-xl hover:bg-coral-hover transition-colors"
          >
            See my review
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP: CLOSING ─────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8">
        {/* ── GOOD (7-10) ─────────────────────────── */}
        {tier === "good" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{SLIDER_EMOJI[rating]}</span>
              <span className="text-2xl font-bold text-navy">{rating}/10</span>
            </div>

            {prediction !== null && (
              <div className="bg-white rounded-2xl border border-navy/8 p-5">
                <p className="text-sm text-navy/60 leading-relaxed">
                  Before, you predicted this would be a{" "}
                  <span className="font-bold text-navy">{prediction}/10</span>.
                  You rated it{" "}
                  <span className="font-bold text-navy">{rating}/10</span>.
                </p>
                <p className="text-sm font-semibold text-steel mt-2">
                  Your predictions are getting less scary than reality.
                </p>
              </div>
            )}

            {prediction === null && (
              <div className="bg-white rounded-2xl border border-navy/8 p-5">
                <p className="text-sm text-navy/60 leading-relaxed">
                  That&apos;s a solid night. The more you show up, the more
                  nights like this you get.
                </p>
              </div>
            )}

            <div className="bg-steel/5 rounded-2xl border border-steel/10 p-5">
              <p className="text-sm text-navy leading-relaxed font-medium">
                That&apos;s data. Not feelings — data. And the data says
                you&apos;re better at this than you think.
              </p>
            </div>
          </div>
        )}

        {/* ── MIXED (4-6) ─────────────────────────── */}
        {tier === "mixed" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{SLIDER_EMOJI[rating]}</span>
              <span className="text-2xl font-bold text-navy">{rating}/10</span>
            </div>

            <div className="bg-white rounded-2xl border border-navy/8 p-5">
              <p className="text-sm text-navy/60 leading-relaxed">
                Mixed results happen. The thing that matters: you went. You
                didn&apos;t talk yourself out of it, you didn&apos;t bail at the
                door, you showed up.{" "}
                <span className="font-semibold text-navy">
                  That&apos;s the rep that counts.
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                What would you do differently next time?
              </label>
              <textarea
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
                placeholder="Next time I'd..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none leading-relaxed"
              />
              {nextTime.trim() && (
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/reflections", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          eventId: null,
                          predictionScore: prediction,
                          actualScore: rating,
                          notes: `Next time: ${nextTime}`,
                          ratingTier: "mixed",
                          nextTime,
                        }),
                      });
                    } catch {
                      // silent for demo
                    }
                  }}
                  className="mt-2 text-xs font-semibold text-coral hover:text-coral-hover transition-colors"
                >
                  Save this thought
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── ROUGH (1-3) ─────────────────────────── */}
        {tier === "rough" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{SLIDER_EMOJI[rating]}</span>
              <span className="text-2xl font-bold text-navy">{rating}/10</span>
            </div>

            <div className="bg-white rounded-2xl border border-navy/8 p-5">
              <p className="text-sm text-navy/60 leading-relaxed">
                That sounds like it genuinely sucked. Not every event is going
                to land —{" "}
                <span className="font-semibold text-navy">
                  that&apos;s not a you problem.
                </span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-navy/8 p-5">
              <p className="text-sm text-navy/60 leading-relaxed">
                Here&apos;s what&apos;s real though: you went. Most people
                don&apos;t. A month ago you might not have either. The event was
                bad —{" "}
                <span className="font-semibold text-navy">
                  the muscle you&apos;re building isn&apos;t.
                </span>
              </p>
            </div>

            <div className="bg-steel/5 rounded-2xl border border-steel/10 p-5">
              <p className="text-sm text-navy leading-relaxed font-medium">
                Every great shooter has off nights. You don&apos;t get better by
                only going to the events that feel safe. The fact that
                you&apos;re here reviewing it instead of pretending it
                didn&apos;t happen? That takes guts. Stay in it.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-3">
        {tier === "rough" && (
          <button
            onClick={() => router.push("/go-mode")}
            className="w-full py-3 bg-coral text-white text-sm font-bold rounded-xl hover:bg-coral-hover transition-colors flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4" />
            Find something more your speed
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className={`w-full py-3 text-sm font-bold rounded-xl transition-colors ${
            tier === "rough"
              ? "bg-white text-navy/60 border border-navy/8 hover:bg-navy/3"
              : "bg-coral text-white hover:bg-coral-hover"
          }`}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
