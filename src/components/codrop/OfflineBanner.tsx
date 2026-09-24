import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-online";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[85] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-amber-950 shadow-md"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You are offline. Sharing and loading drops need an internet connection.</span>
    </div>
  );
}
