"use client";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-navy/8 overflow-hidden">
      <div className="skeleton h-40 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-navy/8 p-4 flex items-center gap-3.5">
      <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4 px-4 pt-8 pb-24">
      <div className="space-y-1 mb-6">
        <div className="skeleton h-7 w-48" />
        <div className="skeleton h-4 w-32 mt-1" />
      </div>
      <div className="skeleton h-20 w-full rounded-2xl" />
      <div className="skeleton h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="skeleton h-44 w-full rounded-2xl" />
    </div>
  );
}
