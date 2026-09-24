export type RecentDrop = {
  code: string;
  title: string | null;
  type: "text" | "image" | "video";
  expiresAt: string;
  createdAt: string;
  batchCode?: string | null;
};

const KEY = "sharetemp_recent_drops";
const LEGACY_KEY = "codrop_recent_drops";
const MAX = 40;

function read(): RecentDrop[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
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
    // ignore
  }
}

export function getActiveRecentDrops(): RecentDrop[] {
  const now = Date.now();
  const active = read().filter((d) => new Date(d.expiresAt).getTime() > now);
  if (active.length !== read().length) write(active);
  return active.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveRecentDrop(drop: {
  code: string;
  title?: string | null;
  type: "text" | "image" | "video";
  expiresAt: string;
  batchCode?: string | null;
}) {
  const next: RecentDrop = {
    code: drop.code,
    title: drop.title?.trim() || null,
    type: drop.type,
    expiresAt: drop.expiresAt,
    createdAt: new Date().toISOString(),
    batchCode: drop.batchCode ?? null,
  };
  const others = read().filter((d) => d.code !== next.code);
  write([next, ...others]);
}

export function removeRecentDrop(code: string) {
  write(read().filter((d) => d.code !== code));
}

export function removeRecentBatch(batchCode: string) {
  write(read().filter((d) => d.batchCode !== batchCode));
}

export type SharedListEntry =
  | {
      kind: "folder";
      batchCode: string;
      items: RecentDrop[];
      createdAt: string;
      expiresAt: string;
    }
  | {
      kind: "file";
      item: RecentDrop;
    };

/** Group recent drops: 2+ same batch = folder, else single file. */
export function buildSharedList(): SharedListEntry[] {
  const drops = getActiveRecentDrops();
  const byBatch = new Map<string, RecentDrop[]>();
  const singles: RecentDrop[] = [];

  for (const d of drops) {
    if (d.batchCode) {
      const list = byBatch.get(d.batchCode) ?? [];
      list.push(d);
      byBatch.set(d.batchCode, list);
    } else {
      singles.push(d);
    }
  }

  const entries: SharedListEntry[] = [];

  for (const [batchCode, items] of byBatch) {
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (items.length >= 2) {
      entries.push({
        kind: "folder",
        batchCode,
        items,
        createdAt: items.reduce(
          (max, i) => (i.createdAt > max ? i.createdAt : max),
          items[0]!.createdAt,
        ),
        expiresAt: items.reduce(
          (max, i) => (i.expiresAt > max ? i.expiresAt : max),
          items[0]!.expiresAt,
        ),
      });
    } else if (items[0]) {
      entries.push({ kind: "file", item: items[0] });
    }
  }

  for (const s of singles) {
    entries.push({ kind: "file", item: s });
  }

  entries.sort((a, b) => {
    const ta = a.kind === "folder" ? a.createdAt : a.item.createdAt;
    const tb = b.kind === "folder" ? b.createdAt : b.item.createdAt;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  return entries;
}
