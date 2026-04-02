"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import CityAutocomplete from "@/components/CityAutocomplete";

type Screen = 0 | 1 | 2 | 3;

const MOTIVATION_OPTIONS = [
  { id: "new_city", label: "I moved somewhere new and don\u2019t know anyone" },
  { id: "talking", label: "I want to get better at talking to people" },
  { id: "social_life", label: "My social life isn\u2019t where I want it to be" },
  { id: "find_things", label: "I want to find things to do and people to do them with" },
  { id: "curious", label: "Just curious what this is" },
  { id: "other", label: "Something else" },
] as const;

type MotivationId = (typeof MOTIVATION_OPTIONS)[number]["id"];

function ProgressDots({ current, total = 4 }: { current: number; total?: number }) {
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

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={0} />
      <div className="flex-1 flex flex-col justify-center -mt-8">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mb-8">
          <span className="text-2xl font-extrabold text-cream">F</span>
        </div>

        <p className="text-navy/50 text-base font-medium">
          Hey. Thanks for being here.
        </p>

        <h1 className="text-2xl font-bold text-navy mt-4 leading-snug">
          Forge is like a gym for your social life.
        </h1>

        <p className="text-navy/60 text-base mt-4 leading-relaxed">
          We&apos;ll help you build real confidence, find cool things to do,
          and make it easier to show up.
        </p>

        <p className="text-navy/40 text-sm mt-6">
          But first, I need to get to know you a bit.
        </p>
      </div>

      <div className="w-full pb-10">
        <button
          onClick={onNext}
          className="w-full bg-coral hover:bg-coral-hover text-white font-semibold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          Let&apos;s do it
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ProfileScreen({
  onNext,
}: {
  onNext: (data: { name: string; age: number; city: string; isCustomCity: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [isCustomCity, setIsCustomCity] = useState(false);

  const isValid = name.trim() && age && parseInt(age) >= 18 && city.trim();

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={1} />
      <div className="flex-1 flex flex-col pt-8">
        <h2 className="text-2xl font-bold text-navy leading-snug">
          Tell me a little about yourself
        </h2>
        <p className="text-navy/50 mt-2 text-sm">
          Just the basics — this helps me personalize things for you.
        </p>

        <div className="mt-10 space-y-5">
          <div>
            <label className="text-sm font-medium text-navy/70 mb-1.5 block">
              First name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should I call you?"
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy/70 mb-1.5 block">
              Age
            </label>
            <input
              type="number"
              min={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age (18+)"
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy/70 mb-1.5 block">
              City
            </label>
            <CityAutocomplete
              value={city}
              onChange={(c, custom) => {
                setCity(c);
                setIsCustomCity(custom);
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={!isValid}
          onClick={() =>
            isValid &&
            onNext({ name: name.trim(), age: parseInt(age), city: city.trim(), isCustomCity })
          }
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function MotivationScreen({
  onNext,
}: {
  onNext: (motivation: string) => void;
}) {
  const [selected, setSelected] = useState<MotivationId | null>(null);
  const [customText, setCustomText] = useState("");

  const isValid = selected && (selected !== "other" || customText.trim().length > 0);
  const motivationValue = selected === "other"
    ? customText.trim()
    : selected || "";

  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={2} />
      <div className="flex-1 flex flex-col pt-6">
        <h2 className="text-2xl font-bold text-navy leading-snug">
          What brought you to Forge?
        </h2>
        <p className="text-navy/50 mt-2 text-sm">
          Pick the one that fits best.
        </p>

        <div className="mt-6 space-y-2.5">
          {MOTIVATION_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all min-h-[52px] active:scale-[0.98] ${
                selected === id
                  ? "border-coral bg-coral/5"
                  : "border-navy/10 bg-white hover:border-navy/20"
              }`}
            >
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

        {selected === "other" && (
          <div className="mt-4">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Tell us in your own words"
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
            />
          </div>
        )}
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={!isValid}
          onClick={() => isValid && onNext(motivationValue)}
          className="w-full bg-coral text-white font-semibold py-4 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-coral-hover active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ToneScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={3} />
      <div className="flex-1 flex flex-col justify-center -mt-12">
        <p className="text-coral font-semibold text-lg">One more thing...</p>
        <div className="mt-6 space-y-5">
          <p className="text-navy text-xl leading-relaxed font-medium">
            This isn&apos;t therapy. It&apos;s not a dating app. It&apos;s a
            place to build your social confidence — at your own pace.
          </p>
          <p className="text-navy/70 text-lg leading-relaxed">
            Think of it like a gym. Some days you stretch. Some days you lift.
            Some days you just show up. All of it counts.
          </p>
        </div>
      </div>

      <div className="w-full pb-10">
        <button
          onClick={onFinish}
          className="w-full bg-coral hover:bg-coral-hover text-white font-semibold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          Let&apos;s go
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [screen, setScreen] = useState<Screen>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    age: number;
    city: string;
    isCustomCity: boolean;
  } | null>(null);
  const { user } = useUser();
  const router = useRouter();

  function goToScreen(next: Screen) {
    setDirection(next > screen ? "forward" : "back");
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(next);
      setIsTransitioning(false);
    }, 200);
  }

  function handleProfileNext(data: {
    name: string;
    age: number;
    city: string;
    isCustomCity: boolean;
  }) {
    setProfileData(data);
    goToScreen(2);
  }

  async function handleMotivationSubmit(motivation: string) {
    if (!user || !profileData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.name,
          age: profileData.age,
          city: profileData.city,
          is_custom_city: profileData.isCustomCity,
          motivation,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("API error detail:", body);
        throw new Error(body.detail || body.error || "Failed to save profile");
      }
      goToScreen(3);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Don't block onboarding if motivation save fails — still advance
      goToScreen(3);
    } finally {
      setSaving(false);
    }
  }

  function handleFinish() {
    setExiting(true);
    setTimeout(() => router.push("/checkin"), 300);
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
        {screen === 0 && <WelcomeScreen onNext={() => goToScreen(1)} />}
        {screen === 1 && (
          <ProfileScreen onNext={handleProfileNext} />
        )}
        {screen === 2 && (
          <div className="relative">
            <MotivationScreen onNext={handleMotivationSubmit} />
            {saving && (
              <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
        {screen === 3 && <ToneScreen onFinish={handleFinish} />}
      </div>
    </div>
  );
}
