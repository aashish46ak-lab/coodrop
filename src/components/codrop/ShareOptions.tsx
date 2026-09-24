import { FileCode2, ImageIcon, PlayCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOnline } from "@/hooks/use-online";

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
    description: "Notes, code, links or long text.",
    icon: FileCode2,
    iconClass: "bg-indigo-500/10 text-indigo-600",
  },
  {
    kind: "image",
    title: "Share Image",
    description: "Upload a photo — temporary share.",
    icon: ImageIcon,
    iconClass: "bg-cyan-500/10 text-cyan-600",
  },
  {
    kind: "video",
    title: "Share Video",
    description: "Upload a video — temporary share.",
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
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  compact?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full flex-col items-start gap-2.5 rounded-2xl border border-border/80 bg-card text-left shadow-[0_1px_2px_rgba(11,13,16,0.04),0_12px_32px_-24px_rgba(11,13,16,0.25)]",
        "transition-all duration-200 active:scale-[0.98] hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_2px_4px_rgba(11,13,16,0.04),0_24px_48px_-28px_rgba(79,70,229,0.35)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
        "disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0",
        /* Mobile: larger tap area; desktop: more padding */
        compact ? "p-4" : "p-4 min-h-[5.5rem] sm:min-h-0 sm:p-5 md:p-6",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100",
          iconClass,
          compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11",
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
      </span>
      <span className="space-y-0.5 sm:space-y-1">
        <span
          className={cn(
            "block font-semibold tracking-tight text-foreground",
            compact ? "text-sm" : "text-[0.9375rem] sm:text-base",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "block text-muted-foreground",
            compact ? "text-xs leading-relaxed" : "text-xs leading-relaxed sm:text-sm",
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
  const online = useOnline();

  return (
    <div className={cn("space-y-2", className)}>
      {!online ? (
        <p className="text-center text-xs text-amber-700 dark:text-amber-400">
          Offline — reconnect to share.
        </p>
      ) : null}
      {/* Mobile: single column with comfortable gaps; sm+: 3 cols */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {OPTIONS.map((option) => (
          <ShareOptionCard
            key={option.kind}
            title={option.title}
            description={option.description}
            icon={option.icon}
            iconClass={option.iconClass}
            compact={!!compact}
            disabled={!online}
            onClick={() => onSelect(option.kind)}
          />
        ))}
      </div>
    </div>
  );
}
