"use client";

import { formatDistanceToNow } from "date-fns";
import { MapPin, CheckCircle } from "@phosphor-icons/react";
import { CATEGORY_META, type Report } from "@/lib/types";

export function ReportCard({
  report,
  active,
  onSelect,
}: {
  report: Report;
  active: boolean;
  onSelect: () => void;
}) {
  const meta = CATEGORY_META[report.category];

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-blue-400 bg-blue-50"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
          >
            {meta.label}
          </span>
          {report.status === "resolved" && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              <CheckCircle weight="fill" className="size-3.5" />
              Resolved
            </span>
          )}
        </div>
        <time className="shrink-0 text-xs text-zinc-500">
          {formatDistanceToNow(new Date(report.occurred_at), { addSuffix: true })}
        </time>
      </div>

      <h3 className="mt-2 text-base font-semibold text-zinc-900">
        {report.title}
      </h3>

      {report.description && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
          {report.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500">
        <MapPin className="size-4 shrink-0" />
        <span className="truncate">{report.location_text}</span>
      </div>
    </button>
  );
}
