import { Calendar, Search, Mail, ListTodo } from "lucide-react";
import { FadeIn } from "./FadeIn";

const categories = [
  {
    icon: Calendar,
    title: "Everyday life admin",
    items: [
      "Appointment booking and scheduling",
      "Reminders and follow-ups that actually stick",
      "Bill tracking and deadline management",
    ],
  },
  {
    icon: Search,
    title: "Research and planning",
    items: [
      "Travel planning with real options, not generic lists",
      "Product comparisons and purchase decisions",
      "Quick research on anything — restaurants, services, how-tos",
    ],
  },
  {
    icon: Mail,
    title: "Communication",
    items: [
      "Email drafts that sound like you",
      "Message templates for common situations",
      "Meeting prep and follow-up notes",
    ],
  },
  {
    icon: ListTodo,
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
    <section id="features" className="bg-ink-50 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
              Everything your assistant can do for you.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-400">
              Built for busy professionals, entrepreneurs, and anyone who wants
              AI help without the technical setup.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <FadeIn key={cat.title} delay={i * 100}>
              <div className="rounded-2xl border border-ink-100 bg-white p-8 transition-all hover:shadow-lg hover:shadow-ink-100/50">
                <cat.icon className="h-6 w-6 text-brand-500" />
                <h3 className="mt-4 text-lg font-semibold text-ink-800">
                  {cat.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-ink-500"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-brand-50 to-blue-50 p-8 sm:p-10">
            <h4 className="font-display text-xl text-ink-800">
              Your assistant remembers.
            </h4>
            <p className="mt-3 leading-relaxed text-ink-500">
              Unlike one-off AI chats, your assistant remembers past
              conversations and learns your preferences — so you never have to
              repeat yourself.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
