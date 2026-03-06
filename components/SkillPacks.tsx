import { Mail, Calendar, Search, PenTool, ShoppingCart } from "lucide-react";
import { FadeIn } from "./FadeIn";

const skillPacks = [
  {
    icon: Mail,
    name: "Email Mastery",
    price: "$29",
    description:
      "Drafts, sorting, templates, and smart replies. Your inbox, handled.",
  },
  {
    icon: Calendar,
    name: "Calendar Pro",
    price: "$19",
    description:
      "Scheduling, conflict detection, meeting prep, and time zone juggling.",
  },
  {
    icon: Search,
    name: "Research Pro",
    price: "$49",
    description:
      "Deep research, multi-source synthesis, and competitive analysis.",
  },
  {
    icon: PenTool,
    name: "Content Writer",
    price: "$39",
    description:
      "Blog posts, social media, newsletters, and copywriting on demand.",
  },
  {
    icon: ShoppingCart,
    name: "Shopping Assistant",
    price: "$19",
    description:
      "Product research, price tracking, and purchase recommendations.",
  },
];

export default function SkillPacks() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Make it even more capable.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              Core skills are included. Add specialized packs when you need
              more.
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-ink-300">ClawsRUs skill packs are add-on capabilities for your AI assistant — install them with one click to expand what your assistant can do.</p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillPacks.map((pack, i) => (
            <FadeIn key={pack.name} delay={i * 100}>
              <div className="group rounded-2xl border border-ink-100 p-6 transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50 transition-colors group-hover:bg-brand-50">
                    <pack.icon className="h-5 w-5 text-ink-400 transition-colors group-hover:text-brand-500" />
                  </div>
                  <span className="text-sm font-semibold text-brand-500">
                    {pack.price}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-ink-800">
                  {pack.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">
                  {pack.description}
                </p>
              </div>
            </FadeIn>
          ))}
          <FadeIn delay={skillPacks.length * 100}>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50">
                <span className="text-lg text-ink-300">+</span>
              </div>
              <h3 className="mt-4 font-semibold text-ink-800">
                More coming soon
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                We&rsquo;re constantly building new skill packs. Have a request?
                Let us know.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={700}>
          <p className="mt-12 text-center text-sm text-ink-300">
            Skill packs are one-time purchases — no subscriptions, no
            pressure.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
