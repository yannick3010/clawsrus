import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

export default function Hero() {
  return (
    <section className="flex min-h-[90vh] items-center bg-cream pt-20">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <FadeIn>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-espresso md:text-6xl lg:text-7xl">
            Your personal AI assistant that actually knows what to do.
          </h1>
        </FadeIn>
        <FadeIn delay={150}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-earth md:text-xl">
            No setup headaches. No prompt engineering. Just a ready-to-go
            assistant on Telegram that handles your life admin — so you can
            focus on what matters.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div className="mt-10">
            <Button href="#pricing">Get Started — From $29/mo</Button>
          </div>
          <p className="mt-4 text-sm text-stone">
            Set up in under 10 minutes. Cancel anytime.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
