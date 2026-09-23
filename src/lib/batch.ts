/** Main batch code format: COD + letter + 2 digits (e.g. CODr21) */

const BATCH_KEY = "codrop_batch_v1";

export type BatchSession = {
  code: string;
  createdAt: string;
  expiresAt: string;
};

function randomBatchCode(): string {
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const num = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `COD${letter}${num}`;
}

/** Get or create a 24h batch session for this browser (multi-share main code). */
export function getOrCreateBatch(): BatchSession {
  if (typeof window === "undefined") {
    return {
      code: randomBatchCode(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(BATCH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BatchSession;
      if (parsed?.code && new Date(parsed.expiresAt).getTime() > Date.now()) {
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
  return /^cod[a-z]\d{2}$/i.test(raw.trim());
}

export function normalizeBatchCode(raw: string): string {
  const m = raw.trim().match(/^cod([a-zA-Z])(\d{2})$/i);
  if (!m) return "";
  return `COD${m[1]!.toLowerCase()}${m[2]}`;
}
