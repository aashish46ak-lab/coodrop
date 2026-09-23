import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Brand mark: droplet with code brackets inside the O position */
export function DropMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={cn("h-9 w-7", className)}
      role="img"
      aria-label="CODrop"
    >
      <defs>
        <linearGradient id="codrop-drop" x1="20" y1="0" x2="20" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>
      <path
        d="M20 2C20 2 34 18 34 28c0 7.7-6.3 14-14 14S6 35.7 6 28C6 18 20 2 20 2z"
        fill="url(#codrop-drop)"
      />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="11"
        fontWeight="600"
        fill="#0B0D10"
      >
        {"</>"}
      </text>
    </svg>
  );
}

/** Full wordmark: C + droplet + DROP */
export function CodropWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  const mark = size === "lg" ? "h-10 w-8" : size === "sm" ? "h-7 w-5" : "h-9 w-7";

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className={cn("font-bold tracking-tight text-[#0B0D10]", text)}>C</span>
      <DropMark className={mark} />
      <span className={cn("font-bold tracking-tight text-[#0B0D10]", text)}>DROP</span>
    </span>
  );
}

export function BrandHeader({
  tagline = "Share. Drop. Done.",
  className,
}: {
  tagline?: string | null;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <Link to="/" className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        <CodropWordmark size="lg" />
      </Link>
      {tagline ? (
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
