import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ensureDefaultChannels } from "@/lib/channel-utils";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import { isMissingCheckoutSession } from "@/lib/stripe-errors";
import { resolveSetupToken } from "@/lib/resolve-setup-token";

const MUTABLE_STATUSES = new Set(["awaiting_setup", "provision_failed"]);
const ACCEPTED_STATUSES = new Set([
  "pending_provision",
  "provisioning",
  "active",
]);

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

    const resolved = await resolveSetupToken({ setup_token, session_id });
    if (!resolved) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { setup_token: resolvedToken, payment_confirmed } = resolved;

    const result = await supabase
      .from("users")
      .select("id,status,tier")
      .eq("setup_token", resolvedToken)
      .maybeSingle();
    const user = result.data as { id: string; status: string; tier: string } | null;
    const findError = result.error ? { message: result.error.message } : null;

    if (findError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((user.tier || "free") === "pro" && !payment_confirmed) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const subStatus = typeof subscription?.status === "string" ? subscription.status : "";
      if (!["active", "trialing", "past_due"].includes(subStatus)) {
        return NextResponse.json(
          { error: "Pro payment is not confirmed yet", reason: "payment_pending" },
          { status: 409 }
        );
      }
    }

    if (MUTABLE_STATUSES.has(user.status)) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          status: "pending_provision",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update setup status:", updateError);
        return NextResponse.json(
          { error: "Failed to save setup" },
          { status: 500 }
        );
      }
    } else if (!ACCEPTED_STATUSES.has(user.status)) {
      return NextResponse.json(
        { error: `Unexpected user status: ${user.status}` },
        { status: 400 }
      );
    }

    await ensureDefaultChannels(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (isMissingCheckoutSession(err)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    console.error("Setup error:", err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
