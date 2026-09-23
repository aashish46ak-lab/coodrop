/**
 * CODrop configuration. Limits can be tuned via environment variables so they
 * are not hardcoded across the app.
 */

function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MB = 1024 * 1024;

export const CODROP = {
  /** Maximum characters for a text drop. */
  maxTextLength: envNumber(import.meta.env["VITE_MAX_TEXT_CHARS"], 500_000),
  /** Maximum image upload size in bytes. */
  maxImageBytes: envNumber(import.meta.env["VITE_MAX_IMAGE_MB"], 25) * MB,
  /** Maximum video upload size in bytes. */
  maxVideoBytes: envNumber(import.meta.env["VITE_MAX_VIDEO_MB"], 200) * MB,
  imageMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  videoMimeTypes: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/ogg",
    "video/x-matroska",
  ],
  ttlHours: 24,
} as const;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";
export const VIDEO_ACCEPT = ".mp4,.webm,.mov,.ogv,.mkv";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

export function normalizeCode(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, "");
  const match = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (!match) return "";
  return `CO${match[1]!.toLowerCase()}${match[2]}`;
}
