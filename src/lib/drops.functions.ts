import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type DropResult =
  | { state: "not_found" }
  | { state: "expired" }
  | { state: "locked"; code: string; title: string | null; expiresAt: string }
  | {
      state: "ok";
      code: string;
      type: "text" | "image" | "video";
      title: string | null;
      content: string | null;
      fileUrl: string | null;
      originalFilename: string | null;
      mimeType: string | null;
      fileSize: number | null;
      createdAt: string;
      expiresAt: string;
      locked?: boolean;
    };

function getPublicSupabase() {
  const url =
    process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "";
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

/** File codes: STa23 (new) or COe22 (legacy). */
function normalizeDropCode(raw: string): string | null {
  const cleaned = String(raw ?? "").trim().replace(/\s+/g, "");
  const st = cleaned.match(/^st([a-zA-Z])(\d{2})$/i);
  if (st) return `ST${st[1]!.toLowerCase()}${st[2]}`;
  const co = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (co) return `CO${co[1]!.toLowerCase()}${co[2]}`;
  return null;
}

async function sha256(password: string): Promise<string> {
  const data = new TextEncoder().encode(password.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const getDrop = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string; password?: string }) => {
    const code = normalizeDropCode(String(data?.code ?? ""));
    // Keep invalid codes as empty so handler returns not_found (no throw)
    return {
      code: code ?? "",
      password: data.password ? String(data.password) : undefined,
    };
  })
  .handler(async ({ data }): Promise<DropResult> => {
    if (!data.code) return { state: "not_found" };

    const supabase = getPublicSupabase();

    let { data: row, error } = await supabase
      .from("shared_drops")
      .select(
        "code, type, content, storage_path, original_filename, mime_type, file_size, created_at, expires_at, status, metadata",
      )
      .eq("code", data.code)
      .maybeSingle();

    if (!row && !error) {
      const alt = await supabase
        .from("shared_drops")
        .select(
          "code, type, content, storage_path, original_filename, mime_type, file_size, created_at, expires_at, status, metadata",
        )
        .ilike("code", data.code)
        .maybeSingle();
      row = alt.data;
      error = alt.error;
    }

    if (error) {
      console.error("[ShareTemp] getDrop error:", error);
      throw new Error("lookup_failed");
    }
    if (!row) return { state: "not_found" };

    const expired = new Date(row.expires_at).getTime() <= Date.now();
    if (expired || row.status !== "active") return { state: "expired" };

    const meta = (row.metadata ?? {}) as { title?: string; password_hash?: string };
    const title =
      typeof meta.title === "string" && meta.title.trim()
        ? meta.title.trim().slice(0, 120)
        : null;
    const passwordHash =
      typeof meta.password_hash === "string" ? meta.password_hash : null;

    if (passwordHash) {
      if (!data.password) {
        return {
          state: "locked",
          code: row.code,
          title,
          expiresAt: row.expires_at,
        };
      }
      const attempt = await sha256(data.password);
      if (attempt !== passwordHash) {
        return {
          state: "locked",
          code: row.code,
          title,
          expiresAt: row.expires_at,
        };
      }
    }

    let fileUrl: string | null = null;
    if (row.storage_path) {
      const { data: signed } = await supabase.storage
        .from("drops")
        .createSignedUrl(row.storage_path, 60 * 60);
      fileUrl = signed?.signedUrl ?? null;
    }

    return {
      state: "ok",
      code: row.code,
      type: row.type as "text" | "image" | "video",
      title,
      content: row.content ?? null,
      fileUrl,
      originalFilename: row.original_filename ?? null,
      mimeType: row.mime_type ?? null,
      fileSize: row.file_size ?? null,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  });
