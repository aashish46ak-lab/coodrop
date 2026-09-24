import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useOnline } from "@/hooks/use-online";

export function ShareTextModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (drop: CreatedDrop) => void;
}) {
  const online = useOnline();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [ttl, setTtl] = useState<1 | 6 | 24>(24);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const tooLong = text.length > CODROP.maxTextLength;
  const canShare =
    online && title.trim().length > 0 && text.trim().length > 0 && !tooLong;

  async function share() {
    if (!canShare) return;
    if (!online) {
      toast.error("You are offline. Reconnect to share.");
      return;
    }
    setBusy(true);
    try {
      const drop = await createTextDrop(text, title, password || undefined, ttl);
      setText("");
      setTitle("");
      setPassword("");
      onCreated(drop);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : !navigator.onLine
            ? "You are offline. Reconnect and try again."
            : "Something went wrong.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? null : onOpenChange(next))}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share Text</DialogTitle>
          <DialogDescription>Paste notes, source code, logs, JSON or links.</DialogDescription>
        </DialogHeader>

        {!online ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            You are offline. Reconnect to share text.
          </p>
        ) : null}

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="drop-title" className="text-xs font-medium text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="drop-title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                placeholder="e.g. Meeting notes"
                maxLength={120}
                disabled={busy}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="drop-pass" className="text-xs font-medium text-muted-foreground">
                Password <span className="font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Input
                  id="drop-pass"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                  placeholder="Leave empty for public"
                  maxLength={64}
                  disabled={busy}
                  className="h-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Expires after</p>
            <div className="flex flex-wrap gap-2">
              {CODROP.ttlOptions.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  disabled={busy}
                  onClick={() => setTtl(opt.hours)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    ttl === opt.hours
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="drop-text"
            value={text}
            autoFocus
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
            placeholder={"// paste anything here"}
            className="h-[36vh] min-h-48 w-full resize-y rounded-xl border border-border bg-secondary/30 p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className={`text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>
            {text.length.toLocaleString()} / {CODROP.maxTextLength.toLocaleString()} characters
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setText("");
              setTitle("");
              setPassword("");
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
            <Button type="button" disabled={busy || !canShare} onClick={() => void share()}>
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating...
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
