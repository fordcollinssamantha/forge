"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap, Compass, Users, MapPin, Search } from "lucide-react";

const MOTIVATION_OPTIONS = [
  {
    id: "confidence",
    label: "More confidence when I'm out and about",
    icon: Zap,
  },
  {
    id: "rut",
    label: "Ideas of what to do — I'm kind of in a rut",
    icon: Compass,
  },
  {
    id: "meet_people",
    label: "A chance to meet new people",
    icon: Users,
  },
  {
    id: "new_city",
    label: "I just moved somewhere and don't know anyone",
    icon: MapPin,
  },
  {
    id: "curious",
    label: "Honestly just curious",
    icon: Search,
  },
] as const;

type MotivationId = (typeof MOTIVATION_OPTIONS)[number]["id"];

const FOLLOW_UP_QUESTIONS: Record<MotivationId, string> = {
  confidence:
    "What's a social situation where you wish you felt more comfortable?",
  rut: "When's the last time you did something new with other people?",
  meet_people: "What makes it hard to meet people right now?",
  new_city:
    "How long have you been in your new city? What's been the hardest part socially?",
  curious:
    "No pressure. What does your social life look like right now — honest answer?",
};

const EMOJI_OPTIONS = [
  { emoji: "😊", label: "Connected" },
  { emoji: "😔", label: "Disconnected" },
  { emoji: "😟", label: "On Edge" },
  { emoji: "😶", label: "Invisible" },
  { emoji: "😎", label: "Locked In" },
  { emoji: "🤔", label: "Uncertain" },
  { emoji: "😩", label: "Overwhelmed" },
  { emoji: "😌", label: "Solid" },
  { emoji: "😕", label: "Lost" },
  { emoji: "😒", label: "Frustrated" },
  { emoji: "🥲", label: "On My Own" },
  { emoji: "😄", label: "Fired Up" },
] as const;

const VOCABULARY_MAP: Record<string, string[]> = {
  Connected: [
    "in the mix",
    "part of something",
    "people actually hit me up",
    "got my crew",
    "feeling included",
  ],
  Disconnected: [
    "out of the loop",
    "on the outside",
    "left behind",
    "drifting",
    "hard to reach people",
  ],
  "On Edge": [
    "overthinking it",
    "afraid of looking stupid",
    "worried about saying the wrong thing",
    "dreading small talk",
    "on guard",
  ],
  Invisible: [
    "nobody notices",
    "easy to forget",
    "blending into the background",
    "not on anyone's radar",
    "just there",
  ],
  "Locked In": [
    "in my zone",
    "everything's clicking",
    "feeling sharp",
    "dialed in",
    "on a roll",
  ],
  Uncertain: [
    "second-guessing myself",
    "not sure where I stand",
    "reading the room wrong",
    "don't know my next move",
    "stuck between options",
  ],
  Overwhelmed: [
    "too many people",
    "can't keep up",
    "socially drained",
    "everything at once",
    "need to disappear for a bit",
  ],
  Solid: [
    "steady",
    "nothing's bothering me",
    "comfortable in my own skin",
    "good place right now",
    "no complaints",
  ],
  Lost: [
    "don't know what I want",
    "going through the motions",
    "no direction",
    "disconnected from myself",
    "stuck",
  ],
  Frustrated: [
    "people don't get it",
    "tired of trying",
    "hitting a wall",
    "same stuff different day",
    "fed up",
  ],
  "On My Own": [
    "doing everything solo",
    "no one to call",
    "used to it by now",
    "wish I had a crew",
    "lonely but won't say it",
  ],
  "Fired Up": [
    "ready to go",
    "looking for action",
    "feeling unstoppable",
    "got energy to burn",
    "want to meet people",
  ],
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

// ─── First-visit only: What brought you here? ──────────────────
function MotivationStep({
  onNext,
}: {
  onNext: (motivation: MotivationId) => void;
}) {
  const [selected, setSelected] = useState<MotivationId | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={0} total={4} />
      <div className="flex-1 flex flex-col pt-6">
        <p className="text-coral font-semibold text-sm uppercase tracking-wide">
          Quick check-in
        </p>
        <h2 className="text-2xl font-bold text-navy mt-3 leading-snug">
          What brought you here?
        </h2>
        <p className="text-navy/40 text-sm mt-2">
          Pick the one that fits best.
        </p>

        <div className="mt-6 space-y-2.5">
          {MOTIVATION_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all text-left min-h-[52px] active:scale-[0.98] ${
                selected === id
                  ? "border-coral bg-coral/5"
                  : "border-navy/10 bg-white hover:border-navy/20"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  selected === id ? "text-coral" : "text-navy/35"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  selected === id ? "text-navy" : "text-navy/70"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── First-visit only: Adaptive follow-up ──────────────────────
function FollowUpStep({
  motivation,
  onNext,
}: {
  motivation: MotivationId;
  onNext: (response: string) => void;
}) {
  const [response, setResponse] = useState("");
  const question = FOLLOW_UP_QUESTIONS[motivation];

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={1} total={4} />
      <div className="flex-1 flex flex-col pt-6">
        <h2 className="text-2xl font-bold text-navy leading-snug">
          {question}
        </h2>
        <p className="text-navy/40 text-sm mt-2">
          No right answer — just what comes to mind.
        </p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="I'd say..."
          rows={5}
          className="mt-6 w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none text-base leading-relaxed"
        />
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={response.trim().length < 5}
          onClick={() => onNext(response.trim())}
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Emoji selection (1-3 emojis) ──────────────────────────────
function EmojiSelection({
  onNext,
  stepIndex,
  totalSteps,
}: {
  onNext: (selections: { emoji: string; label: string }[]) => void;
  stepIndex: number;
  totalSteps: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const maxReached = selected.length >= 3;

  function toggleEmoji(label: string) {
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
        <h2 className="text-2xl font-bold text-navy">
          How are you feeling today?
        </h2>
        <p className="text-navy/50 mt-2">
          Pick up to 3 that fit. No wrong answers.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-8">
          {EMOJI_OPTIONS.map(({ emoji, label }) => {
            const isSelected = selected.includes(label);
            const isBlocked = maxReached && !isSelected;
            return (
              <button
                key={label}
                onClick={() => toggleEmoji(label)}
                className={`flex flex-col items-center gap-1.5 py-4 px-2 min-h-[76px] rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-coral bg-coral/5 scale-105 shadow-sm"
                    : isBlocked
                      ? "border-navy/5 bg-white/50 opacity-40 cursor-not-allowed"
                      : "border-navy/10 bg-white hover:border-navy/20 active:scale-95"
                }`}
              >
                <span
                  className={`text-3xl ${isSelected ? "animate-emoji-pop" : ""}`}
                >
                  {emoji}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isSelected ? "text-coral" : "text-navy/60"
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
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={selected.length === 0}
          onClick={() => {
            const selections = selected.map((label) => {
              const opt = EMOJI_OPTIONS.find((o) => o.label === label)!;
              return { emoji: opt.emoji, label: opt.label };
            });
            onNext(selections);
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

// ─── Vocabulary builder (multi-emoji) ──────────────────────────
function VocabularyBuilder({
  selections,
  onSubmit,
  saving,
  stepIndex,
  totalSteps,
}: {
  selections: { emoji: string; label: string }[];
  onSubmit: (words: string[], extra: string) => void;
  saving: boolean;
  stepIndex: number;
  totalSteps: number;
}) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [extra, setExtra] = useState("");

  function toggleWord(word: string) {
    setSelectedWords((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 3) return prev;
      return [...prev, word];
    });
  }

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={stepIndex} total={totalSteps} />
      <div className="flex-1 flex flex-col pt-6">
        <div className="flex justify-center gap-3 mb-6">
          {selections.map(({ emoji }) => (
            <span key={emoji} className="text-5xl">{emoji}</span>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-navy text-center">
          Can you get more specific?
        </h2>
        <p className="text-navy/50 mt-2 text-center text-sm">
          Pick up to 3 that resonate.
        </p>

        <div className="mt-8 space-y-5">
          {selections.map(({ emoji, label }) => {
            const words = VOCABULARY_MAP[label] || [];
            return (
              <div key={label}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-medium text-navy/40 uppercase tracking-wide">{label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {words.map((word) => (
                    <button
                      key={word}
                      onClick={() => toggleWord(word)}
                      disabled={selectedWords.length >= 3 && !selectedWords.includes(word)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedWords.includes(word)
                          ? "bg-coral text-white shadow-sm scale-105"
                          : selectedWords.length >= 3
                            ? "bg-white/50 text-navy/30 border border-navy/5 cursor-not-allowed"
                            : "bg-white text-navy/70 border border-navy/10 hover:border-navy/20 active:scale-95"
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Anything else?"
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
          />
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={selectedWords.length === 0 || saving}
          onClick={() => onSubmit(selectedWords, extra.trim())}
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
export default function CheckinPage() {
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const router = useRouter();

  // First-visit steps: 0=motivation, 1=follow-up, 2=emoji, 3=vocab (4 steps)
  // Return-visit steps: 0=emoji, 1=vocab (2 steps)
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Collected data
  const [motivation, setMotivation] = useState<MotivationId | null>(null);
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [emojiSelections, setEmojiSelections] = useState<
    { emoji: string; label: string }[]
  >([]);

  // Check if this is a return visit
  useEffect(() => {
    async function checkReturning() {
      try {
        const res = await fetch("/api/checkins");
        if (res.ok) {
          const data = await res.json();
          setIsReturning(data.isReturning);
        }
      } catch {
        // Default to first-visit flow
      } finally {
        setLoading(false);
      }
    }
    checkReturning();
  }, []);

  const totalSteps = isReturning ? 2 : 4;

  function goToStep(next: number) {
    setDirection(next > step ? "forward" : "back");
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setIsTransitioning(false);
    }, 200);
  }

  // First-visit handlers
  function handleMotivationSelect(id: MotivationId) {
    setMotivation(id);
    goToStep(1);
  }

  function handleFollowUp(response: string) {
    setFollowUpResponse(response);
    goToStep(2);
  }

  // Shared handlers
  function handleEmojiSelect(selections: { emoji: string; label: string }[]) {
    setEmojiSelections(selections);
    goToStep(isReturning ? 1 : 3);
  }

  async function handleVocabularySubmit(words: string[], extra: string) {
    if (emojiSelections.length === 0) return;
    // First-visit requires motivation to have been selected
    if (!isReturning && !motivation) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        emoji: emojiSelections[0].emoji,
        emojis: emojiSelections.map((s) => s.emoji),
        emotion_words: words,
        verbal_description: extra || null,
      };

      // Only include behavioral data on first visit
      if (!isReturning) {
        body.avoidance_response = motivation;
        body.follow_up_response = followUpResponse;
      }

      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const result = await res.json();
        console.error("Check-in API error:", result);
        alert(`Save failed: ${result.detail || result.error}`);
        throw new Error(result.error || "Failed to save check-in");
      }
      const result = await res.json();
      setExiting(true);
      await new Promise((r) => setTimeout(r, 300));
      router.push(result.tutorial_completed ? "/companion" : "/tutorial");
    } catch (err) {
      console.error("Failed to save check-in:", err);
    } finally {
      setSaving(false);
    }
  }

  const translateClass = isTransitioning
    ? direction === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-cream items-center justify-center">
        <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`transition-all duration-200 ease-out ${translateClass}`}
      >
        {isReturning ? (
          <>
            {step === 0 && (
              <EmojiSelection
                onNext={handleEmojiSelect}
                stepIndex={0}
                totalSteps={totalSteps}
              />
            )}
            {step === 1 && emojiSelections.length > 0 && (
              <VocabularyBuilder
                selections={emojiSelections}
                onSubmit={handleVocabularySubmit}
                saving={saving}
                stepIndex={1}
                totalSteps={totalSteps}
              />
            )}
          </>
        ) : (
          <>
            {step === 0 && (
              <MotivationStep onNext={handleMotivationSelect} />
            )}
            {step === 1 && motivation && (
              <FollowUpStep motivation={motivation} onNext={handleFollowUp} />
            )}
            {step === 2 && (
              <EmojiSelection
                onNext={handleEmojiSelect}
                stepIndex={2}
                totalSteps={totalSteps}
              />
            )}
            {step === 3 && emojiSelections.length > 0 && (
              <VocabularyBuilder
                selections={emojiSelections}
                onSubmit={handleVocabularySubmit}
                saving={saving}
                stepIndex={3}
                totalSteps={totalSteps}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
