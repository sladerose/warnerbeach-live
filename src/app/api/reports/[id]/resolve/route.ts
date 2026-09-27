import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!UUID_RE.test(id) || !UUID_RE.test(token)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("resolve_report", {
    p_id: id,
    p_token: token,
  });

  if (error) {
    if (error.message.includes("forbidden")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (error.message.includes("not_found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: "resolve_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, report: data });
}
