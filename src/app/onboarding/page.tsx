"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Screen = 0 | 1 | 2;

function ProgressDots({ current }: { current: Screen }) {
  return (
    <div className="flex gap-2 justify-center pt-8 pb-6">
      {[0, 1, 2].map((i) => (
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
  onNext: (data: { name: string; age: number; city: string }) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");

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
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Where are you based?"
              className="w-full px-4 py-3.5 rounded-xl bg-white border border-navy/10 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="w-full pb-10 pt-6">
        <button
          disabled={!isValid}
          onClick={() =>
            isValid &&
            onNext({ name: name.trim(), age: parseInt(age), city: city.trim() })
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

function ToneScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col min-h-screen px-6 bg-cream">
      <ProgressDots current={2} />
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

  async function handleProfileSubmit(data: {
    name: string;
    age: number;
    city: string;
  }) {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.name,
          age: data.age,
          city: data.city,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save profile");
      }
      goToScreen(2);
    } catch (err) {
      console.error("Failed to save profile:", err);
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
          <div className="relative">
            <ProfileScreen onNext={handleProfileSubmit} />
            {saving && (
              <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
        {screen === 2 && <ToneScreen onFinish={handleFinish} />}
      </div>
    </div>
  );
}
