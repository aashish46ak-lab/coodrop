import { useMemo, useState } from "react";
import { Copy, Download, Link2, Loader2, Maximize2, TextSelect } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyToClipboard, downloadTextFile, triggerDownload } from "@/lib/clipboard";
import { formatBytes } from "@/lib/codrop-config";
import type { DropResult } from "@/lib/drops.functions";

type OkDrop = Extract<DropResult, { state: "ok" }>;

function shareUrl(code: string) {
  if (typeof window === "undefined") return `/drop/${code}`;
  return `${window.location.origin}/drop/${code}`;
}

function TextViewer({ drop }: { drop: OkDrop }) {
  const content = drop.content ?? "";
  const lines = useMemo(() => content.split("\n"), [content]);

  function selectAll() {
    const node = document.getElementById("drop-text-content");
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void copyToClipboard(content, "Text copied")}>
          <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadTextFile(content, `${drop.code}.txt`)}
        >
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Download .txt
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void copyToClipboard(shareUrl(drop.code), "Link copied")}
        >
          <Link2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Copy link
        </Button>
        <Button size="sm" variant="ghost" onClick={selectAll}>
          <TextSelect className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Select all
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-[#0B0D10]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-white/50">
          <span className="font-mono">{drop.code}.txt</span>
          <span>{lines.length.toLocaleString()} lines</span>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <div className="flex min-w-full">
            <div
              aria-hidden="true"
              className="select-none border-r border-white/5 bg-white/[0.02] px-3 py-4 text-right font-mono text-xs leading-6 text-white/25"
            >
              {lines.map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
            <pre
              id="drop-text-content"
              className="flex-1 overflow-x-auto px-4 py-4 font-mono text-sm leading-6 text-white/90"
            >
              {content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function useFileDownload(drop: OkDrop) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!drop.fileUrl) return;
    setBusy(true);
    try {
      const response = await fetch(drop.fileUrl);
      if (!response.ok) throw new Error("download_failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      triggerDownload(url, drop.originalFilename ?? drop.code);
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      toast.error("Could not download that file. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, download };
}

function FileActions({ drop }: { drop: OkDrop }) {
  const { busy, download } = useFileDownload(drop);
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={busy} onClick={() => void download()}>
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
            Open fullscreen
          </a>
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        onClick={() => void copyToClipboard(shareUrl(drop.code), "Link copied")}
      >
        <Link2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Copy link
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => void copyToClipboard(drop.code, "Code copied")}
      >
        <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Copy code
      </Button>
    </div>
  );
}

function FileMeta({ drop }: { drop: OkDrop }) {
  return (
    <p className="text-xs text-muted-foreground">
      {drop.originalFilename ?? "Shared file"}
      {drop.fileSize ? ` · ${formatBytes(drop.fileSize)}` : ""}
    </p>
  );
}

export function SharedDropViewer({ drop }: { drop: OkDrop }) {
  if (drop.type === "text") return <TextViewer drop={drop} />;

  return (
    <div className="space-y-4">
      <FileActions drop={drop} />
      <div className="overflow-hidden rounded-2xl border border-border bg-[#0B0D10]">
        {drop.type === "image" && drop.fileUrl ? (
          <img
            src={drop.fileUrl}
            alt={drop.originalFilename ?? "Shared image"}
            className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
          />
        ) : drop.fileUrl ? (
          <video
            src={drop.fileUrl}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[70vh] w-full"
          />
        ) : (
          <p className="p-8 text-center text-sm text-white/70">This file is unavailable.</p>
        )}
      </div>
      <FileMeta drop={drop} />
    </div>
  );
}
