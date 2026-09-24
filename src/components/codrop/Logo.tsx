import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** ShareTemp molecular network mark — exact brand PNG */
export function DropMark({ className }: { className?: string }) {
  return (
    <img
      src="/mark.png"
      alt="ShareTemp"
      width={36}
      height={36}
      className={cn("h-9 w-9 object-contain", className)}
      draggable={false}
    />
  );
}

/** Full wordmark: exact ShareTemp logo (transparent) */
export function CodropWordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const h =
    size === "lg" ? "h-12 sm:h-14" : size === "sm" ? "h-8" : "h-10";

  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/logo-transparent.png"
        alt="ShareTemp"
        className={cn(h, "w-auto object-contain")}
        draggable={false}
      />
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
