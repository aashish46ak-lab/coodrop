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
      className="fixed inset-0 z-50 flex items-center justify-center p-[5%] sm:p-[8%]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Blur backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />

      {/* Centered panel ~10% margin */}
      <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0 rounded-xl bg-secondary/80 px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{drop.code}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {drop.type === "text" ? (
              <Button
                size="sm"
                onClick={() => void copyToClipboard(drop.content ?? "", "Text copied")}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
            ) : (
              <Button size="sm" disabled={busy || !drop.fileUrl} onClick={() => void downloadFile()}>
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
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="m-3 overflow-auto rounded-xl border border-border bg-[#0B0D10] sm:m-4">
          {drop.type === "text" ? (
            <pre className="max-h-[60vh] whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-white/90">
              {drop.content ?? ""}
            </pre>
          ) : drop.type === "image" && drop.fileUrl ? (
            <img
              src={drop.fileUrl}
              alt={title}
              className="mx-auto max-h-[60vh] w-auto max-w-full object-contain"
            />
          ) : drop.fileUrl ? (
            <video
              src={drop.fileUrl}
              controls
              playsInline
              className="mx-auto max-h-[60vh] w-full"
            />
          ) : (
            <p className="p-8 text-center text-sm text-white/60">Content unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
