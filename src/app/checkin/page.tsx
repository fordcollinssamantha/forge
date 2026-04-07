"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";

// ─── Step 1: Broad feelings (8 max) ──────────────────────────
const BROAD_FEELINGS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😠", label: "Angry" },
  { emoji: "😒", label: "Frustrated" },
  { emoji: "😌", label: "Calm" },
  { emoji: "🥲", label: "Lonely" },
  { emoji: "⚡", label: "Energized" },
] as const;

type BroadFeeling = (typeof BROAD_FEELINGS)[number]["label"];

// ─── Step 2: Specific sub-feelings per broad feeling ─────────
const SUB_FEELINGS: Record<BroadFeeling, { emoji: string; label: string }[]> = {
  Happy: [
    { emoji: "😎", label: "Locked in" },
    { emoji: "😄", label: "Fired up" },
    { emoji: "🙂", label: "Content" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😊", label: "Grateful" },
  ],
  Sad: [
    { emoji: "😞", label: "Defeated" },
    { emoji: "😶", label: "Numb" },
    { emoji: "😔", label: "Disappointed" },
    { emoji: "😶‍🌫️", label: "Invisible" },
    { emoji: "🕊️", label: "Grieving" },
  ],
  Anxious: [
    { emoji: "😩", label: "Overwhelmed" },
    { emoji: "🤔", label: "Uncertain" },
    { emoji: "😬", label: "On edge" },
    { emoji: "😣", label: "Restless" },
    { emoji: "🫣", label: "Self-conscious" },
  ],
  Angry: [
    { emoji: "🤬", label: "Furious" },
    { emoji: "😤", label: "Resentful" },
    { emoji: "😑", label: "Fed up" },
    { emoji: "💢", label: "Irritated" },
    { emoji: "😡", label: "Bitter" },
  ],
  Frustrated: [
    { emoji: "😤", label: "Hitting a wall" },
    { emoji: "😒", label: "Stuck" },
    { emoji: "🙄", label: "Over it" },
    { emoji: "😕", label: "Lost" },
    { emoji: "😮‍💨", label: "Tired of trying" },
  ],
  Calm: [
    { emoji: "😌", label: "Solid" },
    { emoji: "🧘", label: "At peace" },
    { emoji: "🙂", label: "Steady" },
    { emoji: "😎", label: "Comfortable" },
    { emoji: "💆", label: "Relaxed" },
  ],
  Lonely: [
    { emoji: "😶", label: "Invisible" },
    { emoji: "🥲", label: "On my own" },
    { emoji: "😔", label: "Disconnected" },
    { emoji: "🫥", label: "Left out" },
    { emoji: "🫠", label: "Drifting" },
  ],
  Energized: [
    { emoji: "🔥", label: "Unstoppable" },
    { emoji: "💪", label: "Ready to go" },
    { emoji: "🚀", label: "Motivated" },
    { emoji: "😄", label: "Pumped" },
    { emoji: "⚡", label: "Wired" },
  ],
};

// ─── Vocabulary map for the specific sub-feelings ────────────
const VOCABULARY_MAP: Record<string, string[]> = {
  // Happy sub-feelings
  "Locked in": ["in my zone", "everything's clicking", "feeling sharp", "dialed in", "on a roll"],
  "Fired up": ["ready to go", "looking for action", "feeling unstoppable", "got energy to burn", "want to meet people"],
  "Content": ["good place right now", "nothing's bothering me", "comfortable in my own skin", "no complaints", "steady"],
  "Excited": ["can't wait", "buzzing", "something good is coming", "hyped up", "feeling alive"],
  "Grateful": ["feeling lucky", "people came through", "appreciating what I have", "in the mix", "feeling included"],
  // Sad sub-feelings
  "Defeated": ["what's the point", "can't win", "giving up", "nothing works", "running on empty"],
  "Numb": ["don't feel anything", "going through the motions", "checked out", "flatlined", "empty"],
  "Disappointed": ["expected more", "let down", "thought it'd be different", "falling short", "not what I hoped"],
  "Invisible": ["nobody notices", "easy to forget", "blending into the background", "not on anyone's radar", "just there"],
  "Grieving": ["missing what I had", "can't let go", "it still hurts", "a piece is missing", "processing loss"],
  // Anxious sub-feelings
  "Overwhelmed": ["too many people", "can't keep up", "socially drained", "everything at once", "need to disappear for a bit"],
  "Uncertain": ["second-guessing myself", "not sure where I stand", "reading the room wrong", "don't know my next move", "stuck between options"],
  "On edge": ["overthinking it", "afraid of looking stupid", "worried about saying the wrong thing", "dreading small talk", "on guard"],
  "Restless": ["can't sit still", "need something to change", "itching to do something", "pacing", "wound up"],
  "Self-conscious": ["everyone's watching", "don't fit in", "saying the wrong thing", "standing out for the wrong reasons", "comparing myself"],
  // Angry sub-feelings
  "Furious": ["about to explode", "seeing red", "can't hold it in", "this is too much", "blood boiling"],
  "Resentful": ["they don't deserve it", "it's not fair", "holding a grudge", "can't forgive yet", "building up inside"],
  "Fed up": ["people don't get it", "done explaining", "same stuff different day", "had enough", "at my limit"],
  "Irritated": ["little things are getting to me", "losing patience", "on a short fuse", "everything's annoying", "can't let it go"],
  "Bitter": ["they got what I wanted", "life isn't fair", "stuck watching others win", "swallowing it down", "pretending I'm fine"],
  // Frustrated sub-feelings
  "Hitting a wall": ["tried everything", "nothing's working", "blocked", "spinning my wheels", "can't break through"],
  "Stuck": ["don't know what I want", "no direction", "going in circles", "can't move forward", "paralyzed"],
  "Over it": ["same stuff different day", "tired of this", "lost interest", "what's the point", "running on fumes"],
  "Lost": ["don't know what I want", "going through the motions", "no direction", "disconnected from myself", "stuck"],
  "Tired of trying": ["putting in effort for nothing", "why bother", "feels pointless", "burned out", "done reaching out"],
  // Calm sub-feelings
  "Solid": ["steady", "nothing's bothering me", "comfortable in my own skin", "good place right now", "no complaints"],
  "At peace": ["letting things be", "not fighting it", "accepting where I am", "quiet mind", "present"],
  "Steady": ["one day at a time", "keeping it together", "not great not bad", "balanced", "on track"],
  "Comfortable": ["at ease", "no pressure", "being myself", "low stress", "in my element"],
  "Relaxed": ["unwinding", "taking it easy", "no rush", "breathing easy", "chilling"],
  // Lonely sub-feelings
  "On my own": ["doing everything solo", "no one to call", "used to it by now", "wish I had a crew", "lonely but won't say it"],
  "Disconnected": ["out of the loop", "on the outside", "left behind", "drifting", "hard to reach people"],
  "Left out": ["not invited", "everyone else has plans", "watching from the sideline", "forgotten", "on the outside looking in"],
  "Drifting": ["no anchor", "floating through days", "nothing to hold onto", "lost connection", "fading out"],
  // Energized sub-feelings
  "Unstoppable": ["in the zone", "nothing can stop me", "on fire", "peak energy", "breaking through"],
  "Ready to go": ["let's do this", "bring it on", "fired up", "game time", "all systems go"],
  "Motivated": ["clear on what to do", "locked in on my goals", "building momentum", "making moves", "focused"],
  "Pumped": ["adrenaline flowing", "hyped", "can't wait to start", "bouncing off the walls", "electric"],
  "Wired": ["too much energy", "can't slow down", "mind racing", "buzzing", "need an outlet"],
};

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center pt-8 pb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-coral"
              : i < current
                ? "w-2 bg-coral/40"
                : "w-2 bg-navy/20"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Pick one broad feeling ──────────────────────────
function BroadFeelingStep({
  onNext,
  stepIndex,
  totalSteps,
}: {
  onNext: (feeling: { emoji: string; label: BroadFeeling }) => void;
  stepIndex: number;
  totalSteps: number;
}) {
  const [selected, setSelected] = useState<BroadFeeling | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={stepIndex} total={totalSteps} />
      <div className="flex-1 flex flex-col pt-6">
        <h2 className="text-2xl font-bold text-navy">
          How are you feeling today?
        </h2>
        <p className="text-navy/50 mt-2">
          Pick the one that fits best.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {BROAD_FEELINGS.map(({ emoji, label }) => {
            const isSelected = selected === label;
            return (
              <button
                key={label}
                onClick={() => setSelected(label)}
                className={`flex items-center gap-3 py-4 px-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-coral bg-coral/5 scale-[1.02] shadow-sm"
                    : "border-navy/10 bg-white hover:border-navy/20 active:scale-95"
                }`}
              >
                <span className={`text-2xl ${isSelected ? "animate-emoji-pop" : ""}`}>
                  {emoji}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isSelected ? "text-coral" : "text-navy/60"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            const opt = BROAD_FEELINGS.find((o) => o.label === selected)!;
            onNext({ emoji: opt.emoji, label: selected });
          }}
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Pick specific sub-feelings ──────────────────────
function SpecificFeelingStep({
  broadFeeling,
  onSubmit,
  onBack,
  saving,
  stepIndex,
  totalSteps,
}: {
  broadFeeling: { emoji: string; label: BroadFeeling };
  onSubmit: (subFeelings: { emoji: string; label: string }[], extra: string) => void;
  onBack: () => void;
  saving: boolean;
  stepIndex: number;
  totalSteps: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState("");
  const subOptions = SUB_FEELINGS[broadFeeling.label];
  const maxReached = selected.length >= 3;

  function toggle(label: string) {
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  }

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={stepIndex} total={totalSteps} />
      <div className="flex-1 flex flex-col pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-navy/40 text-sm font-medium mb-4 -ml-1 hover:text-navy/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{broadFeeling.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-navy">
              {broadFeeling.label}
            </h2>
            <p className="text-navy/50 text-sm">
              Can you get more specific? Pick up to 3.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {subOptions.map(({ emoji, label }) => {
            const isSelected = selected.includes(label);
            const isBlocked = maxReached && !isSelected;
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                disabled={isBlocked}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "border-coral bg-coral/5"
                    : isBlocked
                      ? "border-navy/5 bg-white/50 opacity-40 cursor-not-allowed"
                      : "border-navy/10 bg-white hover:border-navy/20 active:scale-[0.98]"
                }`}
              >
                <span className={`text-xl ${isSelected ? "animate-emoji-pop" : ""}`}>
                  {emoji}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-navy" : "text-navy/60"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {maxReached && (
          <p className="text-center text-navy/40 text-xs mt-3 animate-fade-in">
            3 max — tap one to deselect
          </p>
        )}

        <div className="mt-6">
          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Anything else on your mind?"
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
          />
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={selected.length === 0 || saving}
          onClick={() => {
            const selections = selected.map((label) => {
              const opt = subOptions.find((o) => o.label === label)!;
              return { emoji: opt.emoji, label: opt.label };
            });
            onSubmit(selections, extra.trim());
          }}
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main check-in flow ──────────────────────────────────────
// 2 steps: 0=broad feeling, 1=specific sub-feelings
export default function CheckinPage() {
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [broadFeeling, setBroadFeeling] = useState<{ emoji: string; label: BroadFeeling } | null>(null);

  const totalSteps = 2;

  function goToStep(next: number) {
    setDirection(next > step ? "forward" : "back");
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setIsTransitioning(false);
    }, 200);
  }

  function handleBroadSelect(feeling: { emoji: string; label: BroadFeeling }) {
    setBroadFeeling(feeling);
    goToStep(1);
  }

  async function handleSpecificSubmit(
    subFeelings: { emoji: string; label: string }[],
    extra: string
  ) {
    if (!broadFeeling || subFeelings.length === 0) return;

    setSaving(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const body: Record<string, unknown> = {
        emoji: broadFeeling.emoji,
        emojis: [broadFeeling.emoji, ...subFeelings.map((s) => s.emoji)],
        emotion_words: subFeelings.map((s) => s.label),
        verbal_description: extra || null,
      };

      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        console.error("Check-in API error:", result);
        throw new Error(result.error || "Failed to save check-in");
      }
      const result = await res.json();
      setExiting(true);
      await new Promise((r) => setTimeout(r, 300));
      router.replace(result.tutorial_completed ? "/companion" : "/tutorial");
    } catch (err) {
      clearTimeout(timeout);
      console.error("Failed to save check-in:", err);
      setExiting(true);
      await new Promise((r) => setTimeout(r, 300));
      router.replace("/companion");
    } finally {
      setSaving(false);
    }
  }

  const translateClass = isTransitioning
    ? direction === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <div
      className={`overflow-hidden transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`transition-all duration-200 ease-out ${translateClass}`}
      >
        {step === 0 && (
          <BroadFeelingStep
            onNext={handleBroadSelect}
            stepIndex={0}
            totalSteps={totalSteps}
          />
        )}
        {step === 1 && broadFeeling && (
          <SpecificFeelingStep
            broadFeeling={broadFeeling}
            onSubmit={handleSpecificSubmit}
            onBack={() => goToStep(0)}
            saving={saving}
            stepIndex={1}
            totalSteps={totalSteps}
          />
        )}
      </div>
    </div>
  );
}
