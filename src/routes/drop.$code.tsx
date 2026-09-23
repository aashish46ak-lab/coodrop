import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Clock3, Copy, Lock, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandHeader } from "@/components/codrop/Logo";
import { ExpirationTimer } from "@/components/codrop/ExpirationTimer";
import { SharedDropViewer } from "@/components/codrop/SharedDropViewer";
import { ShareOptions, type ShareKind } from "@/components/codrop/ShareOptions";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { ShareQrBlock } from "@/components/codrop/QrCode";
import { Footer } from "@/components/codrop/Footer";
import { useShareFlow } from "@/components/codrop/ShareFlow";
import { copyToClipboard } from "@/lib/clipboard";
import { getDrop, type DropResult } from "@/lib/drops.functions";

export const Route = createFileRoute("/drop/$code")({
  loader: async ({ params }): Promise<DropResult> => {
    try {
      return await getDrop({ data: { code: params.code } });
    } catch (e) {
      console.error("[CODrop] loader error:", e);
      return { state: "not_found" };
    }
  },
  head: ({ params, loaderData }) => {
    const drop = loaderData as DropResult | undefined;
    let titleLabel = `Shared Drop ${params.code}`;
    if (drop && (drop.state === "ok" || drop.state === "locked") && drop.title) {
      titleLabel = drop.title;
    }
    const title = `${titleLabel} - CODrop`;
    const description = "Open a CODrop share to view, copy or download shared content.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "/og.svg" },
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
      title: "We could not find that drop.",
      text: "Double-check the code. Codes look like COf26.",
    },
    expired: {
      icon: Clock3,
      title: "Drop expired",
      text: "This CODrop is no longer accessible.",
    },
    error: {
      icon: SearchX,
      title: "Something went wrong.",
      text: "We could not load this drop right now. Please try again.",
    },
  }[kind];

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <copy.icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.text}</p>
      <div className="mx-auto mt-6 max-w-xs">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Search another</p>
        <CodeSearchIsland compact className="mx-auto max-w-full" />
      </div>
      <Button asChild variant="ghost" className="mt-4">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}

function LockedPanel({
  code,
  title,
  expiresAt,
}: {
  code: string;
  title: string | null;
  expiresAt: string;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Extract<DropResult, { state: "ok" }> | null>(null);
  const router = useRouter();

  async function unlock() {
    setBusy(true);
    setError(null);
    try {
      const result = await getDrop({ data: { code, password } });
      if (result.state === "ok") {
        setUnlocked(result);
      } else if (result.state === "locked") {
        setError("Wrong password. Try again.");
      } else {
        void router.invalidate();
      }
    } catch {
      setError("Could not unlock. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) {
    return <OkDropBody drop={unlocked} code={code} />;
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Lock className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        {title || "Password protected"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the password to view this drop.</p>
      <ExpirationTimer expiresAt={expiresAt} className="mt-3" />
      <form
        className="mt-6 space-y-3 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          void unlock();
        }}
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy || !password}>
          {busy ? "Unlocking..." : "Unlock"}
        </Button>
      </form>
    </div>
  );
}

function OkDropBody({
  drop,
  code,
}: {
  drop: Extract<DropResult, { state: "ok" }>;
  code: string;
}) {
  const router = useRouter();
  const { openShare, flow } = useShareFlow();

  return (
    <>
      <div className="mb-8 flex justify-end">
        <div className="w-full max-w-[260px]">
          <p className="mb-1.5 text-right text-[11px] font-medium text-muted-foreground">
            Search another
          </p>
          <CodeSearchIsland compact />
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Shared drop
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

      <div className="mb-8 flex justify-center">
        <ShareQrBlock code={code} />
      </div>

      <SharedDropViewer drop={drop} />

      <div className="mt-14 border-t border-border pt-10">
        <p className="mb-5 text-center text-sm font-medium text-muted-foreground">Share another</p>
        <ShareOptions compact onSelect={(kind: ShareKind) => openShare(kind)} />
      </div>

      {flow}
    </>
  );
}

function DropPage() {
  const drop = Route.useLoaderData();
  const { code } = Route.useParams();

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
  if (drop.state === "locked")
    return (
      <DropShell>
        <LockedPanel code={drop.code} title={drop.title} expiresAt={drop.expiresAt} />
      </DropShell>
    );

  return (
    <DropShell>
      <OkDropBody drop={drop} code={code} />
    </DropShell>
  );
}
