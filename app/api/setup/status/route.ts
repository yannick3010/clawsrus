import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import { isMissingCheckoutSession } from "@/lib/stripe-errors";

export async function GET(req: NextRequest) {
  if (!isDashboardOnboardingEnabled()) {
    return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  }

  const setupToken = req.nextUrl.searchParams.get("setup_token");
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!setupToken && !sessionId) {
    return NextResponse.json(
      { error: "setup_token (or legacy session_id) is required" },
      { status: 400 }
    );
  }

  try {
    let user:
      | {
          status: string;
        }
      | null = null;
    let error: { message: string } | null = null;

    if (setupToken) {
      const result = await supabase
        .from("users")
        .select("status")
        .eq("setup_token", setupToken)
        .maybeSingle();
      user = result.data as { status: string } | null;
      error = result.error ? { message: result.error.message } : null;
    } else if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;
      if (!paymentIntentId) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }

      const result = await supabase
        .from("users")
        .select("status")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      user = result.data as { status: string } | null;
      error = result.error ? { message: result.error.message } : null;
    }

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ status: user.status });
  } catch (err) {
    if (isMissingCheckoutSession(err)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    console.error("Setup status error:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
