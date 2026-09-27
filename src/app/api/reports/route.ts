import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CATEGORY_ORDER, type ReportCategory } from "@/lib/types";

const SALT = process.env.IP_HASH_SALT;

function hashIp(ip: string) {
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(request: Request) {
  if (!SALT) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Bots that
  // autofill every input do. Pretend success without inserting.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const category = body.category as ReportCategory;
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) || null : null;
  const locationText =
    typeof body.location_text === "string" ? body.location_text.trim().slice(0, 200) || null : null;
  const lat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : null;
  const lng = typeof body.lng === "number" && Number.isFinite(body.lng) ? body.lng : null;
  const occurredAt = typeof body.occurred_at === "string" ? body.occurred_at : "";
  const contactInfo =
    typeof body.contact_info === "string" ? body.contact_info.trim().slice(0, 200) || null : null;

  if (!CATEGORY_ORDER.includes(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  }
  if (lat === null || lng === null) {
    return NextResponse.json({ error: "invalid_location" }, { status: 400 });
  }
  if (!occurredAt || Number.isNaN(new Date(occurredAt).getTime())) {
    return NextResponse.json({ error: "invalid_occurred_at" }, { status: 400 });
  }

  const ipHash = hashIp(getClientIp(request));

  const { data, error } = await supabase.rpc("submit_report", {
    p_ip_hash: ipHash,
    p_category: category,
    p_title: title,
    p_description: description,
    p_location_text: locationText,
    p_lat: lat,
    p_lng: lng,
    p_occurred_at: new Date(occurredAt).toISOString(),
    p_contact_info: contactInfo,
  });

  if (error) {
    if (error.message.includes("too_fast")) {
      return NextResponse.json({ error: "too_fast" }, { status: 429 });
    }
    if (error.message.includes("rate_limited")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, report: data.report, resolve_token: data.resolve_token });
}
