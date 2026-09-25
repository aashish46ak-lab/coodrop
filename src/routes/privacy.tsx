import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { Footer } from "@/components/codrop/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy - ShareTemp" },
      {
        name: "description",
        content:
          "How ShareTemp handles temporary shares: no accounts, minimal data, and every share deleted after it expires.",
      },
      { property: "og:title", content: "Privacy - ShareTemp" },
      {
        property: "og:description",
        content: "No accounts required. Shares expire and are removed automatically.",
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
        <p>
          ShareTemp is a temporary sharing service. Creating or opening a share does not require an
          account, email address, or sign-in.
        </p>
        <h2 className="text-base font-semibold text-foreground">What we store</h2>
        <p>
          When you share text, images, videos or folders, we store the content (or file) you upload,
          a short share code, an optional title, an optional password hash, and an expiry time. Files
          are kept in private storage and are only accessible via temporary links while the share is
          active.
        </p>
        <h2 className="text-base font-semibold text-foreground">Retention</h2>
        <p>
          Every share has a limited lifetime (up to 24 hours, or the shorter duration you choose).
          After expiry the share is no longer accessible. Expired records and files are cleaned up
          automatically.
        </p>
        <h2 className="text-base font-semibold text-foreground">Local data</h2>
        <p>
          Your browser may store a random owner key, recent share history, and cookie-consent choice
          in local storage so you can manage your own shares on this device. You can clear this data
          anytime from your browser settings.
        </p>
        <h2 className="text-base font-semibold text-foreground">Analytics and cookies</h2>
        <p>
          ShareTemp does not use advertising trackers. We may use essential cookies or local storage
          for consent preference and basic service operation. See the cookie banner for choices.
        </p>
        <h2 className="text-base font-semibold text-foreground">Security note</h2>
        <p>
          Share codes are short. Anyone with the code can open the content while it is active. Do not
          share sensitive personal data, passwords, or anything you need kept permanently.
        </p>
        <p>
          Contact: use the site operator email if published, or open an issue on the project
          repository for privacy questions.
        </p>
      </article>
      <Footer />
    </main>
  );
}
