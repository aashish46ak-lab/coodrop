import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Exact ShareTemp molecular mark — pure SVG, transparent, no background box */
export function DropMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={36}
      height={36}
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="st-mark-g" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="0.4" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* molecular network mark matching brand logo */}
      <circle cx="38" cy="22" r="10" fill="none" stroke="url(#st-mark-g)" strokeWidth="5.5" />
      <circle cx="38" cy="22" r="6" fill="url(#st-mark-g)" />
      <path
        d="M30 28 Q18 40 16 52"
        fill="none"
        stroke="url(#st-mark-g)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="54" r="7" fill="none" stroke="url(#st-mark-g)" strokeWidth="5" />
      <path
        d="M46 20 L58 20"
        fill="none"
        stroke="url(#st-mark-g)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M32 16 L24 8"
        fill="none"
        stroke="url(#st-mark-g)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
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
