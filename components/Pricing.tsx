"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { TIERS, PERSONAS } from "@/lib/constants";
import type { TierId, PersonaId } from "@/lib/constants";
import { FadeIn } from "./FadeIn";

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
    <section id="pricing" className="bg-navy-50 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-navy-800 sm:text-4xl lg:text-5xl">
              Simple, honest pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-400">
              One-time setup fee. No subscriptions, no hidden costs. Pay once
              and your AI assistant is yours.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mx-auto mt-10 flex flex-col items-center gap-3">
            <label className="text-sm font-medium text-navy-400">
              Select your persona:
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {personas.map((p) => {
                const isComingSoon = p.comingSoon;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      !isComingSoon && setSelectedPersona(p.id as PersonaId)
                    }
                    disabled={isComingSoon}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isComingSoon
                        ? "cursor-not-allowed border border-navy-100 bg-navy-50 text-navy-300"
                        : selectedPersona === p.id
                          ? "bg-navy-800 text-white shadow-md"
                          : "border border-navy-200 bg-white text-navy-400 hover:border-navy-300 hover:text-navy-600"
                    }`}
                  >
                    {p.name}
                    {isComingSoon && (
                      <span className="ml-1 text-xs text-navy-300">
                        (soon)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {tiers.map((tier, i) => {
            const isPopular = "popular" in tier && tier.popular;
            const isConcierge = tier.id === "concierge";
            const isSoldOut = isConcierge; // Concierge sold out for February

            return (
              <FadeIn key={tier.id} delay={200 + i * 150}>
                <div
                  className={`relative rounded-2xl border p-8 transition-all ${
                    isSoldOut
                      ? "border-navy-100 bg-navy-50/50 opacity-60"
                      : isPopular
                        ? "border-brand-300 bg-white shadow-xl shadow-brand-100/50"
                        : "border-navy-200 bg-white hover:shadow-lg"
                  }`}
                >
                  {isSoldOut && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-300 px-4 py-1 text-xs font-semibold text-white">
                      February Slots Full
                    </div>
                  )}
                  {isPopular && !isSoldOut && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-navy-800">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-navy-400">
                    {tier.description}
                  </p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-navy-800">
                      ${tier.price}
                    </span>
                    <span className="ml-2 text-sm text-navy-300">
                      {tier.priceSuffix}
                    </span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-navy-500"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isSoldOut ? (
                    <div className="mt-8 rounded-lg bg-navy-100 px-4 py-3 text-center text-sm text-navy-400">
                      All February slots booked. Check back in March!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckout(tier.id as TierId)}
                      disabled={loading !== null}
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all ${
                        isPopular
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400 hover:shadow-xl"
                          : "bg-navy-800 text-white hover:bg-navy-700"
                      } disabled:opacity-50`}
                    >
                      {loading === tier.id ? (
                        "Redirecting..."
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
