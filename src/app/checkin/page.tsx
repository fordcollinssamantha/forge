"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap, Compass, Users, MapPin, Search } from "lucide-react";

type Step = 0 | 1 | 2 | 3;

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

function ProgressDots({ current, total }: { current: Step; total: number }) {
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

// ─── STEP 0: What brought you here? ──────────────────────────
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

// ─── STEP 1: Adaptive follow-up ──────────────────────────────
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

// ─── STEP 2: Emoji selection ─────────────────────────────────
function EmojiSelection({
  onNext,
}: {
  onNext: (emoji: string, label: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={2} total={4} />
      <div className="flex-1 flex flex-col pt-6">
        <h2 className="text-2xl font-bold text-navy">
          How does your social life feel right now?
        </h2>
        <p className="text-navy/50 mt-2">
          Pick the one that fits. No wrong answers.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-8">
          {EMOJI_OPTIONS.map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`flex flex-col items-center gap-1.5 py-4 px-2 min-h-[76px] rounded-2xl border-2 transition-all duration-200 ${
                selected === label
                  ? "border-coral bg-coral/5 scale-105 shadow-sm"
                  : "border-navy/10 bg-white hover:border-navy/20 active:scale-95"
              }`}
            >
              <span
                className={`text-3xl ${selected === label ? "animate-emoji-pop" : ""}`}
              >
                {emoji}
              </span>
              <span
                className={`text-xs font-medium ${
                  selected === label ? "text-coral" : "text-navy/60"
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
          onClick={() => {
            if (!selected) return;
            const option = EMOJI_OPTIONS.find((o) => o.label === selected)!;
            onNext(option.emoji, option.label);
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

// ─── STEP 3: Vocabulary builder ──────────────────────────────
function VocabularyBuilder({
  emoji,
  label,
  onSubmit,
  saving,
}: {
  emoji: string;
  label: string;
  onSubmit: (words: string[], extra: string) => void;
  saving: boolean;
}) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [extra, setExtra] = useState("");

  const words = VOCABULARY_MAP[label] || [];

  function toggleWord(word: string) {
    setSelectedWords((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 3) return prev;
      return [...prev, word];
    });
  }

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={3} total={4} />
      <div className="flex-1 flex flex-col pt-6">
        <div className="text-center mb-6">
          <span className="text-6xl">{emoji}</span>
        </div>

        <h2 className="text-2xl font-bold text-navy text-center">
          Can you get more specific?
        </h2>
        <p className="text-navy/50 mt-2 text-center text-sm">
          Pick up to 3 that resonate.
        </p>

        <div className="flex flex-wrap gap-2.5 mt-8 justify-center">
          {words.map((word) => (
            <button
              key={word}
              onClick={() => toggleWord(word)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedWords.includes(word)
                  ? "bg-coral text-white shadow-sm scale-105"
                  : "bg-white text-navy/70 border border-navy/10 hover:border-navy/20 active:scale-95"
              }`}
            >
              {word}
            </button>
          ))}
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
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  // Collected data
  const [motivation, setMotivation] = useState<MotivationId | null>(null);
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [emojiData, setEmojiData] = useState<{
    emoji: string;
    label: string;
  } | null>(null);

  function goToStep(next: Step) {
    setDirection(next > step ? "forward" : "back");
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setIsTransitioning(false);
    }, 200);
  }

  function handleMotivationSelect(id: MotivationId) {
    setMotivation(id);
    goToStep(1);
  }

  function handleFollowUp(response: string) {
    setFollowUpResponse(response);
    goToStep(2);
  }

  function handleEmojiSelect(emoji: string, label: string) {
    setEmojiData({ emoji, label });
    goToStep(3);
  }

  async function handleVocabularySubmit(words: string[], extra: string) {
    if (!motivation || !emojiData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivation,
          avoidance_response: followUpResponse,
          follow_up_response: motivation,
          emoji: emojiData.emoji,
          emotion_words: words,
          verbal_description: extra || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        console.error("Check-in API error:", body);
        alert(`Save failed: ${body.detail || body.error}`);
        throw new Error(body.error || "Failed to save check-in");
      }
      setExiting(true);
      await new Promise((r) => setTimeout(r, 300));
      router.push("/companion");
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

  return (
    <div
      className={`overflow-hidden transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`transition-all duration-200 ease-out ${translateClass}`}
      >
        {step === 0 && (
          <MotivationStep onNext={handleMotivationSelect} />
        )}
        {step === 1 && motivation && (
          <FollowUpStep motivation={motivation} onNext={handleFollowUp} />
        )}
        {step === 2 && <EmojiSelection onNext={handleEmojiSelect} />}
        {step === 3 && emojiData && (
          <VocabularyBuilder
            emoji={emojiData.emoji}
            label={emojiData.label}
            onSubmit={handleVocabularySubmit}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
