"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getModule } from "@/lib/skills-data";

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.module as string;
  const module = getModule(moduleId);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

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

  if (!module) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream items-center justify-center">
        <p className="text-navy/50">Module not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-navy/8">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/skills")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-navy leading-tight">
              {module.icon} {module.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
        <div className="space-y-2.5">
          {module.lessons.map((lesson, index) => {
            const isComplete = completedLessons.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() =>
                  router.push(`/skills/${moduleId}/${lesson.id}`)
                }
                className="w-full bg-white border border-navy/8 rounded-xl p-4 text-left transition-all hover:border-navy/15 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isComplete
                        ? "bg-coral text-white"
                        : "bg-navy/8 text-navy/40"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-[15px] font-semibold leading-tight ${
                        isComplete ? "text-navy/50" : "text-navy"
                      }`}
                    >
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-navy/45 mt-1 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
