import { Link } from "@tanstack/react-router";

import { DropMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <DropMark className="h-7 w-7" />
          <div>
            <p className="text-sm font-semibold text-foreground">CODrop</p>
            <p className="text-xs text-muted-foreground">Temporary sharing, made simple.</p>
          </div>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Every drop expires after 24 hours.
      </p>
    </footer>
  );
}
