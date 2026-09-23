import { KeyRound, Send, UploadCloud } from "lucide-react";

const STEPS = [
  { icon: UploadCloud, title: "Drop", text: "Share text, images or videos." },
  { icon: KeyRound, title: "Get a code", text: "CODrop generates a unique temporary code." },
  { icon: Send, title: "Share", text: "Send the code to anyone you want." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="w-full">
      <h2
        id="how-it-works"
        className="text-center text-lg font-semibold tracking-tight text-foreground"
      >
        How CODrop works
      </h2>

      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                <step.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Step {index + 1}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
