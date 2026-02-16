import { CreditCard, Settings, MessageCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: CreditCard,
    title: "Choose a Persona & Plan",
    description:
      "Pick the AI persona that fits your needs — Chief of Staff, Sales Expert, or Personal Assistant. Select a plan and check out in 30 seconds.",
  },
  {
    number: "2",
    icon: Settings,
    title: "Quick Setup",
    description:
      "Create a Telegram bot (we walk you through it) and add your AI API key. Takes about 5 minutes with our step-by-step guide.",
  },
  {
    number: "3",
    icon: MessageCircle,
    title: "Start Chatting",
    description:
      "Your AI assistant goes live on Telegram within minutes. Message it like you'd message a colleague — it remembers everything and gets better over time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-900 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            From signup to chatting with your AI — in under 10 minutes.
          </p>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
                {step.number}
              </div>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
