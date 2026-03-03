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
          <p className="mt-8 text-lg leading-relaxed text-ink-500">
            ClawsRUs gives you pre-configured AI agents that are ready to work
            the moment you install them — right from your own dashboard.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            No blank canvas. No technical setup. No extra apps to install.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            Pick the basic agent, or choose one that&rsquo;s already been
            trained and configured for your specific use case. Either way, your
            assistant arrives knowing how to help with scheduling, research,
            reminders, travel planning, shopping, and all the life admin that
            eats up your day. And it gets better the more you use it — learning
            your preferences, your routines, and your priorities over time.
          </p>
        </FadeIn>

        <FadeIn delay={400}>
          <blockquote className="mt-12 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 px-8 py-8">
            <p className="font-display text-xl italic leading-relaxed text-ink-700">
              Think of it less like a chatbot and more like a capable,
              always-available personal assistant who never drops the ball.
            </p>
          </blockquote>
        </FadeIn>
      </div>
    </section>
  );
}
