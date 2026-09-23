import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Clock3, Copy, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/codrop/Logo";
import { ExpirationTimer } from "@/components/codrop/ExpirationTimer";
import { SharedDropViewer } from "@/components/codrop/SharedDropViewer";
import { Footer } from "@/components/codrop/Footer";
import { copyToClipboard } from "@/lib/clipboard";
import { getDrop, type DropResult } from "@/lib/drops.functions";

export const Route = createFileRoute("/drop/$code")({
  loader: async ({ params }): Promise<DropResult> => {
    try {
      return await getDrop({ data: { code: params.code } });
    } catch {
      return { state: "not_found" };
    }
  },
  head: ({ params, loaderData }) => {
    const drop = loaderData as DropResult | undefined;
    const titleLabel =
      drop && drop.state === "ok" && drop.title
        ? drop.title
        : `Shared Drop ${params.code}`;
    const title = `${titleLabel} — CODrop`;
    const description =
      drop && drop.state === "ok" && drop.title
        ? `${drop.title} · Temporary CODrop share. Expires in 24 hours.`
        : "Open a CODrop share code to view, copy or download temporarily shared content.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DropPage,
  errorComponent: () => (
    <DropShell>
      <EmptyState kind="error" />
    </DropShell>
  ),
  notFoundComponent: () => (
    <DropShell>
      <EmptyState kind="not_found" />
    </DropShell>
  ),
  pendingComponent: () => (
    <DropShell>
      <p className="py-16 text-center text-sm text-muted-foreground">Loading shared content...</p>
    </DropShell>
  ),
});

function DropShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-12rem] h-[30rem] bg-[radial-gradient(42rem_20rem_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]"
      />
      <main className="relative mx-auto w-full max-w-4xl px-5 pt-12 sm:pt-16">
        <Link to="/" className="block">
          <BrandHeader tagline={null} />
        </Link>
        <div className="mt-10">{children}</div>
        <Footer />
      </main>
    </div>
  );
}

function EmptyState({ kind }: { kind: "not_found" | "expired" | "error" }) {
  const copy = {
    not_found: {
      icon: SearchX,
      title: "We couldn't find that drop.",
      text: "Double-check the code — it looks like COf26.",
    },
    expired: {
      icon: Clock3,
      title: "Drop expired",
      text: "This CODrop was available for 24 hours and is no longer accessible.",
    },
    error: {
      icon: SearchX,
      title: "Something went wrong.",
      text: "We couldn't load this drop right now. Please try again.",
    },
  }[kind];

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <copy.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.text}</p>
      <Button asChild className="mt-6">
        <Link to="/">Create a new drop</Link>
      </Button>
    </div>
  );
}

function DropPage() {
  const drop = Route.useLoaderData();
  const { code } = Route.useParams();
  const router = useRouter();

  if (drop.state === "not_found")
    return (
      <DropShell>
        <EmptyState kind="not_found" />
      </DropShell>
    );
  if (drop.state === "expired")
    return (
      <DropShell>
        <EmptyState kind="expired" />
      </DropShell>
    );

  return (
    <DropShell>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Shared Drop
        </p>
        {drop.title ? (
          <h1 className="max-w-xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {drop.title}
          </h1>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-[#0B0D10] px-4 py-2 font-mono text-lg font-semibold tracking-[0.1em] text-white">
            {code}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Copy share code"
            onClick={() => void copyToClipboard(code, "Code copied")}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <ExpirationTimer expiresAt={drop.expiresAt} onExpired={() => void router.invalidate()} />
      </div>

      <SharedDropViewer drop={drop} />
    </DropShell>
  );
}
