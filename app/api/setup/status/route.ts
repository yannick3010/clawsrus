import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import { isMissingCheckoutSession } from "@/lib/stripe-errors";
import { resolveSetupToken } from "@/lib/resolve-setup-token";

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
    const resolvedToken = await resolveSetupToken({
      setup_token: setupToken || undefined,
      session_id: sessionId || undefined,
    });
    if (!resolvedToken) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await supabase
      .from("users")
      .select("status")
      .eq("setup_token", resolvedToken)
      .maybeSingle();
    const user = result.data as { status: string } | null;
    const error = result.error ? { message: result.error.message } : null;

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
