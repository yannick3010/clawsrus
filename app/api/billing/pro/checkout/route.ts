import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionSnapshot } from "@/lib/skills-marketplace";

const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || "";

export async function POST() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!STRIPE_PRICE_PRO) {
    return NextResponse.json({ error: "STRIPE_PRICE_PRO is not configured" }, { status: 500 });
  }

  const subscription = await getUserSubscriptionSnapshot(auth.appUser.id);
  const status = subscription?.status ?? null;
  if (status === "active") {
    return NextResponse.json({ error: "User already has an active Pro subscription" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_PRO, quantity: 1 }],
    customer_email: auth.appUser.email,
    metadata: {
      kind: "pro_subscription",
      user_id: auth.appUser.id,
    },
    success_url: `${appUrl}/dashboard?upgraded=pro`,
    cancel_url: `${appUrl}/dashboard?upgrade=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
