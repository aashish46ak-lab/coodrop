import { Copy, Download, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyToClipboard, downloadTextFile, triggerDownload } from "@/lib/clipboard";
import type { DropResult } from "@/lib/drops.functions";

type OkDrop = Extract<DropResult, { state: "ok" }>;

export function SharedPreviewDialog({
  drop,
  open,
  onOpenChange,
}: {
  drop: OkDrop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  if (!open || !drop) return null;

  const title = drop.title?.trim() || drop.code;

  async function downloadFile() {
    if (!drop?.fileUrl) return;
    setBusy(true);
    try {
      const response = await fetch(drop.fileUrl);
      if (!response.ok) throw new Error("fail");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      triggerDownload(url, drop.originalFilename ?? drop.code);
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      toast.error("Could not download that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-[6%]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-3 sm:gap-3 sm:px-5">
          <div className="min-w-0 flex-1 rounded-xl bg-secondary/80 px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{drop.code}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {drop.type === "text" ? (
              <Button
                size="sm"
                className="min-h-10 px-3"
                onClick={() => void copyToClipboard(drop.content ?? "", "Text copied")}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            ) : (
              <Button
                size="sm"
                className="min-h-10 px-3"
                disabled={busy || !drop.fileUrl}
                onClick={() => void downloadFile()}
              >
                {busy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="m-2 overflow-auto rounded-xl border border-border bg-[#0B0D10] sm:m-4">
          {drop.type === "text" ? (
            <pre className="max-h-[55vh] whitespace-pre-wrap break-words p-3 font-mono text-sm leading-relaxed text-white/90 sm:max-h-[60vh] sm:p-4">
              {drop.content ?? ""}
            </pre>
          ) : drop.type === "image" && drop.fileUrl ? (
            <img
              src={drop.fileUrl}
              alt={title}
              className="mx-auto max-h-[55vh] w-auto max-w-full object-contain sm:max-h-[60vh]"
            />
          ) : drop.fileUrl ? (
            <video
              src={drop.fileUrl}
              controls
              playsInline
              className="mx-auto max-h-[55vh] w-full sm:max-h-[60vh]"
            />
          ) : (
            <p className="p-8 text-center text-sm text-white/60">Content unavailable.</p>
          )}
        </div>

        <div className="h-[env(safe-area-inset-bottom)] sm:hidden" />
      </div>
    </div>
  );
}
