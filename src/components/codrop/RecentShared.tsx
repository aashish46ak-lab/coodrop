import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Video } from "lucide-react";

import { getActiveRecentDrops, type RecentDrop } from "@/lib/recent-drops";
import { ExpirationTimer } from "./ExpirationTimer";
import { cn } from "@/lib/utils";

const typeIcon = {
  text: FileText,
  image: ImageIcon,
  video: Video,
} as const;

export function RecentShared({ className }: { className?: string }) {
  const [items, setItems] = useState<RecentDrop[]>([]);

  useEffect(() => {
    setItems(getActiveRecentDrops());
    const id = window.setInterval(() => setItems(getActiveRecentDrops()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={cn("w-full", className)} aria-labelledby="recent-shared">
      <h2
        id="recent-shared"
        className="mb-3 text-sm font-semibold tracking-tight text-foreground"
      >
        Shared
      </h2>
      <ul className="divide-y divide-border/80 overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((item) => {
          const Icon = typeIcon[item.type];
          return (
            <li key={item.code}>
              <Link
                to="/drop/$code"
                params={{ code: item.code }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.title || item.code}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                </span>
                <ExpirationTimer expiresAt={item.expiresAt} className="shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
