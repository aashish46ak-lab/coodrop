export type RecentDrop = {
  code: string;
  title: string | null;
  type: "text" | "image" | "video";
  expiresAt: string;
  createdAt: string;
};

const KEY = "codrop_recent_drops";
const MAX = 12;

function read(): RecentDrop[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentDrop[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function write(items: RecentDrop[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    // ignore quota
  }
}

export function getActiveRecentDrops(): RecentDrop[] {
  const now = Date.now();
  return read()
    .filter((d) => new Date(d.expiresAt).getTime() > now)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveRecentDrop(drop: {
  code: string;
  title?: string | null;
  type: "text" | "image" | "video";
  expiresAt: string;
}) {
  const next: RecentDrop = {
    code: drop.code,
    title: drop.title?.trim() || null,
    type: drop.type,
    expiresAt: drop.expiresAt,
    createdAt: new Date().toISOString(),
  };
  const others = read().filter((d) => d.code !== next.code);
  write([next, ...others]);
}

export function removeRecentDrop(code: string) {
  write(read().filter((d) => d.code !== code));
}
