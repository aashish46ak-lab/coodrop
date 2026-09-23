import { createFileRoute } from "@tanstack/react-router";

import { BrandHeader } from "@/components/codrop/Logo";
import { ShareOptions } from "@/components/codrop/ShareOptions";
import { CodeSearchIsland } from "@/components/codrop/CodeSearchIsland";
import { HowItWorks } from "@/components/codrop/HowItWorks";
import { Footer } from "@/components/codrop/Footer";
import { useShareFlow } from "@/components/codrop/ShareFlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CODrop — Share Anything. Get a Code." },
      {
        name: "description",
        content:
          "Temporarily share text, images and videos with a simple code. Every drop expires after 24 hours.",
      },
      { property: "og:title", content: "CODrop — Share Anything. Get a Code." },
      {
        property: "og:description",
        content:
          "Temporarily share text, images and videos with a simple code. Every drop expires after 24 hours.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { openShare, flow } = useShareFlow();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-12rem] h-[32rem] bg-[radial-gradient(45rem_22rem_at_50%_0%,rgba(99,102,241,0.13),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[6rem] h-[28rem] bg-[radial-gradient(38rem_18rem_at_78%_0%,rgba(34,211,238,0.10),transparent_70%)]"
      />

      <main className="relative mx-auto w-full max-w-5xl px-5 pt-12 sm:pt-16">
        <BrandHeader />

        <section className="mx-auto mt-12 max-w-2xl text-center sm:mt-16">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Share anything. Get a code.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Drop text, photos, videos and more. Get a temporary code and share it instantly.
          </p>
        </section>

        <ShareOptions className="mt-10 sm:mt-12" onSelect={openShare} />

        <div className="mt-16 sm:mt-20">
          <CodeSearchIsland />
        </div>

        <div className="mt-20">
          <HowItWorks />
        </div>

        <Footer />
      </main>

      {flow}
    </div>
  );
}
