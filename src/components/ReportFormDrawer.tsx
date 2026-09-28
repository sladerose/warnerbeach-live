"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, Crosshair, MapPinLine, Spinner } from "@phosphor-icons/react";
import { CATEGORY_META, CATEGORY_ORDER, type ReportCategory } from "@/lib/types";
import { saveOwnedReport } from "@/lib/ownedReports";

function nowForInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ReportFormDrawer({
  open,
  onClose,
  coords,
  onCoordsChange,
  placingPin,
  onStartPlacing,
  onCancelPlacing,
}: {
  open: boolean;
  onClose: () => void;
  coords: { lat: number; lng: number } | null;
  onCoordsChange: (coords: { lat: number; lng: number } | null) => void;
  placingPin: boolean;
  onStartPlacing: () => void;
  onCancelPlacing: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [locating, setLocating] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [occurredAt, setOccurredAt] = useState(nowForInput());
  const [contactInfo, setContactInfo] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, must stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCategory(null);
    setTitle("");
    setDescription("");
    setLocationText("");
    onCoordsChange(null);
    setOccurredAt(nowForInput());
    setContactInfo("");
    setWebsite("");
    setError(null);
    setManualEntryOpen(false);
    setManualLat("");
    setManualLng("");
    setManualError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation. Drop a pin on the map instead.");
      return;
    }
    onCancelPlacing();
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoordsChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Drop a pin on the map instead."
            : "Could not get your location. Drop a pin on the map instead."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function applyManualCoords() {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setManualError("Latitude must be a number between -90 and 90.");
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setManualError("Longitude must be a number between -180 and 180.");
      return;
    }
    onCancelPlacing();
    onCoordsChange({ lat, lng });
    setManualError(null);
    setManualEntryOpen(false);
    setManualLat("");
    setManualLng("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError("Choose a category.");
      return;
    }
    if (!coords) {
      setError("Drop a pin first: use your location or right-click the map.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title: title.trim(),
        description: description.trim() || null,
        location_text: locationText.trim() || null,
        lat: coords.lat,
        lng: coords.lng,
        occurred_at: new Date(occurredAt).toISOString(),
        contact_info: contactInfo.trim() || null,
        website,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error === "too_fast") {
        setError("Please wait a few seconds before posting again.");
      } else if (body?.error === "rate_limited") {
        setError("You've posted a few reports already, try again in a bit.");
      } else {
        setError("Could not post this report. Try again.");
      }
      return;
    }

    const body = await res.json().catch(() => null);
    if (body?.report?.id && body?.resolve_token) {
      saveOwnedReport(body.report.id, body.resolve_token);
    }

    handleClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 bg-zinc-900/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Report something"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white p-6 shadow-2xl sm:inset-x-auto sm:right-6 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-md sm:-translate-y-1/2 sm:rounded-2xl sm:border"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Report something
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Category
                </label>
                <div
                  role="radiogroup"
                  aria-label="Category"
                  className="flex flex-wrap gap-2"
                >
                  {CATEGORY_ORDER.map((c) => {
                    const meta = CATEGORY_META[c];
                    const isActive = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setCategory(c)}
                        className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "border-transparent bg-zinc-900 text-zinc-50"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        <span className={`size-2 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium text-zinc-700">
                  Title
                </label>
                <input
                  id="title"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Small dog missing near the lagoon"
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-zinc-700">
                  Details <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brown and white spaniel, answers to Buddy, last seen near the tidal pool."
                  className="resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="location" className="text-sm font-medium text-zinc-700">
                  Location
                </label>
                <div className="flex gap-2">
                  <input
                    id="location"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="Optional label, e.g. near the tidal pool"
                    className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={useMyLocation}
                    aria-label="Use my current location"
                    className="flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-zinc-600 hover:border-zinc-300"
                  >
                    {locating ? (
                      <Spinner className="size-4 animate-spin" />
                    ) : (
                      <Crosshair className="size-4" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={placingPin ? onCancelPlacing : onStartPlacing}
                  aria-pressed={placingPin}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    placingPin
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <MapPinLine className="size-4" />
                  {placingPin ? "Cancel" : coords ? "Move pin on map" : "Drop pin on map"}
                </button>

                {placingPin ? (
                  <p className="text-xs text-blue-600">Click anywhere on the map to drop your pin.</p>
                ) : coords ? (
                  <p className="text-xs text-emerald-600">
                    Pin dropped. Drag it on the map to adjust.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Use your current location, or drop a pin on the map.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setManualEntryOpen((v) => !v);
                    setManualError(null);
                  }}
                  aria-pressed={manualEntryOpen}
                  className="self-start text-xs font-medium text-zinc-500 underline decoration-dotted hover:text-zinc-700"
                >
                  {manualEntryOpen ? "Cancel manual entry" : "Or enter coordinates manually"}
                </button>

                {manualEntryOpen && (
                  <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex gap-2">
                      <div className="flex flex-1 flex-col gap-1">
                        <label htmlFor="manual-lat" className="text-xs font-medium text-zinc-600">
                          Latitude
                        </label>
                        <input
                          id="manual-lat"
                          type="text"
                          inputMode="decimal"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          placeholder="-30.0825"
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <label htmlFor="manual-lng" className="text-xs font-medium text-zinc-600">
                          Longitude
                        </label>
                        <input
                          id="manual-lng"
                          type="text"
                          inputMode="decimal"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          placeholder="30.8628"
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                    {manualError && (
                      <p className="text-xs text-rose-600">{manualError}</p>
                    )}
                    <button
                      type="button"
                      onClick={applyManualCoords}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                    >
                      Set pin
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="occurred" className="text-sm font-medium text-zinc-700">
                  When
                </label>
                <input
                  id="occurred"
                  type="datetime-local"
                  required
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact" className="text-sm font-medium text-zinc-700">
                  Contact <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="WhatsApp 082 000 0000"
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Honeypot: hidden from real users, bots that autofill every field trip it. */}
              <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !coords}
                className="mt-1 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting && <Spinner className="size-4 animate-spin" />}
                Post to the feed
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
