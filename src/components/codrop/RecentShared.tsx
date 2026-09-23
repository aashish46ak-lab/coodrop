import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Video,
} from "lucide-react";

import {
  buildSharedList,
  removeRecentBatch,
  removeRecentDrop,
  type RecentDrop,
  type SharedListEntry,
} from "@/lib/recent-drops";
import { getDrop, type DropResult } from "@/lib/drops.functions";
import { SharedPreviewDialog } from "./SharedPreviewDialog";
import { ExpirationTimer } from "./ExpirationTimer";
import { cn } from "@/lib/utils";

const typeIcon = {
  text: FileText,
  image: ImageIcon,
  video: Video,
} as const;

export function RecentShared({ className }: { className?: string }) {
  const [entries, setEntries] = useState<SharedListEntry[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [preview, setPreview] = useState<Extract<DropResult, { state: "ok" }> | null>(null);

  function refresh() {
    setEntries(buildSharedList());
  }

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function openItem(item: RecentDrop) {
    setLoadingCode(item.code);
    try {
      const result = await getDrop({ data: { code: item.code } });
      if (result.state === "ok") setPreview(result);
      else refresh();
    } catch {
      refresh();
    } finally {
      setLoadingCode(null);
    }
  }

  function deleteFile(code: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeRecentDrop(code);
    refresh();
  }

  function deleteFolder(batchCode: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeRecentBatch(batchCode);
    refresh();
  }

  if (entries.length === 0) return null;

  return (
    <section className={cn("w-full", className)} aria-labelledby="recent-shared">
      <h2 id="recent-shared" className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        Shared
      </h2>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {entries.map((entry, index) => {
          if (entry.kind === "folder") {
            const open = !!openFolders[entry.batchCode];
            return (
              <li key={`folder-${entry.batchCode}`} className="border-b border-border/80 last:border-0">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() =>
                      setOpenFolders((s) => ({
                        ...s,
                        [entry.batchCode]: !s[entry.batchCode],
                      }))
                    }
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                      <FolderOpen className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">Folder</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.batchCode} · {entry.items.length} files
                      </span>
                    </span>
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove folder from list"
                    onClick={(e) => deleteFolder(entry.batchCode, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {open ? (
                  <ul className="border-t border-border/60 bg-secondary/20">
                    {entry.items.map((item) => {
                      const Icon = typeIcon[item.type];
                      const busy = loadingCode === item.code;
                      return (
                        <li key={item.code}>
                          <div className="flex items-center gap-2 pl-10 pr-3 py-2">
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              disabled={busy}
                              onClick={() => void openItem(item)}
                            >
                              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card text-muted-foreground">
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Icon className="h-3.5 w-3.5" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                {item.title || item.code}
                              </span>
                              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                                {item.code}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Remove file"
                              onClick={(e) => deleteFile(item.code, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          }

          // Single file
          const item = entry.item;
          const Icon = typeIcon[item.type];
          const busy = loadingCode === item.code;
          return (
            <li key={`file-${item.code}`} className="border-b border-border/80 last:border-0">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  disabled={busy}
                  onClick={() => void openItem(item)}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.title || item.code}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                  </span>
                  <ExpirationTimer expiresAt={item.expiresAt} className="shrink-0 scale-90" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove from list"
                  onClick={(e) => deleteFile(item.code, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <SharedPreviewDialog
        drop={preview}
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />
    </section>
  );
}
