export const PERSONAS = {
  "personal-assistant": {
    id: "personal-assistant",
    name: "Personal Assistant",
    tagline: "Your everyday AI sidekick",
    description:
      "Manages reminders, researches anything, drafts messages, and keeps your life organized. Like having a reliable assistant who never forgets.",
    icon: "User",
    color: "purple",
    comingSoon: false,
  },
  "chief-of-staff": {
    id: "chief-of-staff",
    name: "Chief of Staff",
    tagline: "Your strategic right hand",
    description:
      "Manages priorities, prepares briefings, drafts communications, and keeps everything on track. Like having a seasoned executive assistant who thinks three steps ahead.",
    icon: "Shield",
    color: "blue",
    comingSoon: true,
  },
  "sales-expert": {
    id: "sales-expert",
    name: "Sales Expert",
    tagline: "Close more deals, faster",
    description:
      "Crafts outreach sequences, handles objections, tracks follow-ups, and coaches you on technique. Like having a top-performing sales rep in your pocket.",
    icon: "TrendingUp",
    color: "green",
    comingSoon: true,
  },
} as const;

export type PersonaId = keyof typeof PERSONAS;

export const TIERS = {
  standard: {
    id: "standard",
    name: "Standard",
    price: 199,
    priceLabel: "$199",
    priceSuffix: "one-time setup",
    description: "Everything you need to get started",
    features: [
      "Personal Assistant persona",
      "Built-in chat dashboard",
      "All skills included",
      "Guided self-serve setup",
      "Email support",
    ],
    limits: { cpu: "1", memory: "1G" },
  },
  concierge: {
    id: "concierge",
    name: "Concierge",
    price: 599,
    priceLabel: "$599",
    priceSuffix: "one-time setup",
    description: "White-glove setup with hands-on help",
    features: [
      "Personal Assistant persona",
      "Built-in chat dashboard",
      "All skills included",
      "We set everything up for you",
      "1-on-1 onboarding call",
      "Custom persona tuning",
      "Priority support",
    ],
    limits: { cpu: "2", memory: "2G" },
    popular: true,
  },
} as const;

export type TierId = keyof typeof TIERS;

export const STRIPE_PRICE_IDS: Record<TierId, string> = {
  standard: process.env.STRIPE_PRICE_STANDARD || "",
  concierge: process.env.STRIPE_PRICE_CONCIERGE || "",
};
