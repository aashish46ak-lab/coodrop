function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MB = 1024 * 1024;

export const CODROP = {
  maxTextLength: envNumber(import.meta.env["VITE_MAX_TEXT_CHARS"], 500_000),
  maxImageBytes: envNumber(import.meta.env["VITE_MAX_IMAGE_MB"], 25) * MB,
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
  ttlOptions: [
    { hours: 1, label: "1 hour" },
    { hours: 6, label: "6 hours" },
    { hours: 24, label: "24 hours" },
  ] as const,
} as const;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";
export const VIDEO_ACCEPT = ".mp4,.webm,.mov,.ogv,.mkv";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

/** Individual drop: COe22 */
export function normalizeCode(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, "");
  const match = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (!match) return "";
  return `CO${match[1]!.toLowerCase()}${match[2]}`;
}

/** Batch main: CODr21 */
export function normalizeAnyCode(raw: string): { kind: "drop" | "batch"; code: string } | null {
  const cleaned = raw.trim().replace(/\s+/g, "");
  const batch = cleaned.match(/^cod([a-zA-Z])(\d{2})$/i);
  if (batch) return { kind: "batch", code: `COD${batch[1]!.toLowerCase()}${batch[2]}` };
  const drop = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (drop) return { kind: "drop", code: `CO${drop[1]!.toLowerCase()}${drop[2]}` };
  return null;
}
