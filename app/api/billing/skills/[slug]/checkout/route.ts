import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { stripe } from "@/lib/stripe";
import { buildSkillStateForUser } from "@/lib/skills-entitlements";
import { resolveSkillStripePriceId } from "@/lib/skills-marketplace";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(_req: Request, ctx: Params) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const state = await buildSkillStateForUser({
    userId: auth.appUser.id,
    tier: auth.appUser.tier,
  });

  const entry = state.state.find((item) => item.skill.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  if (!entry.skill.is_paid) {
    return NextResponse.json({ error: "This skill is free and does not require checkout" }, { status: 400 });
  }

  if (entry.entitlement.has_access) {
    return NextResponse.json({ error: "Skill already unlocked for this user" }, { status: 400 });
  }

  const stripePriceId = resolveSkillStripePriceId(entry.skill);
  if (!stripePriceId) {
    return NextResponse.json(
      { error: "Skill is missing stripe price configuration" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    customer_email: auth.appUser.email,
    metadata: {
      kind: "skill_purchase",
      user_id: auth.appUser.id,
      skill_slug: entry.skill.slug,
    },
    success_url: `${appUrl}/dashboard?skill_purchase=${encodeURIComponent(entry.skill.slug)}`,
    cancel_url: `${appUrl}/dashboard?skill_purchase_cancelled=${encodeURIComponent(entry.skill.slug)}`,
  });

  return NextResponse.json({ url: session.url });
}
