"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { SETUP_PACKAGES, PERSONAS } from "@/lib/constants";
import type { PersonaId } from "@/lib/constants";
import { FadeIn } from "./FadeIn";

export default function Pricing() {
  const [selectedPersona, setSelectedPersona] =
    useState<PersonaId>("personal-assistant");

  const setupPackages = Object.values(SETUP_PACKAGES);
  const personas = Object.values(PERSONAS);

  return (
    <section id="pricing" className="bg-ink-50 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Simple, honest pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              Choose your one-time setup package. Every signup includes a
              7-day Pro membership trial, then continues on Free or Pro.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mx-auto mt-10 flex flex-col items-center gap-3">
            <label className="text-sm font-medium text-ink-400">
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
                        ? "cursor-not-allowed border border-ink-100 bg-ink-50 text-ink-300"
                        : selectedPersona === p.id
                          ? "bg-ink-800 text-white shadow-md"
                          : "border border-ink-200 bg-white text-ink-400 hover:border-ink-300 hover:text-ink-600"
                    }`}
                  >
                    {p.name}
                    {isComingSoon && (
                      <span className="ml-1 text-xs text-ink-300">
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
          {setupPackages.map((setupPackage, i) => {
            const isConcierge = setupPackage.id === "concierge";
            const isRecommended = setupPackage.id === "standard";

            return (
              <FadeIn key={setupPackage.id} delay={200 + i * 150}>
                <div
                  className={`relative rounded-2xl border p-8 transition-all ${
                    isConcierge
                      ? "border-ink-100 bg-ink-50"
                      : isRecommended
                        ? "border-brand-300 bg-white shadow-xl shadow-brand-100/50 hover:shadow-2xl"
                        : "border-ink-200 bg-white hover:shadow-lg"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-xs font-semibold text-white">
                      Recommended
                    </div>
                  )}
                  {isConcierge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-700">
                      All spots booked for March
                    </div>
                  )}
                  <h3 className={`text-lg font-semibold ${isConcierge ? "text-ink-300" : "text-ink-800"}`}>
                    {setupPackage.name}
                  </h3>
                  <p className={`mt-1 text-sm ${isConcierge ? "text-ink-300" : "text-ink-400"}`}>
                    {setupPackage.description}
                  </p>
                  <div className="mt-6">
                    <span className={`text-4xl font-bold ${isConcierge ? "text-ink-300" : "text-ink-800"}`}>
                      ${setupPackage.price}
                    </span>
                    <span className={`ml-2 text-sm ${isConcierge ? "text-ink-200" : "text-ink-300"}`}>
                      {setupPackage.priceSuffix}
                    </span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {setupPackage.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-3 text-sm ${isConcierge ? "text-ink-300" : "text-ink-500"}`}
                      >
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isConcierge ? "text-ink-200" : "text-brand-500"}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isConcierge ? (
                    <span
                      className="mt-8 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-ink-200 py-3 text-sm font-semibold text-ink-400"
                    >
                      Sold Out
                    </span>
                  ) : (
                    <a
                      href={`/signup?setup_package=${setupPackage.id}&persona=${selectedPersona}`}
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all ${
                        isRecommended
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400 hover:shadow-xl"
                          : "bg-ink-800 text-white hover:bg-ink-700"
                      }`}
                    >
                      Start Setup
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={450}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-400">
            Every signup includes a 7-day Pro trial — no credit card required
            for the trial. After that, stay on Free or upgrade to Pro
            ($29/month) for all paid skills.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
