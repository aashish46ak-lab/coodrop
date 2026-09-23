import { supabase } from "@/integrations/supabase/client";
import { CODROP } from "./codrop-config";

export type CreatedDrop = {
  code: string;
  expiresAt: string;
  title?: string | null;
};

type DropRpcRow = { code: string; expires_at: string };

const FRIENDLY_ERRORS: Record<string, string> = {
  empty_content: "Add some text before sharing.",
  content_too_large: "That text is too large to share.",
  missing_file: "Pick a file before sharing.",
  invalid_type: "That kind of drop is not supported.",
  no_code_available: "All share codes are busy right now. Please try again in a moment.",
  function: "Database function missing. Run the CODrop SQL migration in Supabase.",
  permission: "Permission denied. Check Supabase RLS policies and grants.",
  network: "Network error reaching Supabase. Check your URL and key.",
};

function friendly(message: string): string {
  const lower = (message || "").toLowerCase();
  for (const key of Object.keys(FRIENDLY_ERRORS)) {
    if (lower.includes(key)) return FRIENDLY_ERRORS[key]!;
  }
  if (lower.includes("does not exist") || lower.includes("could not find")) {
    return "Database not set up. Run the create_drop SQL in Supabase SQL Editor.";
  }
  if (lower.includes("jwt") || lower.includes("api key") || lower.includes("invalid api")) {
    return "Invalid Supabase API key. Check VITE_SUPABASE_PUBLISHABLE_KEY on Vercel.";
  }
  const short = (message || "").slice(0, 120);
  return short
    ? `Couldn't create drop: ${short}`
    : "We could not create your drop. Please try again.";
}

async function insertDrop(args: {
  type: "text" | "image" | "video";
  content?: string | null;
  storagePath?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  title?: string | null;
}): Promise<CreatedDrop> {
  const params: Record<string, string | number | null | undefined> = {
    p_type: args.type,
  };
  if (args.content != null) params.p_content = args.content;
  if (args.storagePath != null) params.p_storage_path = args.storagePath;
  if (args.originalFilename != null) params.p_original_filename = args.originalFilename;
  if (args.mimeType != null) params.p_mime_type = args.mimeType;
  if (args.fileSize != null) params.p_file_size = args.fileSize;
  const title = args.title?.trim().slice(0, 120) || null;
  if (title) params.p_title = title;

  const { data, error } = await supabase.rpc("create_drop", params);

  if (error) {
    console.error("[CODrop] create_drop error:", error);
    throw new Error(friendly(error.message ?? error.code ?? ""));
  }
  const row = (Array.isArray(data) ? data[0] : data) as DropRpcRow | undefined;
  if (!row?.code) throw new Error("We could not create your drop. Please try again.");
  return { code: row.code, expiresAt: row.expires_at, title };
}

export async function createTextDrop(
  content: string,
  title?: string,
): Promise<CreatedDrop> {
  if (!content.trim()) throw new Error("Add some text before sharing.");
  if (content.length > CODROP.maxTextLength) {
    throw new Error("That text is too long to share.");
  }
  return insertDrop({ type: "text", content, title });
}

function extensionOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase().slice(0, 8)}` : "";
}

function uploadWithProgress(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl = import.meta.env["VITE_SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!baseUrl || !key) {
    return Promise.reject(
      new Error("Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."),
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/storage/v1/object/drops/${path}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("authorization", `Bearer ${key}`);
    xhr.setRequestHeader("x-upsert", "false");
    if (file.type) xhr.setRequestHeader("content-type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else if (xhr.status === 413) {
        reject(new Error("That file is too large to upload."));
      } else {
        reject(
          new Error(
            `Upload failed (${xhr.status}). Check storage bucket "drops" and upload policy.`,
          ),
        );
      }
    };
    xhr.onerror = () => reject(new Error("Network problem during upload. Check Supabase URL."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}

export async function createFileDrop(
  kind: "image" | "video",
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
  title?: string,
): Promise<CreatedDrop> {
  const allowed = kind === "image" ? CODROP.imageMimeTypes : CODROP.videoMimeTypes;
  const maxBytes = kind === "image" ? CODROP.maxImageBytes : CODROP.maxVideoBytes;

  if (!allowed.includes(file.type as never)) {
    throw new Error("That file type is not supported.");
  }
  if (file.size > maxBytes) {
    throw new Error("That file is larger than the allowed limit.");
  }

  const path = `${kind}/${crypto.randomUUID()}${extensionOf(file.name)}`;
  await uploadWithProgress(path, file, onProgress, signal);

  return insertDrop({
    type: kind,
    storagePath: path,
    originalFilename: file.name.slice(0, 200),
    mimeType: file.type,
    fileSize: file.size,
    title,
  });
}
