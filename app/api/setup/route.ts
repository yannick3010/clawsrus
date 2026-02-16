import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { session_id, telegram_bot_token, ai_provider, ai_api_key } =
      (await req.json()) as {
        session_id: string;
        telegram_bot_token: string;
        ai_provider: "openai" | "gemini";
        ai_api_key: string;
      };

    if (!session_id || !telegram_bot_token || !ai_provider || !ai_api_key) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["openai", "gemini"].includes(ai_provider)) {
      return NextResponse.json(
        { error: "Invalid AI provider" },
        { status: 400 }
      );
    }

    // Look up the Stripe session to find the user
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : null;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      );
    }

    // Find user in Supabase
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, status")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (findError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "awaiting_setup") {
      return NextResponse.json(
        { error: "Setup already completed" },
        { status: 400 }
      );
    }

    // Validate Telegram bot token
    let botUsername: string;
    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${telegram_bot_token}/getMe`
      );
      const tgData = await tgRes.json();
      if (!tgData.ok) {
        return NextResponse.json(
          { error: "Invalid Telegram bot token" },
          { status: 400 }
        );
      }
      botUsername = tgData.result.username;
    } catch {
      return NextResponse.json(
        { error: "Could not verify Telegram bot token" },
        { status: 400 }
      );
    }

    // Validate AI API key
    try {
      if (ai_provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${ai_api_key}` },
        });
        if (!res.ok) {
          return NextResponse.json(
            { error: "Invalid OpenAI API key" },
            { status: 400 }
          );
        }
      } else {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${ai_api_key}`
        );
        if (!res.ok) {
          return NextResponse.json(
            { error: "Invalid Gemini API key" },
            { status: 400 }
          );
        }
      }
    } catch {
      return NextResponse.json(
        { error: "Could not verify AI API key" },
        { status: 400 }
      );
    }

    // Update user with keys and set status to pending_provision
    const { error: updateError } = await supabase
      .from("users")
      .update({
        telegram_bot_token,
        telegram_bot_username: botUsername,
        ai_provider,
        ai_api_key,
        status: "pending_provision",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update user:", updateError);
      return NextResponse.json(
        { error: "Failed to save setup" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bot_username: botUsername,
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "Setup failed" },
      { status: 500 }
    );
  }
}
