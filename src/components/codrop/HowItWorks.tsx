import { KeyRound, Send, UploadCloud } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Share",
    text: "Upload text, images or videos — free temporary share, no account.",
  },
  {
    icon: KeyRound,
    title: "Get a code",
    text: "ShareTemp creates a short code for your content (e.g. STa23).",
  },
  {
    icon: Send,
    title: "Send",
    text: "Send the code to anyone. They open it — then it expires.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="w-full">
      <h2
        id="how-it-works"
        className="text-center text-base font-semibold tracking-tight text-foreground sm:text-lg"
      >
        How ShareTemp works
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-center text-xs text-muted-foreground sm:text-sm">
        Simple temporary sharing — built for phones and desktop.
      </p>

      <ol className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm sm:p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                <step.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                Step {index + 1}
              </span>
            </div>
            <h3 className="mt-2.5 text-sm font-semibold text-foreground sm:mt-3">{step.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
