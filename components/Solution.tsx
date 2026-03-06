import { FadeIn } from "./FadeIn";

export default function Solution() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
            Meet your new assistant. It already knows the job.
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <h3 className="mt-8 font-display text-2xl tracking-tight text-ink-800">
            What is ClawsRUs?
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            ClawsRUs is a pre-configured AI assistant that runs inside Telegram.
            It handles scheduling, research, reminders, email drafting, travel
            planning, and everyday life admin. Setup takes under 10 minutes — no
            coding or technical skills required. Built on OpenClaw, the
            open-source AI framework.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            Your assistant arrives ready to handle scheduling, research,
            reminders, travel, and shopping — the life admin that eats your day.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <blockquote className="mt-12 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 px-8 py-8">
            <p className="font-display text-xl italic leading-relaxed text-ink-700">
              Less chatbot, more chief of staff — always available, never drops
              the ball.
            </p>
          </blockquote>
        </FadeIn>
      </div>
    </section>
  );
}
