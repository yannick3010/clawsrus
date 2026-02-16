"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TIERS, PERSONAS } from "@/lib/constants";
import type { TierId, PersonaId } from "@/lib/constants";

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] =
    useState<PersonaId>("personal-assistant");

  const tiers = Object.values(TIERS);
  const personas = Object.values(PERSONAS);

  async function handleCheckout(tierId: TierId) {
    setLoading(tierId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId, persona: selectedPersona }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            You bring your own AI API key (OpenAI or Gemini) — so you only pay
            us for the persona, skills, and infrastructure.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3">
          <label className="text-sm font-medium text-slate-400">
            Select your persona:
          </label>
          <div className="flex gap-2">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id as PersonaId)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedPersona === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => {
            const isPopular = "popular" in tier && tier.popular;
            return (
              <div
                key={tier.id}
                className={`relative rounded-xl border p-8 ${
                  isPopular
                    ? "border-blue-500 bg-slate-900"
                    : "border-slate-800 bg-slate-900/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {tier.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(tier.id as TierId)}
                  disabled={loading !== null}
                  className={`mt-8 w-full rounded-lg py-3 text-sm font-semibold transition ${
                    isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  } disabled:opacity-50`}
                >
                  {loading === tier.id ? "Redirecting..." : "Get Started"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          + your own AI API costs (typically $5-20/mo depending on usage)
        </p>
      </div>
    </section>
  );
}
