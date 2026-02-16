import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { tier, persona } = session.metadata || {};
      const email = session.customer_details?.email;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (!email || !tier || !persona) {
        console.error("Missing session data:", { email, tier, persona });
        break;
      }

      // Idempotent: check if user already exists for this subscription
      if (subscriptionId) {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (existing) {
          console.log("User already exists for subscription:", subscriptionId);
          break;
        }
      }

      const userId = `user-${nanoid(12)}`;
      const { error } = await supabase.from("users").insert({
        id: userId,
        email,
        persona,
        tier,
        status: "awaiting_setup",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      });

      if (error) {
        console.error("Failed to create user:", error);
      } else {
        console.log("Created user:", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await supabase
        .from("users")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Failed to cancel user:", error);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
