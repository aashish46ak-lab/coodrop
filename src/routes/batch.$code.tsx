import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Lock, Video } from "lucide-react";

import { BrandHeader } from "@/components/codrop/Logo";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { Footer } from "@/components/codrop/Footer";
import { ExpirationTimer } from "@/components/codrop/ExpirationTimer";
import { Button } from "@/components/ui/button";
import { listBatch } from "@/lib/batch.functions";

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
      { title: `Batch ${params.code} - CODrop` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BatchPage,
});

const icons = { text: FileText, image: ImageIcon, video: Video } as const;

function BatchPage() {
  const data = Route.useLoaderData();
  const { code } = Route.useParams();

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
            Shared batch
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-wide text-foreground">
            {code}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            All drops shared under this main code
          </p>
        </div>

        {data.state === "not_found" || data.items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No active drops in this batch.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {data.items.map((item) => {
              const Icon = icons[item.type as keyof typeof icons] ?? FileText;
              return (
                <li key={item.code}>
                  <Link
                    to="/drop/$code"
                    params={{ code: item.code }}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                        {item.title}
                        {item.hasPassword ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Password protected" />
                        ) : null}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                    </span>
                    <ExpirationTimer expiresAt={item.expiresAt} className="shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Footer />
      </main>
    </div>
  );
}
