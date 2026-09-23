import { FileCode2, ImageIcon, PlayCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShareKind = "text" | "image" | "video";

const OPTIONS: Array<{
  kind: ShareKind;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}> = [
  {
    kind: "text",
    title: "Share Text",
    description: "Share notes, code, links or long text.",
    icon: FileCode2,
    iconClass: "bg-indigo-500/10 text-indigo-600",
  },
  {
    kind: "image",
    title: "Share Image",
    description: "Upload and temporarily share an image.",
    icon: ImageIcon,
    iconClass: "bg-cyan-500/10 text-cyan-600",
  },
  {
    kind: "video",
    title: "Share Video",
    description: "Upload and temporarily share a video.",
    icon: PlayCircle,
    iconClass: "bg-violet-500/10 text-violet-600",
  },
];

export function ShareOptionCard({
  title,
  description,
  icon: Icon,
  iconClass,
  compact,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col items-start gap-3 rounded-2xl border border-border/80 bg-card text-left shadow-[0_1px_2px_rgba(11,13,16,0.04),0_12px_32px_-24px_rgba(11,13,16,0.25)]",
        "transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_2px_4px_rgba(11,13,16,0.04),0_24px_48px_-28px_rgba(79,70,229,0.35)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        compact ? "p-4" : "p-5 sm:p-6",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100",
          iconClass,
          compact ? "h-9 w-9" : "h-11 w-11",
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
      </span>
      <span className="space-y-1">
        <span
          className={cn(
            "block font-semibold tracking-tight text-foreground",
            compact ? "text-sm" : "text-base",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "block text-muted-foreground",
            compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed",
          )}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

export function ShareOptions({
  onSelect,
  compact,
  className,
}: {
  onSelect: (kind: ShareKind) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {OPTIONS.map((option) => (
        <ShareOptionCard
          key={option.kind}
          title={option.title}
          description={option.description}
          icon={option.icon}
          iconClass={option.iconClass}
          compact={!!compact}
          onClick={() => onSelect(option.kind)}
        />
      ))}
    </div>
  );
}
