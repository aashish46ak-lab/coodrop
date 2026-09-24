/** Folder / batch code format: SHR + letter + 2 digits (e.g. SHRa23).
 *  Legacy batch codes COD* remain resolvable when looking up.
 */

const BATCH_KEY = "sharetemp_batch_v1";
const LEGACY_BATCH_KEY = "codrop_batch_v1";

export type BatchSession = {
  code: string;
  createdAt: string;
  expiresAt: string;
};

function randomBatchCode(): string {
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const num = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `SHR${letter}${num}`;
}

/** Get or create a 24h folder session for this browser (multi-share main code). */
export function getOrCreateBatch(): BatchSession {
  if (typeof window === "undefined") {
    return {
      code: randomBatchCode(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(BATCH_KEY) ?? localStorage.getItem(LEGACY_BATCH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BatchSession;
      if (parsed?.code && new Date(parsed.expiresAt).getTime() > Date.now()) {
        // Migrate legacy key
        if (!localStorage.getItem(BATCH_KEY)) {
          try {
            localStorage.setItem(BATCH_KEY, raw);
          } catch {
            /* ignore */
          }
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const next: BatchSession = {
    code: randomBatchCode(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
  try {
    localStorage.setItem(BATCH_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function isBatchCode(raw: string): boolean {
  return /^(shr|cod)[a-z]\d{2}$/i.test(raw.trim());
}

export function normalizeBatchCode(raw: string): string {
  const shr = raw.trim().match(/^shr([a-zA-Z])(\d{2})$/i);
  if (shr) return `SHR${shr[1]!.toLowerCase()}${shr[2]}`;
  const cod = raw.trim().match(/^cod([a-zA-Z])(\d{2})$/i);
  if (cod) return `COD${cod[1]!.toLowerCase()}${cod[2]}`;
  return "";
}
