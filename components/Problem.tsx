import { FadeIn } from "./FadeIn";

const painPoints = [
  {
    step: "01",
    text: "You open ChatGPT with a task in mind... then spend 20 minutes engineering the perfect prompt just to get a usable answer",
  },
  {
    step: "02",
    text: 'You try an AI tool that promises to "handle everything" \u2014 but it forgets who you are every single conversation',
  },
  {
    step: "03",
    text: "You find an AI agent that actually looks powerful... then hit a setup guide that reads like a computer science textbook",
  },
  {
    step: "04",
    text: "You close the tab, open your calendar, and go back to manually scheduling, researching, and chasing follow-ups yourself",
  },
];

export default function Problem() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-24 sm:py-32">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Warm glow behind headline */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-900/20 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400/80">
            The real cost of not having an AI assistant
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
            Every hour you spend on admin is an hour{" "}
            <span className="relative">
              <span className="relative z-10">stolen</span>
              <span className="absolute -inset-x-1 bottom-0 top-1/2 -skew-x-2 bg-red-500/20" />
            </span>{" "}
            from the things that matter.
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
            You&rsquo;re juggling 47 tabs, three to-do apps, and a notes file
            called &ldquo;ACTUALLY IMPORTANT.&rdquo; Meanwhile, the things that
            actually matter &mdash; growing your work, spending time with
            people you care about, or just having your evening back &mdash;
            keep getting pushed to tomorrow.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {painPoints.map((point, i) => (
            <FadeIn key={point.step} delay={200 + i * 100}>
              <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-white/[0.1] hover:bg-white/[0.05]">
                {/* Step number */}
                <span className="font-display text-3xl font-light tabular-nums text-red-400/30">
                  {point.step}
                </span>
                <p className="mt-3 leading-relaxed text-ink-300">
                  {point.text}
                </p>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
