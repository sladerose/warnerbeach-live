export type ReportCategory =
  | "event"
  | "missing_pet"
  | "burst_pipe"
  | "hazard"
  | "lost_found"
  | "other";

export type ReportStatus = "active" | "resolved";

export interface Report {
  id: string;
  category: ReportCategory;
  title: string;
  description: string | null;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  occurred_at: string;
  created_at: string;
  status: ReportStatus;
  contact_info: string | null;
  image_url: string | null;
}

export const CATEGORY_META: Record<
  ReportCategory,
  { label: string; badge: string; dot: string }
> = {
  event: {
    label: "Event",
    badge: "bg-violet-100 text-violet-800",
    dot: "bg-violet-500",
  },
  missing_pet: {
    label: "Missing pet",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  burst_pipe: {
    label: "Burst pipe",
    badge: "bg-cyan-100 text-cyan-800",
    dot: "bg-cyan-500",
  },
  hazard: {
    label: "Hazard",
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-500",
  },
  lost_found: {
    label: "Lost & found",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  other: {
    label: "Other",
    badge: "bg-zinc-100 text-zinc-700",
    dot: "bg-zinc-500",
  },
};

export const CATEGORY_ORDER: ReportCategory[] = [
  "event",
  "missing_pet",
  "burst_pipe",
  "hazard",
  "lost_found",
  "other",
];
