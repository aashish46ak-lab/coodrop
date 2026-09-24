import { useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOwnerKey, setOwnerKey } from "@/lib/owner-key";
import { copyToClipboard } from "@/lib/clipboard";

export function HistorySync({ onImported }: { onImported?: () => void }) {
  const [open, setOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const key = typeof window !== "undefined" ? getOwnerKey() : "";

  function importKey() {
    if (!setOwnerKey(importValue)) {
      toast.error("Invalid history key");
      return;
    }
    toast.success("History key imported - refreshing list");
    setImportValue("");
    setOpen(false);
    onImported?.();
    window.setTimeout(() => window.location.reload(), 400);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <KeyRound className="h-3.5 w-3.5" />
        Cross-device history
      </button>
      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Copy this key on another phone/laptop and import it to see the same Shared list.
          </p>
          <div className="flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-card px-2 py-1.5 font-mono text-[11px]">
              {key}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => void copyToClipboard(key, "History key copied")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Paste history key from another device"
              className="h-9 text-xs"
            />
            <Button size="sm" disabled={!importValue.trim()} onClick={importKey}>
              Import
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
