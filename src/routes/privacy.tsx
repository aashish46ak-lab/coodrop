import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { Footer } from "@/components/codrop/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — CODrop" },
      {
        name: "description",
        content:
          "How CODrop handles temporary drops: no accounts, no tracking, and every share deleted after 24 hours.",
      },
      { property: "og:title", content: "Privacy — CODrop" },
      {
        property: "og:description",
        content: "No accounts, no tracking, and every CODrop share disappears after 24 hours.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-12 sm:pt-16">
      <Link to="/" className="block">
        <BrandHeader tagline={null} />
      </Link>
      <article className="prose-sm mt-12 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Privacy</h1>
        <p>
          CODrop is anonymous by design. Creating or opening a drop requires no account, no email
          address and no sign-in.
        </p>
        <p>
          Every drop — text, image or video — is stored with an expiry time of 24 hours. Once that
          time passes the drop is no longer accessible, and expired records and files are removed.
        </p>
        <p>
          Share codes are short and random. Anyone who has the code can open the drop while it is
          alive, so only send codes to people you trust.
        </p>
        <p>
          Please do not use CODrop for sensitive personal data, credentials or anything you need
          kept permanently.
        </p>
      </article>
      <Footer />
    </main>
  );
}
