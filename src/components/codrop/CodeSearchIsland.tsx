import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Search } from "lucide-react";

import { normalizeCode } from "@/lib/codrop-config";
import { cn } from "@/lib/utils";

export function CodeSearchIsland({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const code = normalizeCode(value);
    if (!code) {
      setError("Use a code like COf26");
      return;
    }
    setError(null);
    setBusy(true);
    void navigate({ to: "/drop/$code", params: { code } }).finally(() => setBusy(false));
  }

  if (compact) {
    return (
      <div className={cn("w-full max-w-[220px] sm:max-w-[260px]", className)}>
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0B0D10] py-1.5 pl-3 pr-1.5 shadow-md"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true" />
          <label htmlFor="drop-code-compact" className="sr-only">
            Search share code
          </label>
          <input
            id="drop-code-compact"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Code..."
            autoComplete="off"
            spellCheck={false}
            maxLength={12}
            className="min-w-0 flex-1 bg-transparent py-1 font-mono text-sm text-white placeholder:font-sans placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            aria-label="Open shared drop"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0B0D10] transition hover:scale-105 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </form>
        {error ? (
          <p className="mt-1 text-right text-[10px] text-destructive" role="status">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <section aria-labelledby="access-drop" className={cn("w-full", className)}>
      <p id="access-drop" className="mb-3 text-center text-sm font-medium text-muted-foreground">
        Already have a code?
      </p>
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-white/10 bg-[#0B0D10] p-2 pl-5 shadow-[0_24px_60px_-28px_rgba(11,13,16,0.65)] sm:gap-3"
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
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0B0D10] transition-transform hover:scale-[1.04] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>
      </form>
      <p className="mt-3 min-h-5 text-center text-xs text-destructive" role="status">
        {error ?? ""}
      </p>
    </section>
  );
}
