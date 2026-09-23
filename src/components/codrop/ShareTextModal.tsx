import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CODROP } from "@/lib/codrop-config";
import { createTextDrop, type CreatedDrop } from "@/lib/create-drop";

export function ShareTextModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (drop: CreatedDrop) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const tooLong = text.length > CODROP.maxTextLength;

  async function share() {
    setBusy(true);
    try {
      const drop = await createTextDrop(text, title);
      setText("");
      setTitle("");
      onCreated(drop);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Text</DialogTitle>
          <DialogDescription>
            Paste notes, source code, logs, JSON, Markdown or links. Long content is welcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="drop-title" className="text-xs font-medium text-muted-foreground">
              Title <span className="font-normal">(optional)</span>
            </label>
            <Input
              id="drop-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="e.g. Meeting notes, API config, bug log..."
              maxLength={120}
              disabled={busy}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="drop-text" className="sr-only">
              Text to share
            </label>
            <textarea
              id="drop-text"
              value={text}
              autoFocus
              onChange={(event) => setText(event.target.value)}
              spellCheck={false}
              placeholder={"// paste anything here\nconst hello = 'world';"}
              className="h-[40vh] min-h-56 w-full resize-y rounded-xl border border-border bg-secondary/30 p-4 font-mono text-sm leading-relaxed text-foreground shadow-inner placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={tooLong ? "text-destructive" : undefined}>
                {text.length.toLocaleString()} / {CODROP.maxTextLength.toLocaleString()} characters
              </span>
              <span>Expires 24h after sharing</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={busy || (!text && !title)}
            onClick={() => {
              setText("");
              setTitle("");
            }}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !text.trim() || tooLong}
              onClick={() => void share()}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating your drop...
                </>
              ) : (
                "Share Text"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
