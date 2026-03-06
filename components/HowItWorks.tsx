import { CreditCard, Settings, MessageCircle } from "lucide-react";
import { FadeIn } from "./FadeIn";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Pick your plan",
    description:
      "Choose Free or Pro. Both include your AI assistant with all core skills — nothing extra to configure.",
  },
  {
    number: "02",
    icon: Settings,
    title: "One-click install",
    description:
      "Choose your agent and install it with a single click. No coding. No extra apps. Your dashboard is ready in seconds.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Start chatting",
    description:
      "Open your dashboard and start chatting. Ask it to research a trip, set a reminder, draft an email, plan your week — whatever you need.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Up and running in three steps.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              Pick an agent, install, and start chatting — all in under 10 minutes.
            </p>
          </div>
        </FadeIn>

        <div className="mt-20 grid gap-12 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 150}>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-ink-800">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-400">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
