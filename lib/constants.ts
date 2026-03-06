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

export const SETUP_PACKAGES = {
  standard: {
    id: "standard",
    name: "Standard",
    price: 199,
    priceLabel: "$199",
    priceSuffix: "one-time setup",
    description: "Self-serve setup with all core skills",
    features: [
      "Personal Assistant persona",
      "All free skills available",
      "Buy paid skills individually",
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
    description: "White-glove onboarding and done-with-you setup",
    features: [
      "Personal Assistant persona",
      "Everything in Standard",
      "1-on-1 onboarding call",
      "Custom persona tuning",
      "Priority support",
    ],
    limits: { cpu: "2", memory: "2G" },
    popular: true,
  },
} as const;

export type SetupPackageId = keyof typeof SETUP_PACKAGES;

export const MEMBERSHIP_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    priceSuffix: "forever",
    description: "Includes all free skills. Paid skills can be purchased individually.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    priceLabel: "$79",
    priceSuffix: "per month",
    description: "All-inclusive access to all free and paid skills.",
  },
} as const;

export type MembershipPlanCode = keyof typeof MEMBERSHIP_PLANS;

export const STRIPE_SETUP_PACKAGE_PRICE_IDS: Record<SetupPackageId, string> = {
  standard: process.env.STRIPE_PRICE_STANDARD || "",
  concierge: process.env.STRIPE_PRICE_CONCIERGE || "",
};

export const STRIPE_MEMBERSHIP_PRICE_IDS: Record<MembershipPlanCode, string> = {
  free: "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};
