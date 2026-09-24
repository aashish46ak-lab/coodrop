/** ShareTemp app limits & ID helpers.
 *  File codes: ST + letter + 2 digits (e.g. STa23)
 *  Folder codes: SHR + letter + 2 digits (e.g. SHRa23)
 *  Legacy (still resolvable): CO* / COD*
 */

function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MB = 1024 * 1024;

/** @deprecated Use SHARETEMP — kept as alias for existing imports */
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

export const SHARETEMP = CODROP;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";
export const VIDEO_ACCEPT = ".mp4,.webm,.mov,.ogv,.mkv";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

/** Normalize individual drop/file code. New: STa23. Legacy: COe22. */
export function normalizeCode(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, "");
  // New format
  const st = cleaned.match(/^st([a-zA-Z])(\d{2})$/i);
  if (st) return `ST${st[1]!.toLowerCase()}${st[2]}`;
  // Legacy CODrop
  const co = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (co) return `CO${co[1]!.toLowerCase()}${co[2]}`;
  return "";
}

/** Parse any share code: file (ST/CO) or folder (SHR/COD). */
export function normalizeAnyCode(
  raw: string,
): { kind: "drop" | "batch"; code: string } | null {
  const cleaned = raw.trim().replace(/\s+/g, "");

  // Folder / batch — new
  const shr = cleaned.match(/^shr([a-zA-Z])(\d{2})$/i);
  if (shr) return { kind: "batch", code: `SHR${shr[1]!.toLowerCase()}${shr[2]}` };

  // Folder / batch — legacy
  const cod = cleaned.match(/^cod([a-zA-Z])(\d{2})$/i);
  if (cod) return { kind: "batch", code: `COD${cod[1]!.toLowerCase()}${cod[2]}` };

  // File — new
  const st = cleaned.match(/^st([a-zA-Z])(\d{2})$/i);
  if (st) return { kind: "drop", code: `ST${st[1]!.toLowerCase()}${st[2]}` };

  // File — legacy
  const co = cleaned.match(/^co([a-zA-Z])(\d{2})$/i);
  if (co) return { kind: "drop", code: `CO${co[1]!.toLowerCase()}${co[2]}` };

  return null;
}
