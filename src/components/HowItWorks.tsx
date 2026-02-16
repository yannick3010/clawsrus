import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

const steps = [
  {
    num: "01",
    title: "Pick your plan",
    body: "Choose the tier that fits your needs. Every plan includes your Personal Assistant with core skills built in.",
  },
  {
    num: "02",
    title: "Quick guided setup",
    body: "After checkout, follow a simple walkthrough to connect your Telegram. No coding. No terminal. Just a few clicks.",
  },
  {
    num: "03",
    title: "Start asking for help",
    body: "Your assistant is live. Ask it to research a trip, set a reminder, draft an email, plan your week — whatever you need. It's ready.",
  },
];

export default function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" alt>
      <SectionHeading>Up and running in three steps.</SectionHeading>
      <div className="grid gap-16 md:grid-cols-3 md:gap-12">
        {steps.map((step, i) => (
          <FadeIn key={step.num} delay={i * 150}>
            <div>
              <span className="font-serif text-6xl font-bold text-terracotta-light">
                {step.num}
              </span>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-espresso">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-earth">{step.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={500}>
        <p className="mt-16 text-center text-sm uppercase tracking-wider text-stone">
          Most people are up and running in under 10 minutes.
        </p>
      </FadeIn>
    </SectionWrapper>
  );
}
