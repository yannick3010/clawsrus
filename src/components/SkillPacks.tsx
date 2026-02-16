import { SKILL_PACKS } from "@/lib/constants";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

export default function SkillPacks() {
  return (
    <SectionWrapper alt>
      <SectionHeading sub="Your assistant comes loaded with core skills out of the box. Want to go further? Add specialized skill packs to unlock new capabilities.">
        Make it even more capable.
      </SectionHeading>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="-mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:pb-0">
          {SKILL_PACKS.map((pack, i) => (
            <FadeIn key={pack.name} delay={i * 80}>
              <div className="min-w-[240px] rounded-2xl bg-white p-6 shadow-sm md:min-w-0">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-xl font-semibold text-espresso">
                    {pack.name}
                  </h3>
                  <span className="text-sm font-medium text-terracotta">
                    {pack.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-earth">
                  {pack.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <FadeIn delay={500}>
        <p className="mt-12 text-center text-sm uppercase tracking-wider text-stone">
          Skill packs are one-time purchases. Buy them whenever you&rsquo;re
          ready — no rush.
        </p>
      </FadeIn>
    </SectionWrapper>
  );
}
