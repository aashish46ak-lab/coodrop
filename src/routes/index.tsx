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

const SITE_URL = "https://sharetemp.vercel.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "ShareTemp - Temporary File & Content Sharing",
      },
      {
        name: "description",
        content:
          "ShareTemp lets you temporarily share files, text, photos, videos and folders with simple shareable links. Free, anonymous, no signup.",
      },
      {
        name: "keywords",
        content:
          "ShareTemp, temporary file share, temporary share, online file share, share text, share photos, share videos, anonymous file share, share with code",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "theme-color", content: "#1e40af" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "ShareTemp" },
      { name: "application-name", content: "ShareTemp" },
      { name: "author", content: "ShareTemp" },
      { property: "og:title", content: "ShareTemp - Temporary File & Content Sharing" },
      {
        property: "og:description",
        content:
          "ShareTemp lets you temporarily share files, text, photos, videos and folders with simple shareable links.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ShareTemp" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: `${SITE_URL}/og.jpg?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "ShareTemp - Share temporarily. Keep it simple." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ShareTemp - Temporary File & Content Sharing" },
      {
        name: "twitter:description",
        content:
          "Temporarily share files, text, photos, videos and folders with simple links. Free and anonymous.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og.jpg?v=6` },
      { name: "twitter:image:alt", content: "ShareTemp temporary sharing" },
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
          name: "ShareTemp",
          url: SITE_URL,
          description:
            "ShareTemp lets you temporarily share files, text, photos, videos and folders with simple shareable links.",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Temporary file sharing",
            "Share text with a short code",
            "Anonymous image and video upload",
            "Folder multi-share",
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
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-8rem] h-[24rem] bg-[radial-gradient(40rem_18rem_at_50%_0%,rgba(59,130,246,0.14),transparent_70%)] sm:top-[-12rem] sm:h-[32rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[4rem] h-[20rem] bg-[radial-gradient(28rem_14rem_at_85%_0%,rgba(34,211,238,0.10),transparent_70%)] sm:top-[6rem] sm:h-[28rem]"
      />

      <main className="relative mx-auto w-full max-w-5xl px-4 pb-28 pt-8 sm:px-5 sm:pb-12 sm:pt-14 md:pt-16">
        <BrandHeader />

        <section className="mx-auto mt-6 max-w-2xl text-center sm:mt-12 md:mt-16">
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Share temporarily.
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-xl sm:text-base md:text-lg">
            Drop text, photos, videos or folders. Get a short code and share it.
            Free, no signup. Content disappears when it expires.
          </p>
        </section>

        <div className="mt-5 sm:mt-10 sm:flex sm:justify-end">
          <div className="block w-full sm:hidden">
            <CodeSearchIsland />
          </div>
          <div className="hidden sm:block">
            <CodeSearchIsland compact />
          </div>
        </div>

        <ShareOptions className="mt-5 sm:mt-5" onSelect={openShare} />

        <RecentShared className="mt-8 sm:mt-10" />

        <div className="mt-12 sm:mt-20">
          <HowItWorks />
        </div>

        <section className="mx-auto mt-10 max-w-2xl text-center sm:mt-16" aria-label="About ShareTemp">
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Temporary file &amp; content sharing
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            ShareTemp is a free temporary sharing tool. Upload text, images or videos and get a
            short share code. No account needed. Ideal for quick online file share and private
            links that expire automatically.
          </p>
        </section>

        <Footer />
      </main>

      {flow}
    </div>
  );
}
