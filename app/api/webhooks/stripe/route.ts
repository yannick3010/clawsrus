import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { ensureDefaultChannels } from "@/lib/channel-utils";
import { normalizePlanCode } from "@/lib/plans";

function toIso(seconds: number | null | undefined) {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  return "canceled";
}

async function upsertSubscriptionFromStripe(params: {
  userId: string;
  subscription: Stripe.Subscription;
  customerId: string | null;
}) {
  const normalizedStatus = normalizeSubscriptionStatus(params.subscription.status);
  const priceId = params.subscription.items.data[0]?.price?.id || null;
  const now = new Date().toISOString();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      plan_code: "pro",
      status: normalizedStatus,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscription.id,
      stripe_price_id: priceId,
      current_period_start: toIso(params.subscription.current_period_start),
      current_period_end: toIso(params.subscription.current_period_end),
      cancel_at_period_end: params.subscription.cancel_at_period_end,
      updated_at: now,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error && error.code !== "42P01") {
    throw error;
  }

  const tier = normalizedStatus === "active" || normalizedStatus === "trialing" ? "pro" : "free";
  await supabase
    .from("users")
    .update({
      tier,
      stripe_subscription_id: params.subscription.id,
      stripe_customer_id: params.customerId,
      updated_at: now,
    })
    .eq("id", params.userId);
}

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
      const metadata = session.metadata || {};
      const kind = metadata.kind || "";
      const userIdFromMetadata = metadata.user_id || "";
      const tierFromMetadata = normalizePlanCode(metadata.tier || "");
      const personaFromMetadata = metadata.persona || "";
      const email = session.customer_details?.email?.toLowerCase() || null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (kind === "skill_purchase") {
        const skillSlug = metadata.skill_slug || "";
        if (!userIdFromMetadata || !skillSlug) {
          console.error("Missing skill purchase metadata", { userIdFromMetadata, skillSlug });
          break;
        }

        const amount = typeof session.amount_total === "number" ? session.amount_total : 0;
        const { error } = await supabase.from("user_skill_purchases").upsert(
          {
            user_id: userIdFromMetadata,
            skill_slug: skillSlug,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            amount_cents: amount,
            purchased_at: new Date().toISOString(),
          },
          { onConflict: "user_id,skill_slug" }
        );
        if (error && error.code !== "42P01") {
          console.error("Failed recording skill purchase:", error);
        }
        break;
      }

      if (kind === "pro_subscription") {
        if (!userIdFromMetadata || !subscriptionId) {
          console.error("Missing subscription metadata", {
            userIdFromMetadata,
            subscriptionId,
          });
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        try {
          await upsertSubscriptionFromStripe({
            userId: userIdFromMetadata,
            subscription,
            customerId,
          });
        } catch (error) {
          console.error("Failed upserting subscription from checkout:", error);
        }
        break;
      }

      const tier = tierFromMetadata;
      const persona = personaFromMetadata;

      if (!email || !tier || !persona) {
        console.error("Missing session data:", { email, tier, persona });
        break;
      }

      if (paymentIntentId) {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();

        if (existing) {
          console.log("User already exists for payment:", paymentIntentId);
          break;
        }
      }

      let helpTopics: string[] = [];
      try {
        helpTopics = JSON.parse((session.metadata || {}).help_topics || "[]");
      } catch {
        helpTopics = [];
      }

      const userId = `user-${nanoid(12)}`;
      const { error } = await supabase.from("users").insert({
        id: userId,
        email,
        persona,
        tier: normalizePlanCode(tier),
        status: "awaiting_setup",
        stripe_customer_id: customerId,
        stripe_payment_intent_id: paymentIntentId,
        setup_token: (session.metadata || {}).setup_token || null,
        preferred_name: (session.metadata || {}).name || null,
        timezone: "UTC",
        role: (session.metadata || {}).role || null,
        help_topics: helpTopics,
        communication_style: (session.metadata || {}).communication_style || null,
        top_priorities: (session.metadata || {}).top_priority
          ? [(session.metadata || {}).top_priority]
          : [],
      });

      if (error) {
        console.error("Failed to create user:", error);
      } else {
        try {
          await ensureDefaultChannels(userId);
        } catch (channelError) {
          console.error("Failed seeding default channels:", channelError);
        }
        console.log("Created user:", userId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;

      if (!customerId) {
        break;
      }

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .or(
          `stripe_subscription_id.eq.${subscription.id},stripe_customer_id.eq.${customerId}`
        )
        .limit(1)
        .maybeSingle();

      if (!user?.id) {
        break;
      }

      try {
        await upsertSubscriptionFromStripe({
          userId: user.id,
          subscription,
          customerId,
        });
      } catch (error) {
        console.error("Failed syncing subscription update:", error);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
