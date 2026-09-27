"use client";

import { CATEGORY_META, CATEGORY_ORDER, type ReportCategory } from "@/lib/types";

export function CategoryFilter({
  active,
  onToggle,
}: {
  active: Set<ReportCategory>;
  onToggle: (category: ReportCategory) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        const isActive = active.has(category);
        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            aria-pressed={isActive}
            className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-colors ${
              isActive
                ? "border-zinc-200 bg-white/95 text-zinc-700 hover:border-zinc-300"
                : "border-zinc-100 bg-white/60 text-zinc-400 hover:border-zinc-200"
            }`}
          >
            <span className={`size-2 rounded-full ${meta.dot} ${isActive ? "" : "opacity-40"}`} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
