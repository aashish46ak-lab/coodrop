import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { ShareOptions } from "@/components/codrop/ShareOptions";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { RecentShared } from "@/components/codrop/RecentShared";
import { HowItWorks } from "@/components/codrop/HowItWorks";
import { Footer } from "@/components/codrop/Footer";
import { useShareFlow } from "@/components/codrop/ShareFlow";
import { maybeCleanupExpired } from "@/lib/cleanup";

const SITE_URL = "https://codrop.vercel.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "CODrop — Free Temporary File Share | Share Text, Images & Videos with a Code",
      },
      {
        name: "description",
        content:
          "CODrop is a free temporary file share and online share tool. Share text, code, images and videos anonymously — get a short code, no signup. Files expire automatically. Perfect for codedrop, temporary share and quick file sharing.",
      },
      {
        name: "keywords",
        content:
          "codedrop, CODrop, file share, temporary file share, temporary share, online file share, anonymous file share, share with code, share code, pastebin, temporary image share, temporary video share, no signup file share, free file sharing, short code share",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "theme-color", content: "#0B0D10" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "CODrop" },
      { name: "application-name", content: "CODrop" },
      { name: "author", content: "CODrop" },
      { property: "og:title", content: "CODrop — Share Anything. Get a Code." },
      {
        property: "og:description",
        content:
          "Free temporary file share. Drop text, photos or videos and get a short code. Anonymous, no signup, auto-expires.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "CODrop" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: `${SITE_URL}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "CODrop — Share anything. Get a code." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CODrop — Share Anything. Get a Code." },
      {
        name: "twitter:description",
        content:
          "Temporary file share with a simple code. Text, images, videos. Free & anonymous.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og.png` },
      { name: "twitter:image:alt", content: "CODrop temporary file share" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/pwa-192.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "CODrop",
          url: SITE_URL,
          description:
            "Free temporary file share and online share tool. Share text, images and videos with a short code. Anonymous, no signup, auto-expires.",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Temporary file sharing",
            "Share text and code with a short code",
            "Anonymous image and video upload",
            "No account required",
            "Automatic expiration",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { openShare, flow } = useShareFlow();

  useEffect(() => {
    void maybeCleanupExpired();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-8rem] h-[24rem] bg-[radial-gradient(40rem_18rem_at_50%_0%,rgba(99,102,241,0.14),transparent_70%)] sm:top-[-12rem] sm:h-[32rem] sm:bg-[radial-gradient(45rem_22rem_at_50%_0%,rgba(99,102,241,0.13),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[4rem] h-[20rem] bg-[radial-gradient(28rem_14rem_at_85%_0%,rgba(34,211,238,0.10),transparent_70%)] sm:top-[6rem] sm:h-[28rem] sm:bg-[radial-gradient(38rem_18rem_at_78%_0%,rgba(34,211,238,0.10),transparent_70%)]"
      />

      <main className="relative mx-auto w-full max-w-5xl px-4 pb-8 pt-10 sm:px-5 sm:pt-14 md:pt-16">
        <BrandHeader />

        {/* Hero — tighter on mobile */}
        <section className="mx-auto mt-8 max-w-2xl text-center sm:mt-12 md:mt-16">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground xs:text-3xl sm:text-4xl md:text-5xl">
            Share anything. Get a code.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-xl sm:text-base md:text-lg">
            Drop text, photos, videos and more. Get a code and share it instantly.
            Free temporary file share — no signup.
          </p>
        </section>

        {/* Mobile: full-width search under hero. Desktop: compact top-right */}
        <div className="mt-6 sm:mt-8 sm:flex sm:justify-end sm:mt-10">
          <div className="block w-full sm:hidden">
            <CodeSearchIsland />
          </div>
          <div className="hidden sm:block">
            <CodeSearchIsland compact />
          </div>
        </div>

        <ShareOptions className="mt-5 sm:mt-5" onSelect={openShare} />

        <RecentShared className="mt-8 sm:mt-10" />

        <div className="mt-14 sm:mt-20">
          <HowItWorks />
        </div>

        {/* SEO-friendly extra copy (visually light) */}
        <section className="mx-auto mt-12 max-w-2xl text-center sm:mt-16" aria-label="About CODrop">
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Temporary file share &amp; online share with a code
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            CODrop is a free <strong className="font-medium text-foreground/90">temporary file share</strong> tool.
            Upload text, images or videos and get a short share code — no account needed.
            Ideal for quick <strong className="font-medium text-foreground/90">online file share</strong>,
            codedrop-style sharing, and private temporary links that expire automatically.
          </p>
        </section>

        <Footer />
      </main>

      {flow}
    </div>
  );
}
