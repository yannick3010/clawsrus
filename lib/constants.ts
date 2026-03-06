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
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    priceSuffix: "forever",
    description: "All free OpenClaw skills, installed on demand",
    features: [
      "Personal Assistant persona",
      "Telegram messaging",
      "Install any free skill",
      "Buy paid skills individually",
      "Guided self-serve setup",
    ],
    limits: { cpu: "1", memory: "1G" },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    priceLabel: "$79",
    priceSuffix: "per month",
    description: "All-inclusive access to free and paid skills",
    features: [
      "Personal Assistant persona",
      "Telegram messaging",
      "All paid skills included",
      "Priority support",
      "Faster provisioning queue",
    ],
    limits: { cpu: "2", memory: "2G" },
    popular: true,
  },
} as const;

export type TierId = keyof typeof TIERS;

export const STRIPE_PRICE_IDS: Record<TierId, string> = {
  free: "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};
