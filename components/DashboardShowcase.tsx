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

        {/* Dashboard mockup */}
        <FadeIn delay={200}>
          <div className="relative mx-auto mt-16 max-w-5xl">
            {/* Glow behind image */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand-100/60 via-brand-50/30 to-transparent blur-2xl" />

            <div className="relative">
              <Image
                src="/images/dashboard-preview.png"
                alt="ClawsRUs Dashboard on mobile and desktop — chat interface with sidebar navigation, skill management, and channel connections"
                width={1536}
                height={1024}
                className="block w-full rounded-2xl"
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
