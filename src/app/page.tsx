import { supabase } from "@/lib/supabase";
import { FeedApp } from "@/components/FeedApp";
import type { Report } from "@/lib/types";

export const revalidate = 0;

export default async function Home() {
  const { data } = await supabase
    .from("reports")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(200);

  return <FeedApp initialReports={(data as Report[]) ?? []} />;
}
