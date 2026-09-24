import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "codrop_pwa_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

/** Top-right Install button + centered blur modal */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [canShowButton, setCanShowButton] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone()) {
      setCanShowButton(false);
      return;
    }

    setCanShowButton(true);

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBip);

    // Auto-show centered modal once (if not dismissed)
    try {
      if (localStorage.getItem(DISMISS_KEY) !== "1") {
        const t = window.setTimeout(() => setModalOpen(true), 1800);
        return () => {
          window.removeEventListener("beforeinstallprompt", onBip);
          window.clearTimeout(t);
        };
      }
    } catch {
      // ignore
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function dismissModal(permanent = true) {
    setModalOpen(false);
    if (permanent) {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
    }
  }

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      dismissModal(true);
      if (choice.outcome === "accepted") setCanShowButton(false);
      return;
    }
    // iOS / no deferred: keep modal open with instructions
  }

  const ios = isIosDevice();

  return (
    <>
      {/* Top Install button */}
      {canShowButton ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] flex justify-end p-3 sm:p-4">
          <Button
            type="button"
            size="sm"
            className="pointer-events-auto h-9 gap-1.5 rounded-full bg-[#0B0D10] px-3.5 text-white shadow-md hover:bg-[#0B0D10]/90"
            onClick={() => setModalOpen(true)}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Install
          </Button>
        </div>
      ) : null}

      {/* Centered modal + blurred rest of screen */}
      {modalOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-md"
            aria-label="Close"
            onClick={() => dismissModal(true)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close"
              onClick={() => dismissModal(true)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B0D10] text-white">
              <Download className="h-6 w-6" aria-hidden="true" />
            </div>

            <h2
              id="pwa-install-title"
              className="mt-4 text-center text-lg font-semibold tracking-tight text-foreground"
            >
              Add CODrop to your phone?
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              {ios && !deferred
                ? "Tap the Share button, then choose Add to Home Screen for one-tap access."
                : "Install CODrop for faster access from your home screen."}
            </p>

            {ios && !deferred ? (
              <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-3 py-3 text-left text-xs leading-relaxed text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <Share className="h-3.5 w-3.5" /> iPhone / iPad
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Tap Share in Safari</li>
                  <li>Scroll and tap Add to Home Screen</li>
                  <li>Tap Add</li>
                </ol>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              {deferred ? (
                <Button className="w-full" onClick={() => void install()}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Install app
                </Button>
              ) : ios ? (
                <Button className="w-full" variant="secondary" onClick={() => dismissModal(true)}>
                  Got it
                </Button>
              ) : (
                <Button className="w-full" variant="secondary" onClick={() => dismissModal(true)}>
                  Not now
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => dismissModal(true)}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
