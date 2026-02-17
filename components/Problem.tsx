import { X } from "lucide-react";
import { FadeIn } from "./FadeIn";

const painPoints = [
  "You sign up for a tool and stare at a blank chat window",
  "You spend hours writing the perfect prompt\u2026 and still get generic answers",
  "You try to set up an AI agent and hit a wall of config files and terminal commands",
  "You give up and go back to doing everything yourself",
];

export default function Problem() {
  return (
    <section className="bg-navy-50 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <h2 className="font-display text-3xl tracking-tight text-navy-800 sm:text-4xl lg:text-5xl">
            You&rsquo;ve got better things to do.
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mt-6 text-lg leading-relaxed text-navy-500">
            You&rsquo;ve heard about AI assistants. Maybe you&rsquo;ve even
            tried a few. But here&rsquo;s what actually happens:
          </p>
        </FadeIn>

        <div className="mt-10 space-y-4">
          {painPoints.map((point, i) => (
            <FadeIn key={i} delay={200 + i * 100}>
              <div className="flex items-start gap-4 rounded-xl border border-navy-100 bg-white p-5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <X className="h-3.5 w-3.5 text-red-400" />
                </span>
                <p className="text-navy-600">{point}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={650}>
          <p className="mt-8 text-lg leading-relaxed text-navy-500">
            Sound familiar? You&rsquo;re not alone. Most AI tools are built for
            developers, not for people who just want things handled.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
