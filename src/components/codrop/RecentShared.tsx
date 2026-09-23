import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Video,
} from "lucide-react";

import { getActiveRecentDrops, type RecentDrop } from "@/lib/recent-drops";
import { getDrop, type DropResult } from "@/lib/drops.functions";
import { SharedPreviewDialog } from "./SharedPreviewDialog";
import { getOrCreateBatch } from "@/lib/batch";
import { cn } from "@/lib/utils";

const typeIcon = {
  text: FileText,
  image: ImageIcon,
  video: Video,
} as const;

export function RecentShared({ className }: { className?: string }) {
  const [items, setItems] = useState<RecentDrop[]>([]);
  const [batchCode, setBatchCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [preview, setPreview] = useState<Extract<DropResult, { state: "ok" }> | null>(null);

  useEffect(() => {
    setItems(getActiveRecentDrops());
    try {
      setBatchCode(getOrCreateBatch().code);
    } catch {
      setBatchCode(null);
    }
    const id = window.setInterval(() => setItems(getActiveRecentDrops()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function openItem(item: RecentDrop) {
    setLoadingCode(item.code);
    try {
      const result = await getDrop({ data: { code: item.code } });
      if (result.state === "ok") setPreview(result);
      else setItems(getActiveRecentDrops());
    } catch {
      setItems(getActiveRecentDrops());
    } finally {
      setLoadingCode(null);
    }
  }

  if (items.length === 0 && !batchCode) return null;

  return (
    <section className={cn("w-full", className)} aria-labelledby="recent-shared">
      <h2 id="recent-shared" className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        Shared
      </h2>

      <ul className="divide-y divide-border/80 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Folder entry if batch exists */}
        {batchCode ? (
          <li>
            <Link
              to="/batch/$code"
              params={{ code: batchCode }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <FolderOpen className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">Share folder</span>
                <span className="font-mono text-xs text-muted-foreground">{batchCode}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ) : null}

        {items.map((item, index) => {
          const Icon = typeIcon[item.type];
          const label = item.title?.trim() || item.code;
          const busy = loadingCode === item.code;
          return (
            <li key={item.code}>
              <button
                type="button"
                onClick={() => void openItem(item)}
                disabled={busy}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 disabled:opacity-60"
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
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
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
