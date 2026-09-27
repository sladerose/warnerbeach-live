"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, ListBullets, X } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_ORDER, type Report, type ReportCategory } from "@/lib/types";
import { CategoryFilter } from "./CategoryFilter";
import { ReportCard } from "./ReportCard";
import { ReportFormDrawer } from "./ReportFormDrawer";

const MAX_REPORTS = 300;

const FeedMap = dynamic(() => import("./FeedMap").then((m) => m.FeedMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
      Loading map…
    </div>
  ),
});

export function FeedApp({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [activeCategories, setActiveCategories] = useState<Set<ReportCategory>>(
    new Set(CATEGORY_ORDER)
  );
  const [selected, setSelected] = useState<Report | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placingPin, setPlacingPin] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const channel = supabase
      .channel("reports-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => {
          const next = payload.new as Report;
          setReports((prev) =>
            prev.some((r) => r.id === next.id)
              ? prev
              : [next, ...prev]
                  .sort(
                    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
                  )
                  .slice(0, MAX_REPORTS)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reports" },
        (payload) => {
          const next = payload.new as Report;
          setReports((prev) => prev.map((r) => (r.id === next.id ? next : r)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function toggleCategory(category: ReportCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next.size === 0 ? new Set(CATEGORY_ORDER) : next;
    });
  }

  const filtered = useMemo(
    () => reports.filter((r) => activeCategories.has(r.category)),
    [reports, activeCategories]
  );

  const activeCount = useMemo(
    () => reports.filter((r) => r.status === "active").length,
    [reports]
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-zinc-50">
      <div className="absolute inset-0">
        <FeedMap
          reports={filtered}
          selected={selected}
          onSelect={setSelected}
          pinEditable={formOpen}
          pinCoords={pinCoords}
          onPinChange={setPinCoords}
          placingPin={placingPin}
          onPlacingClick={(coords) => {
            setPinCoords(coords);
            setPlacingPin(false);
          }}
        />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md sm:px-4 sm:py-2.5">
            <button
              onClick={() => setListOpen((v) => !v)}
              aria-label={listOpen ? "Hide list" : "Show list"}
              aria-pressed={listOpen}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100"
            >
              {listOpen ? <X className="size-5" /> : <ListBullets className="size-5" />}
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                Warner Beach Live
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                Live · {activeCount} active report{activeCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto">
            <CategoryFilter active={activeCategories} onToggle={toggleCategory} />
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="pointer-events-auto ml-auto hidden items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-blue-500 active:scale-[0.98] sm:flex"
          >
            <Plus weight="bold" className="size-4" />
            Report something
          </button>
        </div>
      </header>

      <AnimatePresence>
        {listOpen && (
          <motion.div
            key="list-panel"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 z-20 max-h-[65dvh] overflow-hidden rounded-t-2xl border-t border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-md lg:inset-x-auto lg:bottom-6 lg:left-6 lg:top-24 lg:w-[380px] lg:max-h-none lg:rounded-2xl lg:border"
          >
            <div className="h-full overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-zinc-300 py-12 text-center">
                  <p className="text-sm font-medium text-zinc-600">Nothing here yet.</p>
                  <p className="text-sm text-zinc-400">Be the first to report something.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      active={selected?.id === report.id}
                      onSelect={() => setSelected(report)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setFormOpen(true)}
        aria-label="Report something"
        className={`absolute bottom-6 right-6 z-30 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:bg-blue-500 active:scale-95 sm:hidden ${
          listOpen ? "hidden" : "flex size-14"
        }`}
      >
        <Plus weight="bold" className="size-6" />
      </button>

      <ReportFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setPinCoords(null);
          setPlacingPin(false);
        }}
        coords={pinCoords}
        onCoordsChange={setPinCoords}
        placingPin={placingPin}
        onStartPlacing={() => setPlacingPin(true)}
        onCancelPlacing={() => setPlacingPin(false)}
      />
    </div>
  );
}
