import { useState } from "react";
import { Check, Copy, Link2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpirationTimer } from "./ExpirationTimer";
import { ShareOptions, type ShareKind } from "./ShareOptions";
import { copyToClipboard } from "@/lib/clipboard";

export function SuccessDialog({
  open,
  code,
  expiresAt,
  onOpenChange,
  onShareAnother,
}: {
  open: boolean;
  code: string;
  expiresAt: string;
  onOpenChange: (open: boolean) => void;
  onShareAnother: (kind: ShareKind | null) => void;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(kind: "code" | "link") {
    const value =
      kind === "code" ? code : `${window.location.origin}/drop/${code}`;
    const ok = await copyToClipboard(value, kind === "code" ? "Code copied" : "Link copied");
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="items-center text-center">
          <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <DialogTitle className="text-xl">Your shared content is online.</DialogTitle>
          <DialogDescription>
            This content will automatically expire in 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your code
          </p>
          <div className="mx-auto w-fit rounded-2xl bg-[#0B0D10] px-8 py-4">
            <span className="font-mono text-3xl font-semibold tracking-[0.12em] text-white">
              {code}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => void copy("code")} className="sm:min-w-36">
              {copied === "code" ? (
                <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
              )}
              {copied === "code" ? "Copied" : "Copy Code"}
            </Button>
            <Button variant="outline" onClick={() => void copy("link")} className="sm:min-w-36">
              {copied === "link" ? (
                <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
              ) : (
                <Link2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              )}
              {copied === "link" ? "Copied" : "Copy Share Link"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Share this code with anyone you want to access your content.
          </p>

          <ExpirationTimer expiresAt={expiresAt} />
        </div>

        <div className="mt-2 border-t border-border pt-5">
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => onShareAnother(null)}>
              Share another
            </Button>
          </div>
          <ShareOptions compact className="mt-4" onSelect={(kind) => onShareAnother(kind)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
