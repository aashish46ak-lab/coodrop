import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { toast } from "sonner";

import {
  buildSharedList,
  removeRecentBatch,
  removeRecentDrop,
  saveRecentDrop,
  type RecentDrop,
  type SharedListEntry,
} from "@/lib/recent-drops";
import { getDrop, type DropResult } from "@/lib/drops.functions";
import { deleteBatchOnServer, deleteDropOnServer } from "@/lib/create-drop";
import { getOwnerKey } from "@/lib/owner-key";
import { supabase } from "@/integrations/supabase/client";
import { SharedPreviewDialog } from "./SharedPreviewDialog";
import { ExpirationTimer } from "./ExpirationTimer";
import { HistorySync } from "./HistorySync";
import { cn } from "@/lib/utils";

const typeIcon = {
  text: FileText,
  image: ImageIcon,
  video: Video,
} as const;

export function RecentShared({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SharedListEntry[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [preview, setPreview] = useState<Extract<DropResult, { state: "ok" }> | null>(null);

  const refresh = useCallback(() => {
    setEntries(buildSharedList());
  }, []);

  const syncFromServer = useCallback(async () => {
    const ownerKey = getOwnerKey();
    if (!ownerKey) return;
    try {
      const { data, error } = await supabase.rpc("list_owner_drops", {
        p_owner_key: ownerKey,
      });
      if (error || !data) return;
      for (const row of data as Array<{
        code: string;
        type: string;
        title: string;
        expires_at: string;
        created_at: string;
        batch_code: string | null;
      }>) {
        saveRecentDrop({
          code: row.code,
          title: row.title,
          type: row.type as "text" | "image" | "video",
          expiresAt: row.expires_at,
          batchCode: row.batch_code,
        });
      }
      setEntries(buildSharedList());
    } catch {
      // offline / RPC missing
    }
  }, []);

  useEffect(() => {
    refresh();
    void syncFromServer();
    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, [refresh, syncFromServer]);

  async function openItem(item: RecentDrop) {
    setLoadingCode(item.code);
    try {
      const result = await getDrop({ data: { code: item.code } });
      if (result.state === "ok") {
        setPreview(result);
        return;
      }
      if (result.state === "expired") {
        toast.error("This share has expired");
        removeRecentDrop(item.code);
        refresh();
        return;
      }
      if (result.state === "locked") {
        void navigate({ to: "/drop/$code", params: { code: item.code } });
        return;
      }
      // not_found — still try full page (fresh loader)
      void navigate({ to: "/drop/$code", params: { code: item.code } });
    } catch {
      void navigate({ to: "/drop/$code", params: { code: item.code } });
    } finally {
      setLoadingCode(null);
    }
  }

  function openFolder(batchCode: string) {
    void navigate({ to: "/batch/$code", params: { code: batchCode } });
  }

  async function deleteFile(code: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(code);
    const ok = await deleteDropOnServer(code);
    removeRecentDrop(code);
    refresh();
    setDeleting(null);
    toast.success(ok ? "Drop deleted" : "Removed from list");
  }

  async function deleteFolder(batchCode: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(batchCode);
    const n = await deleteBatchOnServer(batchCode);
    removeRecentBatch(batchCode);
    refresh();
    setDeleting(null);
    toast.success(n > 0 ? `Deleted ${n} drops` : "Folder removed from list");
  }

  if (entries.length === 0) {
    return (
      <section className={cn("w-full", className)}>
        <HistorySync onImported={() => void syncFromServer()} />
      </section>
    );
  }

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
                    className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50"
                    onClick={() => openFolder(entry.batchCode)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    aria-label="Delete folder"
                    disabled={deleting === entry.batchCode}
                    onClick={(e) => void deleteFolder(entry.batchCode, e)}
                  >
                    {deleting === entry.batchCode ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {open ? (
                  <ul className="border-t border-border/60 bg-secondary/20">
                    {entry.items.map((item) => {
                      const Icon = typeIcon[item.type];
                      const busy = loadingCode === item.code;
                      return (
                        <li key={item.code}>
                          <div className="flex items-center gap-2 py-2 pl-10 pr-3">
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
                              aria-label="Delete file"
                              disabled={deleting === item.code}
                              onClick={(e) => void deleteFile(item.code, e)}
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
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
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
                  aria-label="Delete"
                  disabled={deleting === item.code}
                  onClick={(e) => void deleteFile(item.code, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <HistorySync onImported={() => void syncFromServer()} />

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
