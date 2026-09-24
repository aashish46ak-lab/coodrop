import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "codrop_pwa_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // ignore
    }

    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBip);

    // iOS / browsers without beforeinstallprompt: show soft tip once
    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIos) {
      const t = window.setTimeout(() => setVisible(true), 2500);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBip);
        window.clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") dismiss();
      else dismiss();
      return;
    }
    // iOS instructions stay visible until dismiss
  }

  if (!visible) return null;

  const isIos =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B0D10] text-white">
            <Download className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Add CODrop to your phone?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {isIos && !deferred
                ? "Tap Share, then Add to Home Screen for quick access."
                : "Install the app for faster access - works offline for the home screen."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {deferred ? (
                <Button size="sm" onClick={() => void install()}>
                  Add to phone
                </Button>
              ) : isIos ? (
                <Button size="sm" variant="secondary" onClick={dismiss}>
                  Got it
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={dismiss}>
                  Not now
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Dismiss
              </Button>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
