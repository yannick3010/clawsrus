import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { createProxyToken } from "@/lib/proxy-token";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import {
  isRuntimeUnavailableError,
  resolveGatewayTargetForUser,
} from "@/lib/docker-gateway-resolver";

export const runtime = "nodejs";

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

  try {
    await resolveGatewayTargetForUser(auth.appUser.id, {
      expectedContainerName: auth.appUser.container_id || undefined,
      requireReachable: true,
    });
  } catch (error) {
    if (isRuntimeUnavailableError(error)) {
      return NextResponse.json(
        {
          error: "Assistant runtime unavailable",
          reason: error.reason,
        },
        { status: 409 }
      );
    }

    console.error("Failed to resolve assistant runtime", {
      userId: auth.appUser.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to verify assistant runtime" },
      { status: 500 }
    );
  }

  const token = createProxyToken({
    userId: auth.appUser.id,
    email: auth.authEmail,
    containerName: auth.appUser.container_id,
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
