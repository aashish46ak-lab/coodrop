import { useEffect, useState } from "react";

/**
 * Live online status.
 * Optimistic: assume online until we get a real offline event or a failed check.
 * Avoids false "You're offline" when navigator.onLine is wrong (common on mobile / some browsers).
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    function goOnline() {
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        offlineTimer = null;
      }
      if (!cancelled) setOnline(true);
    }

    function goOffline() {
      // Small debounce — brief blips shouldn't flash the banner
      if (offlineTimer) clearTimeout(offlineTimer);
      offlineTimer = setTimeout(() => {
        if (!cancelled) setOnline(false);
      }, 400);
    }

    async function verify() {
      // If browser says online, trust it and stay online.
      if (typeof navigator !== "undefined" && navigator.onLine) {
        goOnline();
        return;
      }
      // Browser claims offline — double-check with a tiny same-origin request.
      // If it succeeds, we are actually online (false positive from navigator).
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 2500);
        await fetch(`${window.location.origin}/favicon.svg`, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(t);
        if (!cancelled) goOnline();
      } catch {
        if (!cancelled && typeof navigator !== "undefined" && !navigator.onLine) {
          goOffline();
        }
      }
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Initial check — never start as offline unless verified
    void verify();

    return () => {
      cancelled = true;
      if (offlineTimer) clearTimeout(offlineTimer);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
