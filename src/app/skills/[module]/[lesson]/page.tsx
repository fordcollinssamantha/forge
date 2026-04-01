"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Swords } from "lucide-react";
import { getModule, type LessonSections } from "@/lib/skills-data";
import { getScenarioForLesson } from "@/lib/practice-data";

const SECTION_KEYS: { key: keyof LessonSections; label: string }[] = [
  { key: "move", label: "The Move" },
  { key: "tell", label: "The Tell" },
  { key: "pivot", label: "The Pivot" },
  { key: "exitGood", label: "The Exit" },
];

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.module as string;
  const lessonId = params.lesson as string;
  const module = getModule(moduleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof LessonSections>("move");

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!module) return;
    const idx = module.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= 0) setCurrentIndex(idx);
  }, [module, lessonId]);

  // Reset tab when switching lessons
  useEffect(() => {
    setActiveTab("move");
  }, [currentIndex]);

  useEffect(() => {
    async function loadCompletions() {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const data = await res.json();
          setCompletedLessons(data.completions?.[moduleId] || []);
        }
      } catch {
        // Fall back to empty
      }
    }
    loadCompletions();
  }, [moduleId]);

  const goToLesson = useCallback(
    (index: number) => {
      if (!module) return;
      if (index < 0 || index >= module.lessons.length) return;
      setCurrentIndex(index);
      // Update URL without full navigation
      window.history.replaceState(
        null,
        "",
        `/skills/${moduleId}/${module.lessons[index].id}`
      );
    },
    [module, moduleId]
  );

  async function markComplete() {
    if (!module) return;
    const lesson = module.lessons[currentIndex];
    if (completedLessons.includes(lesson.id)) return;

    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId: lesson.id }),
      });
      if (res.ok) {
        setCompletedLessons((prev) => [...prev, lesson.id]);
        // Award points for exploring a skill (fire-and-forget, deduplicated server-side)
        fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "skill_card", referenceId: `${moduleId}:${lesson.id}` }),
        }).catch(() => {});
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  }

  // Touch handlers for swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    setDragOffset(delta);
  }

  function handleTouchEnd() {
    if (!dragging) return;
    setDragging(false);
    const threshold = 60;
    if (touchDeltaX.current < -threshold) {
      goToLesson(currentIndex + 1);
    } else if (touchDeltaX.current > threshold) {
      goToLesson(currentIndex - 1);
    }
    setDragOffset(0);
  }

  if (!module) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream items-center justify-center">
        <p className="text-navy/50">Module not found.</p>
      </div>
    );
  }

  const lesson = module.lessons[currentIndex];
  const isComplete = completedLessons.includes(lesson.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === module.lessons.length - 1;

  const renderSectionContent = () => {
    const sections = lesson.sections;
    if (activeTab === "exitGood") {
      return (
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
              Good exit
            </span>
            <p className="text-[15px] leading-relaxed text-navy/70 mt-1">
              {sections.exitGood}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-navy/40 uppercase tracking-wide">
              Tough exit
            </span>
            <p className="text-[15px] leading-relaxed text-navy/70 mt-1">
              {sections.exitTough}
            </p>
          </div>
        </div>
      );
    }
    return (
      <p className="text-[15px] leading-relaxed text-navy/70">
        {sections[activeTab]}
      </p>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() => router.push(`/skills/${moduleId}`)}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-medium text-navy/40">
            {currentIndex + 1} of {module.lessons.length}
          </span>
        </div>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center py-3 bg-white">
        {module.lessons.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 bg-coral"
                : completedLessons.includes(module.lessons[i].id)
                  ? "w-1.5 bg-coral/40"
                  : "w-1.5 bg-navy/15"
            }`}
          />
        ))}
      </div>

      {/* Swipeable card area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden px-4 py-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`h-full ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateX(${dragOffset}px)`,
          }}
        >
          <div className="h-full bg-white border border-navy/8 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-navy/6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{module.icon}</span>
                <span className="text-[11px] font-medium text-navy/35 uppercase tracking-wide">
                  {module.title}
                </span>
              </div>
              <h2 className="text-xl font-bold text-navy leading-snug">
                {lesson.title}
              </h2>
              <p className="text-sm text-navy/55 mt-1.5 leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-navy/6 px-2 bg-navy/[0.02]">
              {SECTION_KEYS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors relative ${
                    activeTab === key
                      ? "text-coral"
                      : "text-navy/35 hover:text-navy/55"
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-coral rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Card body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {renderSectionContent()}

              {/* Practice this button */}
              {(() => {
                const practiceScenario = getScenarioForLesson(lesson.id);
                if (!practiceScenario) return null;
                return (
                  <button
                    onClick={() => router.push(`/skills/practice/${practiceScenario.id}`)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-steel/10 text-steel font-semibold text-[13px] rounded-xl hover:bg-steel/15 transition-colors"
                  >
                    <Swords className="w-4 h-4" />
                    Practice this scenario
                  </button>
                );
              })()}
            </div>

            {/* Card footer with nav arrows and "Got it" */}
            <div className="px-5 py-4 border-t border-navy/6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToLesson(currentIndex - 1)}
                  disabled={isFirst}
                  className="p-2.5 rounded-xl border border-navy/10 text-navy/40 hover:bg-navy/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={isComplete ? () => goToLesson(currentIndex + 1) : markComplete}
                  disabled={saving || (isComplete && isLast)}
                  className={`flex-1 font-semibold py-3 rounded-xl text-[15px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isComplete
                      ? isLast
                        ? "bg-navy/8 text-navy/40 cursor-default"
                        : "bg-navy/8 text-navy/60 hover:bg-navy/12"
                      : "bg-coral text-white hover:bg-coral-hover"
                  }`}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isComplete ? (
                    isLast ? (
                      <>
                        <Check className="w-4 h-4" />
                        All done
                      </>
                    ) : (
                      "Next lesson"
                    )
                  ) : (
                    "Got it"
                  )}
                </button>

                <button
                  onClick={() => goToLesson(currentIndex + 1)}
                  disabled={isLast}
                  className="p-2.5 rounded-xl border border-navy/10 text-navy/40 hover:bg-navy/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
