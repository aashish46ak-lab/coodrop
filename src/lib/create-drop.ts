import { supabase } from "@/integrations/supabase/client";
import { CODROP } from "./codrop-config";
import { hashPassword } from "./password";
import { getOrCreateBatch } from "./batch";

export type CreatedDrop = {
  code: string;
  expiresAt: string;
  title: string;
  batchCode: string;
};

type DropRpcRow = { code: string; expires_at: string };

function friendly(message: string): string {
  const lower = (message || "").toLowerCase();
  if (lower.includes("empty_content")) return "Add some text before sharing.";
  if (lower.includes("content_too_large")) return "That text is too large to share.";
  if (lower.includes("missing_file")) return "Pick a file before sharing.";
  if (lower.includes("missing_title") || lower.includes("empty_title"))
    return "Title is required.";
  if (lower.includes("invalid_type")) return "That kind of drop is not supported.";
  if (lower.includes("no_code_available"))
    return "All share codes are busy. Please try again.";
  if (lower.includes("function") || lower.includes("does not exist"))
    return "Database not set up. Run the latest CODrop SQL in Supabase.";
  if (lower.includes("jwt") || lower.includes("api key") || lower.includes("invalid api"))
    return "Invalid Supabase API key. Check env vars on Vercel.";
  if (lower.includes("bucket") || lower.includes("404"))
    return "Storage bucket \"drops\" missing. Create a private bucket named drops.";
  if (lower.includes("policy") || lower.includes("403") || lower.includes("401"))
    return "Upload blocked. Add storage INSERT policy for bucket drops (anon).";
  const short = (message || "").slice(0, 140);
  return short ? `Couldn't create drop: ${short}` : "We could not create your drop. Please try again.";
}

async function insertDrop(args: {
  type: "text" | "image" | "video";
  content?: string | null;
  storagePath?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  title: string;
  password?: string | null;
  ttlHours?: number;
}): Promise<CreatedDrop> {
  const title = args.title.trim().slice(0, 120);
  if (!title) throw new Error("Title is required.");

  const batch = getOrCreateBatch();
  const ttl = args.ttlHours && [1, 6, 24].includes(args.ttlHours) ? args.ttlHours : 24;

  const params: Record<string, string | number | null | undefined> = {
    p_type: args.type,
    p_title: title,
    p_batch_code: batch.code,
    p_ttl_hours: ttl,
  };
  if (args.content != null) params.p_content = args.content;
  if (args.storagePath != null) params.p_storage_path = args.storagePath;
  if (args.originalFilename != null) params.p_original_filename = args.originalFilename;
  if (args.mimeType != null) params.p_mime_type = args.mimeType;
  if (args.fileSize != null) params.p_file_size = args.fileSize;

  if (args.password && args.password.trim()) {
    params.p_password_hash = await hashPassword(args.password);
  }

  const { data, error } = await supabase.rpc("create_drop", params);

  if (error) {
    console.error("[CODrop] create_drop error:", error);
    throw new Error(friendly(error.message ?? error.code ?? ""));
  }
  const row = (Array.isArray(data) ? data[0] : data) as DropRpcRow | undefined;
  if (!row?.code) throw new Error("We could not create your drop. Please try again.");
  return {
    code: row.code,
    expiresAt: row.expires_at,
    title,
    batchCode: batch.code,
  };
}

export async function createTextDrop(
  content: string,
  title: string,
  password?: string,
  ttlHours?: number,
): Promise<CreatedDrop> {
  if (!title.trim()) throw new Error("Title is required.");
  if (!content.trim()) throw new Error("Add some text before sharing.");
  if (content.length > CODROP.maxTextLength) {
    throw new Error("That text is too long to share.");
  }
  return insertDrop({ type: "text", content, title, password, ttlHours });
}

function extensionOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase().slice(0, 8)}` : "";
}

async function uploadFile(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  onProgress(5);
  const { error } = await supabase.storage.from("drops").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (!error) {
    onProgress(100);
    return;
  }
  console.error("[CODrop] storage upload error:", error);
  throw new Error(friendly(error.message));
}

export async function createFileDrop(
  kind: "image" | "video",
  file: File,
  onProgress: (percent: number) => void,
  _signal?: AbortSignal,
  title?: string,
  password?: string,
  ttlHours?: number,
): Promise<CreatedDrop> {
  if (!title?.trim()) throw new Error("Title is required.");

  const allowed = kind === "image" ? CODROP.imageMimeTypes : CODROP.videoMimeTypes;
  const maxBytes = kind === "image" ? CODROP.maxImageBytes : CODROP.maxVideoBytes;

  if (!allowed.includes(file.type as never)) {
    throw new Error("That file type is not supported.");
  }
  if (file.size > maxBytes) {
    throw new Error("That file is larger than the allowed limit.");
  }

  const path = `${kind}/${crypto.randomUUID()}${extensionOf(file.name)}`;
  await uploadFile(path, file, onProgress);

  return insertDrop({
    type: kind,
    storagePath: path,
    originalFilename: file.name.slice(0, 200),
    mimeType: file.type,
    fileSize: file.size,
    title,
    password,
    ttlHours,
  });
}
