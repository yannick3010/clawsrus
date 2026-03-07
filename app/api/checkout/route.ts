import { NextRequest, NextResponse } from "next/server";
import { SETUP_PACKAGES, PERSONAS, STRIPE_SETUP_PACKAGE_PRICE_IDS } from "@/lib/constants";
import type { SetupPackageId, PersonaId } from "@/lib/constants";
import { nanoid } from "nanoid";
import { stripe } from "@/lib/stripe";

interface CheckoutBody {
  setup_package?: string;
  tier?: string;
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
    const { setup_package, tier, persona, name, email, role, helpTopics, communicationStyle, topPriority } =
      body;
    const setupPackageInput = (setup_package || tier || "").trim().toLowerCase();
    const selectedSetupPackage =
      setupPackageInput === "free" || setupPackageInput === "pro"
        ? "standard"
        : setupPackageInput;

    if (!SETUP_PACKAGES[selectedSetupPackage as SetupPackageId]) {
      return NextResponse.json({ error: "Invalid setup package" }, { status: 400 });
    }
    if (!PERSONAS[persona as PersonaId]) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const normalizedSetupPackage = selectedSetupPackage as SetupPackageId;
    const priceId = STRIPE_SETUP_PACKAGE_PRICE_IDS[normalizedSetupPackage];
    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured for this package" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const setupToken = nanoid(40);
    const normalizedHelpTopics = Array.isArray(helpTopics) ? helpTopics : [];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email.trim().toLowerCase(),
      metadata: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        persona,
        setup_package: normalizedSetupPackage,
        setup_token: setupToken,
        role: role || "",
        help_topics: JSON.stringify(normalizedHelpTopics),
        communication_style: communicationStyle || "",
        top_priority: topPriority || "",
        tier: "pro",
      },
      success_url: `${appUrl}/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup?setup_package=${normalizedSetupPackage}&persona=${persona}&cancelled=true`,
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
