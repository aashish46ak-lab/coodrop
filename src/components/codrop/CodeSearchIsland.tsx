import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Search } from "lucide-react";

import { normalizeCode } from "@/lib/codrop-config";

export function CodeSearchIsland() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const code = normalizeCode(value);
    if (!code) {
      setError("Codes look like COf26 — two letters, a letter, then two numbers.");
      return;
    }
    setError(null);
    setBusy(true);
    void navigate({ to: "/drop/$code", params: { code } }).finally(() => setBusy(false));
  }

  return (
    <section aria-labelledby="access-drop" className="w-full">
      <p
        id="access-drop"
        className="mb-3 text-center text-sm font-medium text-muted-foreground"
      >
        Already have a code?
      </p>

      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-white/10 bg-[#0B0D10] p-2 pl-5 shadow-[0_24px_60px_-28px_rgba(11,13,16,0.65)] transition-shadow duration-300 focus-within:shadow-[0_28px_70px_-26px_rgba(79,70,229,0.6)] sm:gap-3"
      >
        <Search className="h-4.5 w-4.5 shrink-0 text-white/45" aria-hidden="true" />
        <label htmlFor="drop-code" className="sr-only">
          Search share code
        </label>
        <input
          id="drop-code"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Search share code..."
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-base text-white placeholder:font-sans placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Open shared drop"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0B0D10] transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60 motion-reduce:hover:scale-100"
        >
          {busy ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>
      </form>

      <p
        className="mt-3 min-h-5 text-center text-xs text-destructive"
        role="status"
        aria-live="polite"
      >
        {error ?? ""}
      </p>
    </section>
  );
}
