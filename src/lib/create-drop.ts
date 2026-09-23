import { supabase } from "@/integrations/supabase/client";
import { CODROP } from "./codrop-config";

export type CreatedDrop = { code: string; expiresAt: string };

type DropRpcRow = { code: string; expires_at: string };

const FRIENDLY_ERRORS: Record<string, string> = {
  empty_content: "Add some text before sharing.",
  content_too_large: "That text is too large to share.",
  missing_file: "Pick a file before sharing.",
  invalid_type: "That kind of drop isn't supported.",
  no_code_available: "All share codes are busy right now. Please try again in a moment.",
};

function friendly(message: string): string {
  for (const key of Object.keys(FRIENDLY_ERRORS)) {
    if (message.includes(key)) return FRIENDLY_ERRORS[key]!;
  }
  return "We couldn't create your drop. Please try again.";
}

async function insertDrop(args: {
  type: "text" | "image" | "video";
  content?: string | null;
  storagePath?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}): Promise<CreatedDrop> {
  const { data, error } = await supabase.rpc("create_drop", {
    p_type: args.type,
    p_content: args.content ?? null,
    p_storage_path: args.storagePath ?? null,
    p_original_filename: args.originalFilename ?? null,
    p_mime_type: args.mimeType ?? null,
    p_file_size: args.fileSize ?? null,
  });

  if (error) throw new Error(friendly(error.message ?? ""));
  const row = (Array.isArray(data) ? data[0] : data) as DropRpcRow | undefined;
  if (!row?.code) throw new Error("We couldn't create your drop. Please try again.");
  return { code: row.code, expiresAt: row.expires_at };
}

export async function createTextDrop(content: string): Promise<CreatedDrop> {
  if (!content.trim()) throw new Error("Add some text before sharing.");
  if (content.length > CODROP.maxTextLength) {
    throw new Error("That text is too long to share.");
  }
  return insertDrop({ type: "text", content });
}

function extensionOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase().slice(0, 8)}` : "";
}

/** Uploads a file to storage with real progress reporting. */
function uploadWithProgress(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl = import.meta.env["VITE_SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

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
        reject(new Error("The upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network problem during upload. Please try again."));
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
): Promise<CreatedDrop> {
  const allowed = kind === "image" ? CODROP.imageMimeTypes : CODROP.videoMimeTypes;
  const maxBytes = kind === "image" ? CODROP.maxImageBytes : CODROP.maxVideoBytes;

  if (!allowed.includes(file.type as never)) {
    throw new Error("That file type isn't supported.");
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
  });
}
