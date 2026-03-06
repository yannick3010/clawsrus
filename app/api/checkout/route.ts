import { NextRequest, NextResponse } from "next/server";
import { TIERS, PERSONAS } from "@/lib/constants";
import type { TierId, PersonaId } from "@/lib/constants";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

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

function buildSetupToken() {
  return nanoid(40);
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const now = new Date().toISOString();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const setupToken = buildSetupToken();
    const userId = `user-${nanoid(12)}`;
    const normalizedTier = tier as TierId;
    const normalizedHelpTopics = Array.isArray(helpTopics) ? helpTopics : [];
    const normalizedTopPriorities = topPriority ? [topPriority] : [];

    const { error: userCreateError } = await supabase.from("users").insert({
      id: userId,
      email: email.trim().toLowerCase(),
      persona,
      tier: "pro",
      status: "awaiting_setup",
      preferred_name: name.trim(),
      timezone: "UTC",
      role: role || null,
      help_topics: normalizedHelpTopics,
      communication_style: communicationStyle || null,
      top_priorities: normalizedTopPriorities,
      setup_token: setupToken,
      setup_token_expires_at: null,
      created_at: now,
      updated_at: now,
    });

    if (userCreateError) {
      return NextResponse.json({ error: userCreateError.message }, { status: 500 });
    }

    const { error: trialError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_code: "pro",
      status: "trialing",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: now,
      current_period_end: trialEndsAt,
      cancel_at_period_end: true,
      created_at: now,
      updated_at: now,
    });

    if (trialError && trialError.code !== "42P01") {
      return NextResponse.json({ error: trialError.message }, { status: 500 });
    }

    const setupUrl = `${appUrl}/setup?setup_token=${encodeURIComponent(setupToken)}`;

    return NextResponse.json({
      setup_url: setupUrl,
      requires_payment: false,
      trial_ends_at: trialEndsAt,
      selected_tier: normalizedTier,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
