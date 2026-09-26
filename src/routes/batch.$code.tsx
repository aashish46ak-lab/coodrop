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
import { toast } from "sonner";

import { BrandHeader } from "@/components/codrop/Logo";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { Footer } from "@/components/codrop/Footer";
import { ExpirationTimer } from "@/components/codrop/ExpirationTimer";
import { Button } from "@/components/ui/button";
import { listBatch } from "@/lib/batch.functions";
import { getDrop } from "@/lib/drops.functions";
import { triggerDownload } from "@/lib/clipboard";

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

  async function downloadCodes(codes: string[]) {
    if (!codes.length) {
      toast.error("Select at least one item.");
      return;
    }
    setDlBusy(true);
    let ok = 0;
    let locked = 0;
    try {
      for (const c of codes) {
        const result = await getDrop({ data: { code: c } });
        if (result.state === "locked") {
          locked++;
          continue;
        }
        if (result.state !== "ok") continue;
        if (result.type === "text") {
          const blob = new Blob([result.content ?? ""], {
            type: "text/plain;charset=utf-8",
          });
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
      else if (locked) toast.error("Password-protected items need to be opened one by one.");
      else toast.error("Nothing could be downloaded.");
    } finally {
      setDlBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
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
            All items shared under this folder code
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
                      className="flex w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-indigo-200 hover:text-foreground disabled:opacity-40"
                    >
                      {locked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : isOn ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <Square className="h-4 w-4" />
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
              Password-protected items open one by one (not in bulk download).
            </p>
          </>
        )}

        <Footer />
      </main>
    </div>
  );
}
