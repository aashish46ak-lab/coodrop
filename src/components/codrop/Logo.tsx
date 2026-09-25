import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { MARK_SRC } from "@/components/codrop/markData";

export function DropMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain object-center", className)}
      draggable={false}
      decoding="async"
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
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-lg"
        : "text-xl";
  const mark =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const px = size === "lg" ? 44 : size === "sm" ? 28 : 36;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DropMark className={mark} size={px} />
      <span className={cn("font-bold tracking-tight text-[#1e40af]", text)}>
        ShareTemp
      </span>
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
