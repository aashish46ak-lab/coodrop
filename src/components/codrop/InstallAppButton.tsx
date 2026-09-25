import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { cn } from "@/lib/utils";

export const OPEN_INSTALL_EVENT = "sharetemp-open-install";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Chip next to ShareTemp name — normal flow, scrolls away with the header. */
export function InstallAppButton({ className }: { className?: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isStandalone());
  }, []);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_INSTALL_EVENT))}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-semibold text-[#0B0D10] shadow-sm ring-1 ring-black/5 transition hover:bg-secondary active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-3.5 sm:text-sm",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      Install app
    </button>
  );
}
