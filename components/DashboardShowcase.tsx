import Image from "next/image";
import { MessageSquare, Sparkles, Radio, Settings } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Talk to your assistant instantly from any device.",
  },
  {
    icon: Sparkles,
    title: "Skill Management",
    description:
      "Add and configure skills to expand what your assistant can do.",
  },
  {
    icon: Radio,
    title: "Channel Connections",
    description:
      "Connect messaging platforms your assistant can reach you on.",
  },
  {
    icon: Settings,
    title: "Account Settings",
    description: "Manage your plan, profile, and preferences in one place.",
  },
];

export default function DashboardShowcase() {
  return (
    <section id="dashboard" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Your Dashboard
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Your command center.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              A clean, intuitive dashboard where you manage your assistant,
              connect channels, add skills, and chat&nbsp;&mdash; all in one
              place.
            </p>
          </div>
        </FadeIn>

        {/* Browser mockup */}
        <FadeIn delay={200}>
          <div className="relative mx-auto mt-16 max-w-5xl">
            {/* Glow behind frame */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-100/60 via-brand-50/30 to-transparent blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-ink-100 shadow-2xl">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-4 py-3">
                {/* Traffic lights */}
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>

                {/* URL bar */}
                <div className="mx-auto flex max-w-xs items-center justify-center rounded-md bg-white/80 px-4 py-1 text-xs text-ink-400 ring-1 ring-ink-200/60 sm:max-w-sm">
                  <svg
                    className="mr-1.5 h-3 w-3 shrink-0 text-brand-500"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 1a4.5 4.5 0 0 0-4.5 4.5V7H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-.5V5.5A4.5 4.5 0 0 0 8 1Zm2.5 6V5.5a2.5 2.5 0 0 0-5 0V7h5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate">app.clawsrus.com/dashboard</span>
                </div>

                {/* Spacer to balance the dots */}
                <div className="w-[54px]" />
              </div>

              {/* Screenshot */}
              <Image
                src="/images/dashboard-preview.png"
                alt="ClawsRUs Dashboard — chat interface with sidebar navigation, status bar, and skill management"
                width={1440}
                height={2200}
                className="block w-full"
                priority={false}
              />
            </div>
          </div>
        </FadeIn>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={400 + i * 100}>
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                  <feat.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink-800">
                  {feat.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
                  {feat.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
