import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckSquare,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Square,
  Video,
} from "lucide-react";

import { BrandHeader } from "@/components/codrop/Logo";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { Footer } from "@/components/codrop/Footer";
import { ExpirationTimer } from "@/components/codrop/ExpirationTimer";
import { Button } from "@/components/ui/button";
import { listBatch } from "@/lib/batch.functions";
import { downloadDropsAsZip } from "@/lib/zip-download";

export const Route = createFileRoute("/batch/$code")({
  loader: async ({ params }) => {
    try {
      return await listBatch({ data: { code: params.code } });
    } catch {
      return { state: "not_found" as const, items: [] };
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `Folder ${params.code} - ShareTemp` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BatchPage,
});

const icons = { text: FileText, image: ImageIcon, video: Video } as const;

function BatchPage() {
  const data = Route.useLoaderData();
  const { code } = Route.useParams();
  const items = data.items ?? [];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dlBusy, setDlBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const downloadable = useMemo(
    () => items.filter((i) => !i.hasPassword),
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
      <main className="relative mx-auto w-full max-w-3xl px-5 pt-12 sm:pt-16">
        <Link to="/" className="block">
          <BrandHeader tagline={null} />
        </Link>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-[260px]">
            <p className="mb-1.5 text-right text-[11px] font-medium text-muted-foreground">
              Search another
            </p>
            <CodeSearchIsland compact />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Shared folder
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-wide text-foreground">
            {code}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap items to select. Download saves everything in one ZIP.
          </p>
        </div>

        {data.state === "not_found" || items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No active shares in this folder.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Folder codes look like SHRa23. File codes look like STa23.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 hidden items-center justify-between gap-2 sm:flex">
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground"
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
                  onClick={() =>
                    void downloadCodes([...selected], `${code}-selected`)
                  }
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
                    void downloadCodes(
                      downloadable.map((i) => i.code),
                      `${code}-folder`,
                    )
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

            <ul className="mt-4 space-y-2">
              {items.map((item) => {
                const Icon = icons[item.type as keyof typeof icons] ?? FileText;
                const locked = !!item.hasPassword;
                const isOn = selected.has(item.code);
                return (
                  <li key={item.code} className="flex items-stretch gap-2">
                    <button
                      type="button"
                      aria-label={isOn ? "Deselect" : "Select"}
                      disabled={locked}
                      onClick={() => toggle(item.code)}
                      className="flex w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-indigo-200 hover:text-foreground disabled:opacity-40"
                    >
                      {locked ? (
                        <Lock className="h-4 w-4" />
                      ) : isOn ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <Link
                      to="/drop/$code"
                      params={{ code: item.code }}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-secondary/50"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                          {item.title}
                          {locked ? (
                            <Lock
                              className="h-3.5 w-3.5 text-muted-foreground"
                              aria-label="Password protected"
                            />
                          ) : null}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.code}
                        </span>
                      </span>
                      <ExpirationTimer expiresAt={item.expiresAt} className="shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              One ZIP download. Locked items must be opened separately.
            </p>
          </>
        )}

        <Footer />
      </main>

      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2">
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
              disabled={dlBusy || (selected.size === 0 && downloadable.length === 0)}
              onClick={() =>
                void downloadCodes(
                  selected.size
                    ? [...selected]
                    : downloadable.map((i) => i.code),
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
    </div>
  );
}
