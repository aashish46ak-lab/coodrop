import { createServerFn } from "@tanstack/react-start";

export type DropResult =
  | { state: "not_found" }
  | { state: "expired" }
  | {
      state: "ok";
      code: string;
      type: "text" | "image" | "video";
      content: string | null;
      fileUrl: string | null;
      originalFilename: string | null;
      mimeType: string | null;
      fileSize: number | null;
      createdAt: string;
      expiresAt: string;
    };

/**
 * Public read of a drop by share code. Expired drops are never returned with
 * their content — the database row is also hidden by row level security.
 */
export const getDrop = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => {
    const match = String(data?.code ?? "").match(/^co([a-zA-Z])(\d{2})$/i);
    if (!match) throw new Error("invalid_code");
    return { code: `CO${match[1].toLowerCase()}${match[2]}` };
  })
  .handler(async ({ data }): Promise<DropResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("shared_drops")
      .select(
        "code, type, content, storage_path, original_filename, mime_type, file_size, created_at, expires_at, status",
      )
      .eq("code", data.code)
      .maybeSingle();

    if (error) throw new Error("lookup_failed");
    if (!row) return { state: "not_found" };

    const expired = new Date(row.expires_at).getTime() <= Date.now();
    if (expired || row.status !== "active") return { state: "expired" };

    let fileUrl: string | null = null;
    if (row.storage_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("drops")
        .createSignedUrl(row.storage_path, 60 * 60, {
          download: false,
        });
      fileUrl = signed?.signedUrl ?? null;
    }

    return {
      state: "ok",
      code: row.code,
      type: row.type as "text" | "image" | "video",
      content: row.content ?? null,
      fileUrl,
      originalFilename: row.original_filename ?? null,
      mimeType: row.mime_type ?? null,
      fileSize: row.file_size ?? null,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  });
