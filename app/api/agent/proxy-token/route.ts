import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { createProxyToken } from "@/lib/proxy-token";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";

export async function GET(req: NextRequest) {
  if (!isDashboardOnboardingEnabled()) {
    return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  }

  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.appUser.status !== "active") {
    return NextResponse.json(
      { error: "Assistant is not active yet" },
      { status: 409 }
    );
  }

  const token = createProxyToken({
    userId: auth.appUser.id,
    email: auth.authEmail,
    ttlSeconds: 10 * 60,
  });

  const host = req.headers.get("host") || "localhost:3000";
  const protoHeader = req.headers.get("x-forwarded-proto");
  const httpProto = protoHeader || (host.includes("localhost") ? "http" : "https");
  const wsProto = httpProto === "https" ? "wss" : "ws";
  const base = `${httpProto}://${host}`;

  const wsUrl = `${wsProto}://${host}/agent-ws?proxy_token=${encodeURIComponent(token)}`;
  const uiUrl = `${base}/agent-ui/openclaw/?embed=1&gatewayUrl=${encodeURIComponent(
    wsUrl
  )}&proxy_token=${encodeURIComponent(token)}`;

  return NextResponse.json({
    proxy_token: token,
    ui_url: uiUrl,
    ws_url: wsUrl,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
}
