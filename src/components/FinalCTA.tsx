import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

export default function FinalCTA() {
  return (
    <SectionWrapper dark>
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="font-serif text-4xl font-semibold text-cream md:text-5xl">
            Ready to stop doing everything yourself?
          </h2>
        </FadeIn>
        <FadeIn delay={150}>
          <p className="mt-6 text-lg leading-relaxed text-warm-gray">
            Your AI assistant is waiting. Pick a plan, follow the setup guide,
            and start handing off your to-do list today.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="mt-10">
            <Button href="#pricing">
              Get Your AI Assistant — From $29/mo
            </Button>
          </div>
          <p className="mt-4 text-sm text-stone">
            Set up in under 10 minutes. No technical skills needed. Cancel
            anytime.
          </p>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
