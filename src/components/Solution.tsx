import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

export default function Solution() {
  return (
    <SectionWrapper>
      <SectionHeading>
        Meet your new assistant. It already knows the job.
      </SectionHeading>
      <div className="mx-auto max-w-3xl space-y-6">
        <FadeIn>
          <p className="text-lg leading-relaxed text-earth">
            ClawsRUs is a personal AI assistant that comes pre-configured and
            ready to work — right inside Telegram.
          </p>
        </FadeIn>
        <FadeIn delay={100}>
          <p className="text-lg leading-relaxed text-earth">
            No blank canvas. No technical setup. No learning curve.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="text-lg leading-relaxed text-earth">
            Your assistant arrives knowing how to help with scheduling,
            research, reminders, travel planning, shopping, and all the life
            admin that eats up your day. And it gets better the more you use
            it — learning your preferences, your routines, and your priorities
            over time.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <blockquote className="mt-12 border-l-4 border-terracotta py-2 pl-6">
            <p className="font-serif text-2xl italic leading-relaxed text-espresso md:text-3xl">
              Think of it less like a chatbot and more like a capable,
              always-available personal assistant who never drops the ball.
            </p>
          </blockquote>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
