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

import { BrandHeader } from "@/components/codrop/Logo";
import { ShareOptions, type ShareKind } from "@/components/codrop/ShareOptions";
import { SharedPreviewDialog } from "@/components/codrop/SharedPreviewDialog";
import { Footer } from "@/components/codrop/Footer";
import { useShareFlow } from "@/components/codrop/ShareFlow";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { getDrop, type DropResult } from "@/lib/drops.functions";
import { listBatch } from "@/lib/batch.functions";
import { getSessionFolder, type SessionFolderItem } from "@/lib/session-folder";
import { downloadDropsAsZip } from "@/lib/zip-download";

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
  const [progress, setProgress] = useState("");

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

  function toggle(itemCode: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemCode)) next.delete(itemCode);
      else next.add(itemCode);
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

  async function downloadCodes(codes: string[], zipName: string) {
    if (!codes.length) return;
    setDlBusy(true);
    setProgress("Preparing files...");
    try {
      await downloadDropsAsZip(codes, zipName, (done, total) => {
        setProgress(done >= total ? "Packing ZIP..." : `Adding ${done + 1} of ${total}`);
      });
    } finally {
      setDlBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-28 sm:pb-10">
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
          <div className="mt-8 hidden items-center justify-between gap-2 sm:flex">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4 text-indigo-600" />
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
                onClick={() => void downloadCodes([...selected], `${code}-selected`)}
              >
                {dlBusy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Selected{selected.size ? ` (${selected.size})` : ""}
              </Button>
              <Button
                size="sm"
                disabled={dlBusy || downloadable.length === 0}
                onClick={() =>
                  void downloadCodes(downloadable.map((i) => i.code), `${code}-folder`)
                }
              >
                {dlBusy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download all as ZIP
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
                    className="flex w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-indigo-200 hover:text-foreground"
                  >
                    {isOn ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Square className="h-5 w-5" />
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

      {items.length > 0 ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4 text-indigo-600" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              All
            </button>
            <Button
              className="h-11 flex-1"
              disabled={dlBusy || downloadable.length === 0}
              onClick={() =>
                void downloadCodes(
                  selected.size ? [...selected] : downloadable.map((i) => i.code),
                  selected.size ? `${code}-selected` : `${code}-folder`,
                )
              }
            >
              {dlBusy ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              {dlBusy
                ? progress || "Downloading"
                : selected.size
                  ? `Download ${selected.size} as ZIP`
                  : "Download all as ZIP"}
            </Button>
          </div>
        </div>
      ) : null}

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
