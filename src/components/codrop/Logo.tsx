import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Exact ShareTemp molecular logo from your brand PNG (transparent) */
const MARK_SRC =
  "data:image/png;base64," +
  "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" +
  "";

export function DropMark({ className }: { className?: string }) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={40}
      height={40}
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
      draggable={false}
    />
  );
}

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
