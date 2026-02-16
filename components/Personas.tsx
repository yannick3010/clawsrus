"use client";

import { Shield, TrendingUp, User } from "lucide-react";
import { PERSONAS } from "@/lib/constants";

const iconMap = {
  Shield,
  TrendingUp,
  User,
} as const;

const colorMap = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    tag: "bg-blue-500/10 text-blue-400",
  },
  green: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    tag: "bg-emerald-500/10 text-emerald-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    tag: "bg-purple-500/10 text-purple-400",
  },
} as const;

export default function Personas() {
  const personas = Object.values(PERSONAS);

  return (
    <section id="personas" className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Choose Your AI Persona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Each persona is pre-configured with the skills, tone, and knowledge
            to excel at its role. Pick one and start getting results immediately.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {personas.map((persona) => {
            const Icon = iconMap[persona.icon as keyof typeof iconMap];
            const colors = colorMap[persona.color as keyof typeof colorMap];
            return (
              <div
                key={persona.id}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-8 transition hover:scale-[1.02]`}
              >
                <div
                  className={`inline-flex rounded-lg ${colors.tag} p-3`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{persona.name}</h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  {persona.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {persona.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
