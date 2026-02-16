export const STRIPE_URLS = {
  starter: "https://buy.stripe.com/placeholder-starter",
  pro: "https://buy.stripe.com/placeholder-pro",
  agency: "https://buy.stripe.com/placeholder-agency",
} as const;

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For getting started with your AI assistant.",
    features: [
      "1 Personal Assistant persona",
      "Core skills included (messaging, research, reminders)",
      "Telegram integration",
      "Long-term memory",
      "Email support",
    ],
    cta: "Get Started",
    href: STRIPE_URLS.starter,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    description: "For people who want more from their assistant.",
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "2 skill packs included (choose any)",
      "Priority support",
      "Faster response times",
      "Early access to new features",
    ],
    cta: "Get Pro",
    href: STRIPE_URLS.pro,
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$199",
    period: "/mo",
    description: "For power users and small teams.",
    features: [
      "Everything in Pro",
      "Up to 3 personas",
      "Unlimited skill packs",
      "API access",
      "Dedicated support",
    ],
    cta: "Get Agency",
    href: STRIPE_URLS.agency,
    highlighted: false,
  },
] as const;

export const FAQ_DATA = [
  {
    question: "Do I need any technical skills to set up my assistant?",
    answer:
      "Nope. After checkout, you'll follow a simple guided walkthrough that takes about 10 minutes. If you can install an app on your phone, you can set this up.",
  },
  {
    question: "What is OpenClaw?",
    answer:
      "OpenClaw is the powerful open-source AI framework that runs under the hood. We handle all the technical stuff — you just chat with your assistant on Telegram.",
  },
  {
    question: "How is this different from ChatGPT or other AI tools?",
    answer:
      'Most AI tools give you a blank chat window and leave you to figure it out. Your ClawsRUs assistant comes pre-configured for a specific job, remembers your preferences across conversations, and gets better over time. It\'s the difference between hiring someone and Googling "how to do things."',
  },
  {
    question: "What can my assistant actually do?",
    answer:
      "Research, scheduling, reminders, travel planning, email drafting, shopping lists, event planning, and general Q&A — to start. You can add skill packs to expand its capabilities anytime.",
  },
  {
    question: "Does my assistant remember things between conversations?",
    answer:
      "Yes. Your assistant has long-term memory built in. It remembers your preferences, past requests, and context — so you never have to repeat yourself.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. No contracts, no cancellation fees. You can cancel your subscription anytime from your Stripe billing page.",
  },
  {
    question: "What messaging apps does it work with?",
    answer:
      "Right now, Telegram. We're adding Discord and Slack support soon.",
  },
  {
    question: "What if I need help?",
    answer:
      "Email us at hello@clawsrus.com. Starter members get email support. Pro and Agency members get priority support with faster response times.",
  },
] as const;

export const SKILL_PACKS = [
  {
    name: "Email Mastery",
    price: "$29",
    description: "Drafts, sorting, templates, and smart replies. Your inbox, handled.",
  },
  {
    name: "Calendar Pro",
    price: "$19",
    description:
      "Scheduling, conflict detection, meeting prep, and time zone juggling.",
  },
  {
    name: "Research Pro",
    price: "$49",
    description:
      "Deep research, multi-source synthesis, and competitive analysis.",
  },
  {
    name: "Content Writer",
    price: "$39",
    description:
      "Blog posts, social media, newsletters, and copywriting on demand.",
  },
  {
    name: "Shopping Assistant",
    price: "$19",
    description:
      "Product research, price tracking, and purchase recommendations.",
  },
] as const;
