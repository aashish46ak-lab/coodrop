import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { Footer } from "@/components/codrop/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — CODrop" },
      {
        name: "description",
        content: "The simple rules for using CODrop's temporary 24-hour sharing service.",
      },
      { property: "og:title", content: "Terms — CODrop" },
      {
        property: "og:description",
        content: "The simple rules for using CODrop's temporary 24-hour sharing service.",
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Terms</h1>
        <p>
          CODrop is a free, temporary sharing service provided as-is. Drops expire after 24 hours
          and may be removed at any time.
        </p>
        <p>
          Do not upload illegal content, malware, or material you do not have the right to share.
          Drops that break these rules may be deleted without notice.
        </p>
        <p>
          CODrop is not a backup service. Keep your own copy of anything important — expired drops
          cannot be recovered.
        </p>
      </article>
      <Footer />
    </main>
  );
}
