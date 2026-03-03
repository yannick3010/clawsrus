import { ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink-800 py-24 sm:py-32">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to stop doing everything yourself?
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
            Your AI assistant is one click away. Pick a plan, install your
            agent, and start chatting from your dashboard today.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-10">
            <a
              href="/signup?tier=standard&persona=personal-assistant"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-ink-800 shadow-xl transition-all hover:bg-ink-50 hover:shadow-2xl"
            >
              Get Your AI Assistant
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <p className="mt-6 text-sm text-ink-300">
            One-click install. No extra apps needed. No technical skills
            required.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
