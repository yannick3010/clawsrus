import { Moon, Brain, Zap } from "lucide-react";
import { FadeIn } from "./FadeIn";

const traits = [
  {
    icon: Moon,
    label: "Never sleeps",
    detail: "24/7 availability",
  },
  {
    icon: Brain,
    label: "Never forgets",
    detail: "Long-term memory",
  },
  {
    icon: Zap,
    label: "Never needs to be told twice",
    detail: "Preconfigured personas",
  },
];

export default function Solution() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      {/* Soft brand glow */}
      <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-brand-100/40 blur-[100px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-50/60 blur-[80px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr,380px] lg:items-start lg:gap-16">
          {/* Left column — main content */}
          <div>
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                ClawsRUs
              </p>
              <h2 className="mt-4 font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
                Your assistant is already set up. Just tell it what you need.
              </h2>
              <p className="mt-2 text-lg text-ink-400">
                A private AI assistant, configured and ready on day one
              </p>
            </FadeIn>

            <FadeIn delay={150}>
              <p className="mt-8 text-lg leading-relaxed text-ink-500">
                ClawsRUs gives you your own AI assistant &mdash; not a shared
                chatbot, not a blank prompt window. A{" "}
                <strong className="font-semibold text-ink-700">
                  private, preconfigured assistant
                </strong>{" "}
                that lives on your own dashboard, remembers every conversation,
                and handles the work that buries your day: scheduling, research,
                email drafts, follow-ups, reminders, and the dozen small tasks
                you keep meaning to get to.
              </p>
            </FadeIn>

            <FadeIn delay={250}>
              <p className="mt-6 text-lg leading-relaxed text-ink-500">
                We set everything up for you.{" "}
                <span className="text-ink-700">
                  No API keys, no config files, no YouTube tutorials.
                </span>{" "}
                You answer a few questions, and your assistant is live in under
                10 minutes &mdash; on your phone, tablet, or laptop.
              </p>
            </FadeIn>
          </div>

          {/* Right column — blockquote card */}
          <FadeIn delay={300} className="lg:mt-20">
            <div className="relative rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 p-8 sm:p-10">
              {/* Decorative corner accent */}
              <div className="absolute right-0 top-0 h-20 w-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute -right-10 -top-10 h-20 w-20 rotate-45 bg-brand-500/15" />
              </div>

              <blockquote>
                <p className="font-display text-xl leading-relaxed tracking-tight text-white/90">
                  Think less &ldquo;chatbot you have to babysit&rdquo; and more{" "}
                  <span className="text-brand-300">
                    &ldquo;chief of staff who never sleeps, never forgets, and
                    never needs to be told twice.&rdquo;
                  </span>
                </p>
              </blockquote>

              {/* Trait pills */}
              <div className="mt-8 flex flex-wrap gap-3">
                {traits.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5"
                  >
                    <t.icon className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-xs font-medium text-white/70">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
