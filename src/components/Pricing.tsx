import clsx from "clsx";
import { PRICING_TIERS } from "@/lib/constants";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

export default function Pricing() {
  return (
    <SectionWrapper id="pricing">
      <SectionHeading sub="Every plan includes your Personal Assistant with core skills. Upgrade anytime.">
        Simple, honest pricing.
      </SectionHeading>
      <div className="grid gap-8 md:grid-cols-3">
        {PRICING_TIERS.map((tier, i) => (
          <FadeIn key={tier.name} delay={i * 120}>
            <div
              className={clsx(
                "relative flex h-full flex-col rounded-2xl bg-white p-8",
                tier.highlighted
                  ? "ring-2 ring-terracotta shadow-md"
                  : "shadow-sm",
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-terracotta px-4 py-1 text-xs font-medium uppercase tracking-wider text-cream">
                  {tier.badge}
                </span>
              )}
              <h3 className="font-serif text-2xl font-semibold text-espresso">
                {tier.name}
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="font-serif text-4xl font-bold text-espresso">
                  {tier.price}
                </span>
                <span className="ml-1 text-stone">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-earth">{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-charcoal">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-terracotta"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  href={tier.href}
                  variant={tier.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={400}>
        <p className="mt-12 text-center text-sm text-stone">
          All plans come with a guided setup walkthrough. No technical knowledge
          required. Cancel anytime.
        </p>
      </FadeIn>
    </SectionWrapper>
  );
}
