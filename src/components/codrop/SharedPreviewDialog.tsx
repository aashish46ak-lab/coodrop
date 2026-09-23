import { Copy, Download, Loader2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copyToClipboard, downloadTextFile, triggerDownload } from "@/lib/clipboard";
import type { DropResult } from "@/lib/drops.functions";
import { ExpirationTimer } from "./ExpirationTimer";

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

  if (!drop) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-4">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#0B0D10] px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-white">
              {drop.code}
            </span>
            <ExpirationTimer expiresAt={drop.expiresAt} />
          </div>
        </DialogHeader>

        {/* Actions under title */}
        <div className="flex flex-wrap gap-2">
          {drop.type === "text" ? (
            <>
              <Button
                size="sm"
                onClick={() => void copyToClipboard(drop.content ?? "", "Text copied")}
              >
                <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Copy all
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadTextFile(drop.content ?? "", `${drop.code}.txt`)}
              >
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Download .txt
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" disabled={busy || !drop.fileUrl} onClick={() => void downloadFile()}>
                {busy ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                )}
                Download
              </Button>
              {drop.fileUrl ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={drop.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Maximize2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Open full
                  </a>
                </Button>
              ) : null}
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void copyToClipboard(drop.code, "Code copied")}
          >
            <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Copy code
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-auto rounded-xl border border-border bg-[#0B0D10]">
          {drop.type === "text" ? (
            <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-white/90">
              {drop.content ?? ""}
            </pre>
          ) : drop.type === "image" && drop.fileUrl ? (
            <img
              src={drop.fileUrl}
              alt={title}
              className="mx-auto max-h-[50vh] w-auto max-w-full object-contain"
            />
          ) : drop.fileUrl ? (
            <video
              src={drop.fileUrl}
              controls
              playsInline
              className="mx-auto max-h-[50vh] w-full"
            />
          ) : (
            <p className="p-6 text-center text-sm text-white/60">Content unavailable.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
