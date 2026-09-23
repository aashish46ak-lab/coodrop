import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

function remaining(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

export function useCountdown(expiresAt: string) {
  const [ms, setMs] = useState(() => remaining(expiresAt));

  useEffect(() => {
    setMs(remaining(expiresAt));
    const id = window.setInterval(() => setMs(remaining(expiresAt)), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return ms;
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function ExpirationTimer({
  expiresAt,
  className,
  onExpired,
}: {
  expiresAt: string;
  className?: string;
  onExpired?: () => void;
}) {
  const ms = useCountdown(expiresAt);

  useEffect(() => {
    if (ms <= 0) onExpired?.();
  }, [ms, onExpired]);

  const tone =
    ms <= 0
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : ms < 30 * 60 * 1000
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : ms < 2 * 60 * 60 * 1000
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
          : "border-border bg-secondary/70 text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        tone,
        className,
      )}
      aria-live="polite"
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {ms <= 0 ? "Expired" : `Expires in ${formatRemaining(ms)}`}
    </span>
  );
}
