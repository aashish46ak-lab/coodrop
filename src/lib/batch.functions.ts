import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type BatchItem = {
  code: string;
  type: string;
  title: string;
  expiresAt: string;
  createdAt: string;
  hasPassword: boolean;
};

function getPublicSupabase() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "";
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"] ||
    "";
  if (!url || !key) throw new Error("missing_supabase_env");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Folder codes: SHRa23 (new) or CODr21 (legacy). */
function normalizeBatchCode(raw: string): string | null {
  const cleaned = String(raw ?? "").trim().replace(/\s+/g, "");
  const shr = cleaned.match(/^shr([a-zA-Z])(\d{2})$/i);
  if (shr) return `SHR${shr[1]!.toLowerCase()}${shr[2]}`;
  const cod = cleaned.match(/^cod([a-zA-Z])(\d{2})$/i);
  if (cod) return `COD${cod[1]!.toLowerCase()}${cod[2]}`;
  return null;
}

export const listBatch = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => {
    const code = normalizeBatchCode(String(data?.code ?? ""));
    return { code: code ?? "" };
  })
  .handler(async ({ data }): Promise<{ state: "ok" | "not_found"; items: BatchItem[] }> => {
    if (!data.code) return { state: "not_found", items: [] };

    const supabase = getPublicSupabase();
    const { data: rows, error } = await supabase.rpc("list_batch_drops", {
      p_batch_code: data.code,
    });
    if (error) {
      console.error("[ShareTemp] list_batch error:", error);
      return { state: "not_found", items: [] };
    }
    const items = (rows ?? []).map(
      (r: {
        code: string;
        type: string;
        title: string;
        expires_at: string;
        created_at: string;
        has_password: boolean;
      }) => ({
        code: r.code,
        type: r.type,
        title: r.title,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
        hasPassword: !!r.has_password,
      }),
    );
    return { state: items.length ? "ok" : "not_found", items };
  });
