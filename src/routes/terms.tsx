import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { Footer } from "@/components/codrop/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — ShareTemp" },
      {
        name: "description",
        content: "Terms of use for ShareTemp temporary sharing.",
      },
      { property: "og:title", content: "Terms — ShareTemp" },
      {
        property: "og:description",
        content: "Simple rules for using ShareTemp.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-12 sm:pt-16">
      <Link to="/" className="block">
        <BrandHeader tagline={null} />
      </Link>
      <article className="mt-12 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Terms of Use</h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
        <p>
          ShareTemp is a free, temporary sharing service provided as-is. Shares expire after the
          chosen lifetime (up to 24 hours) and may be removed earlier if needed for safety or abuse
          prevention.
        </p>
        <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
        <p>
          Do not upload illegal content, malware, or material you do not have the right to share.
          Shares that break these rules may be deleted without notice.
        </p>
        <h2 className="text-base font-semibold text-foreground">No warranty</h2>
        <p>
          ShareTemp is not a backup service. Keep your own copy of anything important — expired
          shares cannot be recovered. The service is provided without warranties of any kind.
        </p>
        <h2 className="text-base font-semibold text-foreground">Liability</h2>
        <p>
          To the maximum extent permitted by law, ShareTemp and its operators are not liable for
          loss of data, interruption, or damages arising from use of the service.
        </p>
      </article>
      <Footer />
    </main>
  );
}
