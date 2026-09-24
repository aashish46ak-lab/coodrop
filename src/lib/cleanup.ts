import { supabase } from "@/integrations/supabase/client";

const KEY = "codrop_last_cleanup";
const DAY = 24 * 60 * 60 * 1000;

/** Call cleanup_expired_drops at most once per day per browser. */
export async function maybeCleanupExpired() {
  if (typeof window === "undefined") return;
  try {
    const last = Number(localStorage.getItem(KEY) || "0");
    if (Date.now() - last < DAY) return;
    localStorage.setItem(KEY, String(Date.now()));
    await supabase.rpc("cleanup_expired_drops");
  } catch {
    // ignore
  }
}
