import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** ShareTemp molecular network mark */
export function DropMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="ShareTemp"
    >
      <defs>
        <linearGradient id="st-mark" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.45" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      <line x1="24" y1="22" x2="12" y2="10" stroke="url(#st-mark)" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="22" x2="38" y2="14" stroke="url(#st-mark)" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="22" x2="16" y2="38" stroke="url(#st-mark)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="22" r="6" fill="url(#st-mark)" />
      <circle cx="24" cy="22" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="12" cy="10" r="4.2" fill="url(#st-mark)" />
      <circle cx="12" cy="10" r="1.8" fill="#fff" opacity="0.85" />
      <circle cx="38" cy="14" r="4.2" fill="url(#st-mark)" />
      <circle cx="38" cy="14" r="1.8" fill="#fff" opacity="0.85" />
      <circle cx="16" cy="38" r="4.2" fill="url(#st-mark)" />
      <circle cx="16" cy="38" r="1.8" fill="#fff" opacity="0.85" />
    </svg>
  );
}

/** Full wordmark: mark + ShareTemp */
export function CodropWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-2xl sm:text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <DropMark className={mark} />
      <span className={cn("font-bold tracking-tight text-[#1e40af]", text)}>ShareTemp</span>
    </span>
  );
}

/** Preferred alias */
export const ShareTempWordmark = CodropWordmark;

export function BrandHeader({
  tagline = "Share temporarily. Keep it simple.",
  className,
}: {
  tagline?: string | null;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <Link
        to="/"
        className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CodropWordmark size="lg" />
      </Link>
      {tagline ? (
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
