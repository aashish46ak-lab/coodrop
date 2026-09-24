/** Cross-device history key stored locally; can be imported on another device. */

const KEY = "sharetemp_owner_key";
const LEGACY_KEY = "codrop_owner_key";

function randomKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `ok${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getOwnerKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let k = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!k || k.length < 16) {
      k = randomKey();
      localStorage.setItem(KEY, k);
    } else if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, k);
    }
    return k;
  } catch {
    return randomKey();
  }
}

export function setOwnerKey(key: string): boolean {
  const cleaned = key.trim().replace(/\s+/g, "");
  if (cleaned.length < 16 || cleaned.length > 64) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) return false;
  try {
    localStorage.setItem(KEY, cleaned);
    return true;
  } catch {
    return false;
  }
}
