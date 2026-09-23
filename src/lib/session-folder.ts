/** Active share folder for this tab until refresh. */

const KEY = "codrop_active_folder";

export type SessionFolderItem = {
  code: string;
  title: string;
  type: "text" | "image" | "video";
  expiresAt: string;
};

export type SessionFolder = {
  batchCode: string;
  items: SessionFolderItem[];
  createdAt: string;
};

export function getSessionFolder(): SessionFolder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionFolder;
  } catch {
    return null;
  }
}

export function setSessionFolder(folder: SessionFolder) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(folder));
  } catch {
    // ignore
  }
}

export function addToSessionFolder(item: SessionFolderItem, batchCode: string) {
  const existing = getSessionFolder();
  if (existing && existing.batchCode === batchCode) {
    const items = [item, ...existing.items.filter((i) => i.code !== item.code)];
    setSessionFolder({ ...existing, items });
    return;
  }
  setSessionFolder({
    batchCode,
    items: [item],
    createdAt: new Date().toISOString(),
  });
}

export function clearSessionFolder() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
