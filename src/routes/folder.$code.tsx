import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckSquare,
  ChevronRight,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Loader2,
  Square,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { BrandHeader } from "@/components/codrop/Logo";
import { ShareOptions, type ShareKind } from "@/components/codrop/ShareOptions";
import { SharedPreviewDialog } from "@/components/codrop/SharedPreviewDialog";
import { Footer } from "@/components/codrop/Footer";
import { useShareFlow } from "@/components/codrop/ShareFlow";
import { Button } from "@/components/ui/button";
import { copyToClipboard, triggerDownload } from "@/lib/clipboard";
import { getDrop, type DropResult } from "@/lib/drops.functions";
import { listBatch } from "@/lib/batch.functions";
import { getSessionFolder, type SessionFolderItem } from "@/lib/session-folder";

export const Route = createFileRoute("/folder/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Folder ${params.code} - ShareTemp` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FolderPage,
});

const icons = { text: FileText, image: ImageIcon, video: Video } as const;

function FolderPage() {
  const { code } = Route.useParams();
  const { openShare, flow } = useShareFlow({ stayOnFolder: true });
  const [items, setItems] = useState<SessionFolderItem[]>([]);
  const [preview, setPreview] = useState<Extract<DropResult, { state: "ok" }> | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dlBusy, setDlBusy] = useState(false);

  useEffect(() => {
    const session = getSessionFolder();
    if (session && session.batchCode.toLowerCase() === code.toLowerCase()) {
      setItems(session.items);
    }
    void listBatch({ data: { code } }).then((res) => {
      if (res.items?.length) {
        setItems(
          res.items.map((i) => ({
            code: i.code,
            title: i.title,
            type: i.type as "text" | "image" | "video",
            expiresAt: i.expiresAt,
          })),
        );
      }
    });
  }, [code]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const session = getSessionFolder();
      if (session && session.batchCode.toLowerCase() === code.toLowerCase()) {
        setItems(session.items);
      }
    }, 800);
    return () => window.clearInterval(id);
  }, [code]);

  useEffect(() => {
    setSelected((prev) => {
      const codes = new Set(items.map((i) => i.code));
      const next = new Set([...prev].filter((c) => codes.has(c)));
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const folderUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/batch/${code}`
      : `/batch/${code}`;

  const downloadable = useMemo(
    () => items.filter((i) => i.type === "image" || i.type === "video" || i.type === "text"),
    [items],
  );

  const allSelected =
    downloadable.length > 0 && downloadable.every((i) => selected.has(i.code));

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(downloadable.map((i) => i.code)));
  }

  async function openItem(item: SessionFolderItem) {
    setLoading(item.code);
    try {
      const result = await getDrop({ data: { code: item.code } });
      if (result.state === "ok") setPreview(result);
    } finally {
      setLoading(null);
    }
  }

  async function downloadCodes(codes: string[]) {
    if (!codes.length) {
      toast.error("Select at least one item.");
      return;
    }
    setDlBusy(true);
    let ok = 0;
    try {
      for (const c of codes) {
        const result = await getDrop({ data: { code: c } });
        if (result.state !== "ok") continue;
        if (result.type === "text") {
          const blob = new Blob([result.content ?? ""], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          triggerDownload(url, `${result.originalFilename ?? result.code}.txt`);
          window.setTimeout(() => URL.revokeObjectURL(url), 2000);
          ok++;
        } else if (result.fileUrl) {
          try {
            const response = await fetch(result.fileUrl);
            if (!response.ok) throw new Error("fail");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            triggerDownload(url, result.originalFilename ?? result.code);
            window.setTimeout(() => URL.revokeObjectURL(url), 2000);
            ok++;
            await new Promise((r) => setTimeout(r, 350));
          } catch {
            toast.error(`Could not download ${c}`);
          }
        }
      }
      if (ok) toast.success(`Downloaded ${ok} file${ok === 1 ? "" : "s"}`);
      else toast.error("Nothing could be downloaded.");
    } finally {
      setDlBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10rem] h-[28rem] bg-[radial-gradient(40rem_18rem_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      <main className="relative mx-auto w-full max-w-2xl px-5 pt-12 sm:pt-14">
        <BrandHeader tagline={null} />

        <div className="mt-10 text-center">
          <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <FolderOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Share folder
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-wide text-foreground">
            {code}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void copyToClipboard(code, "Code copied")}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void copyToClipboard(folderUrl, "Link copied")}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Copy link
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Share this folder code so others can open everything inside.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={dlBusy || selected.size === 0}
                onClick={() => void downloadCodes([...selected])}
              >
                {dlBusy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download selected
                {selected.size ? ` (${selected.size})` : ""}
              </Button>
              <Button
                size="sm"
                disabled={dlBusy || downloadable.length === 0}
                onClick={() => void downloadCodes(downloadable.map((i) => i.code))}
              >
                {dlBusy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download all
              </Button>
            </div>
          </div>
        ) : null}

        <ul className="mt-4 space-y-2">
          {items.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No files yet. Share something below.
            </li>
          ) : (
            items.map((item, index) => {
              const Icon = icons[item.type] ?? FileText;
              const isOn = selected.has(item.code);
              return (
                <li key={item.code} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    aria-label={isOn ? "Deselect" : "Select"}
                    onClick={() => toggle(item.code)}
                    className="flex w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-indigo-200 hover:text-foreground"
                  >
                    {isOn ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void openItem(item)}
                    disabled={loading === item.code}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition hover:border-indigo-200 hover:bg-secondary/40 disabled:opacity-60"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Add more to this folder
          </p>
          <ShareOptions compact onSelect={(kind: ShareKind) => openShare(kind)} />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Refresh the page to return home and start a new folder.
        </p>

        <Footer />
      </main>

      <SharedPreviewDialog
        drop={preview}
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />
      {flow}
    </div>
  );
}
