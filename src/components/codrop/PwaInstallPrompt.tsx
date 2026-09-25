import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DropMark, CodropWordmark } from "@/components/codrop/Logo";

const DISMISS_KEY = "sharetemp_pwa_dismissed";

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

/**
 * Fixed top bar: ShareTemp name (left) + Install (right).
 * position:fixed — page scroll garda mathi sathai jandaina.
 */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBip);

    try {
      if (localStorage.getItem(DISMISS_KEY) !== "1") {
        const t = window.setTimeout(() => setModalOpen(true), 2500);
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

  function dismissModal() {
    setModalOpen(false);
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
      dismissModal();
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
  }

  const ios = isIosDevice();

  return (
    <>
      {/* Fixed top bar — name left, Install right. Never scrolls away. */}
      {!installed ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[80] border-b border-border/60 bg-background/90 backdrop-blur-md"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="pointer-events-auto mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-3 sm:h-14 sm:px-5">
            <Link
              to="/"
              className="inline-flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CodropWordmark size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-semibold text-[#0B0D10] shadow-sm ring-1 ring-black/5 transition hover:bg-secondary active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              Install app
            </button>
          </div>
        </div>
      ) : null}

      {/* Spacer so page content is not hidden under the fixed bar */}
      {!installed ? (
        <div
          className="h-12 sm:h-14"
          style={{ marginTop: "env(safe-area-inset-top)" }}
          aria-hidden="true"
        />
      ) : null}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            aria-label="Close"
            onClick={dismissModal}
          />

          <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-border bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-6">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close"
              onClick={dismissModal}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-visible rounded-2xl bg-[#f8fafc] p-3 ring-1 ring-border">
              <DropMark className="h-14 w-14" size={56} />
            </div>

            <h2
              id="pwa-install-title"
              className="mt-4 text-center text-lg font-semibold tracking-tight text-foreground"
            >
              Add ShareTemp to your phone?
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
              {ios && !deferred
                ? "Tap Share, then Add to Home Screen for one-tap access."
                : "Install ShareTemp for faster access from your home screen."}
            </p>

            {ios && !deferred ? (
              <div className="mt-4 rounded-xl border border-border bg-secondary/50 px-3 py-3 text-left text-xs leading-relaxed text-muted-foreground">
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
                <Button className="min-h-11 w-full" onClick={() => void install()}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Install app
                </Button>
              ) : (
                <Button className="min-h-11 w-full" variant="secondary" onClick={dismissModal}>
                  {ios ? "Got it" : "Not now"}
                </Button>
              )}
              <Button variant="ghost" className="min-h-11 w-full" onClick={dismissModal}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
