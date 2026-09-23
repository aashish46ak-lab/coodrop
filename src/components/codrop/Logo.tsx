import { cn } from "@/lib/utils";

export function DropMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="CODrop logo"
    >
      <defs>
        <linearGradient id="codrop-mark" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c9.2 11 15.3 19.2 15.3 26.7C47.3 42.3 40.4 49.5 32 49.5s-15.3-7.2-15.3-16.8C16.7 25.2 22.8 17 32 6z"
        fill="url(#codrop-mark)"
      />
      <path
        d="M27.9 26.6 22.9 32l5 5.4M36.1 26.6 41.1 32l-5 5.4M34 24.8l-3.4 14"
        stroke="#0B0D10"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
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
      <div className="flex items-center gap-2.5">
        <DropMark />
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          CO<span className="text-muted-foreground/90">Drop</span>
        </span>
      </div>
      {tagline ? (
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}
