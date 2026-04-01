"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import { SKILL_MODULES } from "@/lib/skills-data";
import { SkeletonRow } from "@/components/skeleton";

export default function SkillsPage() {
  const router = useRouter();
  const [completions, setCompletions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompletions() {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const data = await res.json();
          setCompletions(data.completions || {});
        }
      } catch {
        // Fall back to empty
      } finally {
        setLoading(false);
      }
    }
    loadCompletions();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white border-b border-navy/8">
        <h1 className="text-2xl font-bold text-navy">Skills</h1>
        <p className="text-navy/50 text-sm mt-1">
          Practical moves you can use today.
        </p>
      </div>

      {/* Module Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : SKILL_MODULES.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-navy/15 mx-auto mb-3" />
            <p className="text-sm font-medium text-navy/40">
              Skills library is loading.
            </p>
            <p className="text-xs text-navy/30 mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {SKILL_MODULES.map((module) => {
              const completed = completions[module.id]?.length || 0;
              const total = module.lessons.length;

              return (
                <button
                  key={module.id}
                  onClick={() => router.push(`/skills/${module.id}`)}
                  className="w-full bg-white border border-navy/8 rounded-2xl p-4 text-left transition-all hover:border-navy/15 hover:shadow-sm active:scale-[0.98] shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="text-2xl shrink-0 mt-0.5">{module.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-navy truncate">
                          {module.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-navy/25 shrink-0" />
                      </div>
                      <p className="text-xs text-navy/40">
                        {total} {total === 1 ? "lesson" : "lessons"}
                        {completed > 0 && (
                          <span className="text-navy/50 font-medium">
                            {" "}
                            &middot; {completed} explored
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
