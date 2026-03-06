import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { ensureDefaultChannels } from "@/lib/channel-utils";
import { sendDashboardMagicLinkEmail } from "@/lib/email";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import { isMissingCheckoutSession } from "@/lib/stripe-errors";

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const perPage = 200;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (found?.id) {
      return found.id;
    }

    if (data.users.length < perPage) {
      break;
    }
  }

  return null;
}

async function getOrCreateAuthUserId(email: string, existingUserId?: string | null) {
  if (existingUserId) {
    const { data } = await supabase.auth.admin.getUserById(existingUserId);
    if (data.user?.id) {
      return data.user.id;
    }
  }

  const created = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (created.data.user?.id) {
    return created.data.user.id;
  }

  if (
    created.error &&
    /already|exists|registered/i.test(created.error.message)
  ) {
    const userId = await findAuthUserIdByEmail(email);
    if (userId) {
      return userId;
    }
  }

  if (created.error) {
    throw created.error;
  }

  throw new Error("Could not create auth user");
}

export async function POST(req: NextRequest) {
  if (!isDashboardOnboardingEnabled()) {
    return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  }

  try {
    const { session_id, setup_token } = (await req.json()) as {
      session_id?: string;
      setup_token?: string;
    };

    if (!session_id && !setup_token) {
      return NextResponse.json(
        { error: "setup_token (or legacy session_id) is required" },
        { status: 400 }
      );
    }

    let user:
      | {
          id: string;
          email: string;
          status: string;
          auth_user_id?: string | null;
        }
      | null = null;
    let userError: { message: string } | null = null;

    if (setup_token) {
      const result = await supabase
        .from("users")
        .select("id,email,status,auth_user_id")
        .eq("setup_token", setup_token)
        .maybeSingle();
      user = result.data as {
        id: string;
        email: string;
        status: string;
        auth_user_id?: string | null;
      } | null;
      userError = result.error ? { message: result.error.message } : null;
    } else if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;
      if (!paymentIntentId) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }

      const result = await supabase
        .from("users")
        .select("id,email,status,auth_user_id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      user = result.data as {
        id: string;
        email: string;
        status: string;
        auth_user_id?: string | null;
      } | null;
      userError = result.error ? { message: result.error.message } : null;
    }

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { error: "User is not active yet" },
        { status: 409 }
      );
    }

    const authUserId = await getOrCreateAuthUserId(user.email, user.auth_user_id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const callbackUrl = process.env.SUPABASE_AUTH_REDIRECT_URL || `${appUrl}/auth/callback`;
    const redirectTo = `${callbackUrl}?next=/dashboard`;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
      options: {
        redirectTo,
      },
    });

    if (linkError || !linkData.properties?.action_link) {
      console.error("Failed to generate magic link:", linkError);
      return NextResponse.json(
        { error: "Could not generate login link" },
        { status: 500 }
      );
    }

    await supabase
      .from("users")
      .update({
        auth_user_id: authUserId,
        dashboard_ready_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await ensureDefaultChannels(user.id);

    try {
      await sendDashboardMagicLinkEmail({
        to: user.email,
        actionLink: linkData.properties.action_link,
      });
    } catch (mailError) {
      console.error("Failed sending dashboard magic link email:", mailError);
    }

    return NextResponse.json({ redirect_url: linkData.properties.action_link });
  } catch (err) {
    if (isMissingCheckoutSession(err)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    console.error("Auth bootstrap error:", err);
    return NextResponse.json(
      { error: "Failed to bootstrap authentication" },
      { status: 500 }
    );
  }
}
