import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { STRIPE_PRICE_IDS, TIERS, PERSONAS } from "@/lib/constants";
import type { TierId, PersonaId } from "@/lib/constants";

interface CheckoutBody {
  tier: string;
  persona: string;
  name?: string;
  email?: string;
  role?: string | null;
  helpTopics?: string[];
  communicationStyle?: string;
  topPriority?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { tier, persona, name, email, role, helpTopics, communicationStyle, topPriority } = body;

    if (!TIERS[tier as TierId]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!PERSONAS[persona as PersonaId]) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[tier as TierId];
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: {
        tier,
        persona,
        name,
        role: role || "",
        help_topics: JSON.stringify(helpTopics || []),
        communication_style: communicationStyle || "",
        top_priority: topPriority || "",
      },
      success_url: `${appUrl}/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
