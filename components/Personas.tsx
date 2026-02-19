import { Shield, TrendingUp, User } from "lucide-react";
import { PERSONAS } from "@/lib/constants";
import { FadeIn } from "./FadeIn";

const iconMap = { Shield, TrendingUp, User } as const;

const colorMap = {
  blue: {
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
  },
  green: {
    border: "border-brand-200",
    iconBg: "bg-brand-100",
    icon: "text-brand-600",
  },
  purple: {
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    icon: "text-violet-600",
  },
} as const;

export default function Personas() {
  const personas = Object.values(PERSONAS);

  return (
    <section id="personas" className="bg-ink-50 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Choose your AI persona.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              Each persona is pre-configured with the skills, tone, and
              knowledge to excel at its role.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {personas.map((persona, i) => {
            const Icon = iconMap[persona.icon as keyof typeof iconMap];
            const colors = colorMap[persona.color as keyof typeof colorMap];
            const isComingSoon = persona.comingSoon;
            return (
              <FadeIn key={persona.id} delay={i * 150}>
                <div
                  className={`rounded-2xl border ${colors.border} bg-white p-8 transition-all ${
                    isComingSoon
                      ? "opacity-60"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`inline-flex rounded-xl ${colors.iconBg} p-3`}
                    >
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    {isComingSoon && (
                      <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-400">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink-800">
                    {persona.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-ink-400">
                    {persona.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    {persona.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
