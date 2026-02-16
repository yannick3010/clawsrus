export const PERSONAS = {
  "chief-of-staff": {
    id: "chief-of-staff",
    name: "Chief of Staff",
    tagline: "Your strategic right hand",
    description:
      "Manages priorities, prepares briefings, drafts communications, and keeps everything on track. Like having a seasoned executive assistant who thinks three steps ahead.",
    icon: "Shield",
    color: "blue",
  },
  "sales-expert": {
    id: "sales-expert",
    name: "Sales Expert",
    tagline: "Close more deals, faster",
    description:
      "Crafts outreach sequences, handles objections, tracks follow-ups, and coaches you on technique. Like having a top-performing sales rep in your pocket.",
    icon: "TrendingUp",
    color: "green",
  },
  "personal-assistant": {
    id: "personal-assistant",
    name: "Personal Assistant",
    tagline: "Your everyday AI sidekick",
    description:
      "Manages reminders, researches anything, drafts messages, and keeps your life organized. Like having a reliable assistant who never forgets.",
    icon: "User",
    color: "purple",
  },
} as const;

export type PersonaId = keyof typeof PERSONAS;

export const TIERS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    priceLabel: "$29/mo",
    description: "Perfect for getting started",
    features: [
      "1 AI persona",
      "Telegram messaging",
      "Core skills included",
      "Email support",
    ],
    limits: { cpu: "0.5", memory: "512M" },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    priceLabel: "$79/mo",
    description: "For power users",
    features: [
      "1 AI persona",
      "Telegram messaging",
      "All skills unlocked",
      "Priority support",
      "Custom instructions",
    ],
    limits: { cpu: "1", memory: "1G" },
    popular: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 199,
    priceLabel: "$199/mo",
    description: "For teams and agencies",
    features: [
      "1 AI persona (more on request)",
      "Telegram messaging",
      "All skills unlocked",
      "Dedicated support",
      "Custom instructions",
      "Higher rate limits",
    ],
    limits: { cpu: "2", memory: "2G" },
  },
} as const;

export type TierId = keyof typeof TIERS;

export const STRIPE_PRICE_IDS: Record<TierId, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
  agency: process.env.STRIPE_PRICE_AGENCY || "",
};
