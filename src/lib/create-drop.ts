import { supabase } from "@/integrations/supabase/client";
import { CODROP } from "./codrop-config";
import { hashPassword } from "./password";

export type CreatedDrop = {
  code: string;
  expiresAt: string;
  title: string;
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
    return "Database not set up. Run the CODrop SQL in Supabase.";
  if (lower.includes("jwt") || lower.includes("api key") || lower.includes("invalid api"))
    return "Invalid Supabase API key. Check env vars on Vercel.";
  if (lower.includes("bucket") || lower.includes("not found") || lower.includes("404"))
    return "Storage bucket \"drops\" missing. Create a private bucket named drops.";
  if (lower.includes("policy") || lower.includes("row-level") || lower.includes("403") || lower.includes("401"))
    return "Upload blocked. Add storage INSERT policy for bucket drops (anon)."
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
}): Promise<CreatedDrop> {
  const title = args.title.trim().slice(0, 120);
  if (!title) throw new Error("Title is required.");

  const params: Record<string, string | number | null | undefined> = {
    p_type: args.type,
    p_title: title,
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
  return { code: row.code, expiresAt: row.expires_at, title };
}

export async function createTextDrop(
  content: string,
  title: string,
  password?: string,
): Promise<CreatedDrop> {
  if (!title.trim()) throw new Error("Title is required.");
  if (!content.trim()) throw new Error("Add some text before sharing.");
  if (content.length > CODROP.maxTextLength) {
    throw new Error("That text is too long to share.");
  }
  return insertDrop({ type: "text", content, title, password });
}

function extensionOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase().slice(0, 8)}` : "";
}

/** Upload via Supabase client (handles new publishable keys better). */
async function uploadFile(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  onProgress(5);

  // Prefer official client upload
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

  // Fallback: raw XHR (progress + alternate auth headers)
  const baseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
  if (!baseUrl || !key) {
    throw new Error(friendly(error.message));
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/storage/v1/object/drops/${path}`);
    xhr.setRequestHeader("apikey", key);
    // New sb_publishable keys are not JWTs - avoid Bearer when needed
    if (!key.startsWith("sb_publishable_") && !key.startsWith("sb_secret_")) {
      xhr.setRequestHeader("authorization", `Bearer ${key}`);
    } else {
      xhr.setRequestHeader("authorization", `Bearer ${key}`);
    }
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
      } else {
        reject(
          new Error(
            friendly(
              `Upload failed ${xhr.status}: ${xhr.responseText || error.message}`,
            ),
          ),
        );
      }
    };
    xhr.onerror = () => reject(new Error("Network problem during upload."));
    xhr.send(file);
  });
}

export async function createFileDrop(
  kind: "image" | "video",
  file: File,
  onProgress: (percent: number) => void,
  _signal?: AbortSignal,
  title?: string,
  password?: string,
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
  });
}
