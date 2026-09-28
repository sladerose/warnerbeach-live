"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, CheckCircle, Spinner } from "@phosphor-icons/react";
import { CATEGORY_META, type Report } from "@/lib/types";
import { getOwnedReportToken } from "@/lib/ownedReports";

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
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [ownedToken, setOwnedToken] = useState<string | null>(null);

  useEffect(() => {
    // Reading localStorage must stay in an effect: this component is
    // server-rendered first, and localStorage doesn't exist there.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOwnedToken(getOwnedReportToken(report.id));
  }, [report.id]);

  const canResolve = report.status === "active" && ownedToken !== null;

  async function markResolved(e: React.MouseEvent) {
    e.stopPropagation();
    const token = ownedToken;
    if (!token || resolving) return;
    setResolving(true);
    setResolveError(null);
    const res = await fetch(`/api/reports/${report.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
    setResolving(false);
    if (!res || !res.ok) {
      setResolveError("Could not mark resolved. Try again.");
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
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

      <div className="mt-3 flex items-center justify-between gap-2">
        {report.location_text ? (
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-500">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{report.location_text}</span>
          </div>
        ) : (
          <span />
        )}

        {canResolve && (
          <button
            type="button"
            onClick={markResolved}
            disabled={resolving}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          >
            {resolving ? (
              <Spinner className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle className="size-3.5" />
            )}
            Mark resolved
          </button>
        )}
      </div>

      {resolveError && (
        <p className="mt-1.5 text-right text-xs text-rose-600">{resolveError}</p>
      )}
    </div>
  );
}
