"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Target, Compass, Flame } from "lucide-react";

const CARDS = [
  {
    icon: "emoji" as const,
    emoji: "⚡",
    title: "Your Coach",
    copy: "This is your coach. Not a therapist, not a chatbot \u2014 a straight-talking friend who helps you build social confidence. Check in anytime.",
  },
  {
    icon: "lucide" as const,
    LucideIcon: Brain,
    title: "Skills",
    copy: "Real social skills for real situations. Gym, work events, rec leagues \u2014 practical moves you can use today, not theory.",
  },
  {
    icon: "lucide" as const,
    LucideIcon: Target,
    title: "Practice",
    copy: "Role-play social scenarios with AI before you do them for real. Three difficulty levels: Friendly, Cold Read, and Tough Crowd.",
  },
  {
    icon: "lucide" as const,
    LucideIcon: Compass,
    title: "Go Mode",
    copy: "Find things to do near you. Events, meetups, pickup games. See who else is going solo and match up if you want.",
  },
  {
    icon: "lucide" as const,
    LucideIcon: Flame,
    title: "How Points Work",
    copy: "Everything you do builds momentum. Check-ins, practice sessions, showing up IRL \u2014 it all counts. The more you do in the real world, the more it matters.",
  },
] as const;

export default function TutorialPage() {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isLast = current === CARDS.length - 1;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= CARDS.length || isAnimating) return;
      setDirection(next > current ? "left" : "right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setIsAnimating(false);
      }, 200);
    },
    [current, isAnimating]
  );

  async function finish() {
    // Mark tutorial complete, then navigate
    try {
      await fetch("/api/tutorial", { method: "POST" });
    } catch {
      // Don't block navigation on failure
    }
    setExiting(true);
    setTimeout(() => router.replace("/companion"), 300);
  }

  function skip() {
    finish();
  }

  // Swipe handling
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function onTouchMove(e: React.TouchEvent) {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function onTouchEnd() {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0 && current < CARDS.length - 1) {
        goTo(current + 1);
      } else if (touchDeltaX.current > 0 && current > 0) {
        goTo(current - 1);
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (isLast) finish();
        else goTo(current + 1);
      } else if (e.key === "ArrowLeft") {
        goTo(current - 1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isLast, goTo]);

  const card = CARDS[current];

  const animateClass = isAnimating
    ? direction === "left"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <div
      className={`min-h-screen bg-cream flex flex-col transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      {/* Skip button */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={skip}
          className="text-sm font-medium text-navy/40 hover:text-navy/60 transition-colors py-1 px-2"
        >
          Skip
        </button>
      </div>

      {/* Card content */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center px-8"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`flex flex-col items-center text-center transition-all duration-200 ease-out ${animateClass}`}
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-navy/5 flex items-center justify-center mb-8">
            {card.icon === "emoji" ? (
              <span className="text-4xl">{card.emoji}</span>
            ) : (
              <card.LucideIcon className="w-10 h-10 text-coral" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-navy mb-4">{card.title}</h2>

          {/* Copy */}
          <p className="text-navy/60 text-base leading-relaxed max-w-sm">
            {card.copy}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-10">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-6">
          {CARDS.map((_, i) => (
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

        {/* CTA / Tap to advance */}
        {isLast ? (
          <button
            onClick={finish}
            className="w-full bg-coral hover:bg-coral-hover text-white font-semibold py-4 rounded-2xl text-lg transition-colors active:scale-[0.98]"
          >
            Got it — let&apos;s go
          </button>
        ) : (
          <button
            onClick={() => goTo(current + 1)}
            className="w-full py-4 text-navy/30 text-sm font-medium transition-colors hover:text-navy/50"
          >
            Tap or swipe to continue
          </button>
        )}
      </div>
    </div>
  );
}
