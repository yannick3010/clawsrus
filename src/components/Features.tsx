import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

const categories = [
  {
    title: "Everyday life admin",
    items: [
      "Appointment booking and scheduling",
      "Reminders and follow-ups that actually stick",
      "Bill tracking and deadline management",
    ],
  },
  {
    title: "Research and planning",
    items: [
      "Travel planning with real options, not generic lists",
      "Product comparisons and purchase decisions",
      "Quick research on anything — restaurants, services, how-tos",
    ],
  },
  {
    title: "Communication",
    items: [
      "Email drafts that sound like you",
      "Message templates for common situations",
      "Meeting prep and follow-up notes",
    ],
  },
  {
    title: "Organization",
    items: [
      "Grocery and shopping lists",
      "Event planning and coordination",
      "To-do management that adapts to your style",
    ],
  },
];

export default function Features() {
  return (
    <SectionWrapper id="features">
      <SectionHeading>
        Everything your assistant can do for you.
      </SectionHeading>
      <div className="grid gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-14">
        {categories.map((cat, i) => (
          <FadeIn key={cat.title} delay={i * 100}>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-espresso">
                {cat.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-earth">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={450}>
        <div className="mt-16 border-l-4 border-terracotta bg-cream-dark p-8 md:p-10">
          <h3 className="font-serif text-xl font-semibold text-espresso">
            Your assistant remembers.
          </h3>
          <p className="mt-3 leading-relaxed text-earth">
            Unlike one-off AI chats, your ClawsRUs assistant builds context
            over time. It learns your preferences, remembers past
            conversations, and gets more helpful the longer you use it.
          </p>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
