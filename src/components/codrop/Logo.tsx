import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * ShareTemp molecular mark — transparent SVG (no black box).
 * Geometry matches the brand logo: upper node + ring, right arm,
 * curved stem, lower node.
 */
export function DropMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={36}
      height={36}
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="st-mark-g" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.45" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      {/* upper ring */}
      <circle cx="58" cy="32" r="18" stroke="url(#st-mark-g)" strokeWidth="9" />
      {/* upper solid core */}
      <circle cx="58" cy="32" r="10" fill="url(#st-mark-g)" />
      {/* right arm */}
      <path d="M76 32 H96" stroke="url(#st-mark-g)" strokeWidth="9" strokeLinecap="round" />
      {/* upper-left arc tick */}
      <path d="M48 18 L40 10" stroke="url(#st-mark-g)" strokeWidth="7" strokeLinecap="round" />
      {/* curved stem down-left */}
      <path
        d="M46 44 C34 56 28 68 24 82"
        stroke="url(#st-mark-g)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* lower ring */}
      <circle cx="22" cy="86" r="12" stroke="url(#st-mark-g)" strokeWidth="8" />
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DropMark className={mark} />
      <span className={cn("font-bold tracking-tight text-[#1e40af]", text)}>ShareTemp</span>
    </span>
  );
}

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
