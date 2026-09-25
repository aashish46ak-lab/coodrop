import { FileCode2, ImageIcon, PlayCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOnline } from "@/hooks/use-online";

export type ShareKind = "text" | "image" | "video";

const OPTIONS: Array<{
  kind: ShareKind;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}> = [
  {
    kind: "text",
    title: "Share Text",
    shortTitle: "Text",
    description: "Notes, code, links or long text.",
    icon: FileCode2,
    iconClass: "bg-indigo-500/10 text-indigo-600",
  },
  {
    kind: "image",
    title: "Share Image",
    shortTitle: "Image",
    description: "Upload a photo. Temporary share.",
    icon: ImageIcon,
    iconClass: "bg-cyan-500/10 text-cyan-600",
  },
  {
    kind: "video",
    title: "Share Video",
    shortTitle: "Video",
    description: "Upload a video. Temporary share.",
    icon: PlayCircle,
    iconClass: "bg-violet-500/10 text-violet-600",
  },
];

export function ShareOptionCard({
  title,
  shortTitle,
  description,
  icon: Icon,
  iconClass,
  compact,
  disabled,
  onClick,
}: {
  title: string;
  shortTitle: string;
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
        "group flex w-full flex-col items-center gap-2 rounded-2xl border border-border/80 bg-card text-center shadow-[0_1px_2px_rgba(11,13,16,0.04),0_12px_32px_-24px_rgba(11,13,16,0.25)] sm:items-start sm:text-left",
        "transition-all duration-200 active:scale-[0.98] hover:border-indigo-200",
        "sm:hover:-translate-y-1 sm:hover:shadow-[0_2px_4px_rgba(11,13,16,0.04),0_24px_48px_-28px_rgba(79,70,229,0.35)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        compact ? "p-3 sm:p-4" : "min-h-[5.25rem] p-3 sm:min-h-0 sm:p-5 md:p-6",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl",
          iconClass,
          compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11",
        )}
        aria-hidden="true"
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <span className="space-y-0.5">
        <span
          className={cn(
            "block font-semibold tracking-tight text-foreground",
            compact ? "text-sm" : "text-sm sm:text-base",
          )}
        >
          <span className="sm:hidden">{shortTitle}</span>
          <span className="hidden sm:inline">{title}</span>
        </span>
        <span
          className={cn(
            "hidden text-muted-foreground sm:block",
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
          Offline. Reconnect to share.
        </p>
      ) : null}
      {/* Always 3 columns - compact labels on phone */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {OPTIONS.map((option) => (
          <ShareOptionCard
            key={option.kind}
            title={option.title}
            shortTitle={option.shortTitle}
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
