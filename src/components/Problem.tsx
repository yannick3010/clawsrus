import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

const painPoints = [
  "You sign up for a tool and stare at a blank chat window",
  "You spend hours writing the perfect prompt… and still get generic answers",
  "You try to set up an AI agent and hit a wall of config files and terminal commands",
  "You give up and go back to doing everything yourself",
];

export default function Problem() {
  return (
    <SectionWrapper alt>
      <SectionHeading>You&rsquo;ve got better things to do.</SectionHeading>
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <p className="mb-10 text-lg leading-relaxed text-earth">
            You&rsquo;ve heard about AI assistants. Maybe you&rsquo;ve even
            tried a few. But here&rsquo;s what actually happens:
          </p>
        </FadeIn>
        <div className="space-y-0">
          {painPoints.map((point, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div>
                {i > 0 && <hr className="border-warm-gray" />}
                <p className="py-5 text-lg text-charcoal">{point}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={450}>
          <p className="mt-10 text-lg leading-relaxed text-earth">
            Sound familiar? You&rsquo;re not alone. Most AI tools are built
            for developers, not for people who just want things handled.
          </p>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
