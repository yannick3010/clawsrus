import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { createProxyToken } from "@/lib/proxy-token";
import { isDashboardOnboardingEnabled } from "@/lib/feature-flags";
import { supabase } from "@/lib/supabase";
import {
  isRuntimeUnavailableError,
  resolveGatewayTargetForUser,
} from "@/lib/docker-gateway-resolver";

export const runtime = "nodejs";

const CUSTOMER_BASE_DIR =
  process.env.CUSTOMER_BASE_DIR || "/opt/clawsrus/customers";

function isMissingGatewayTokenColumn(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = "code" in error ? String((error as { code?: unknown }).code || "") : "";
  const message =
    "message" in error ? String((error as { message?: unknown }).message || "") : "";
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.toLowerCase().includes("gateway_token")
  );
}

function normalizeGatewayToken(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const token = value.trim();
  if (!token) {
    return null;
  }

  const lowered = token.toLowerCase();
  if (lowered === "null" || lowered === "undefined") {
    return null;
  }

  return token;
}

async function readGatewayTokenFromRuntimeConfig(userId: string): Promise<string | null> {
  const configPath = path.join(
    CUSTOMER_BASE_DIR,
    userId,
    "openclaw",
    "openclaw.json"
  );

  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw) as {
      gateway?: { auth?: { token?: unknown } };
    };
    return normalizeGatewayToken(parsed.gateway?.auth?.token);
  } catch {
    return null;
  }
}

async function persistGatewayToken(userId: string, gatewayToken: string) {
  const { error } = await supabase
    .from("users")
    .update({ gateway_token: gatewayToken, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (!error || isMissingGatewayTokenColumn(error)) {
    return;
  }

  console.error("Failed to persist gateway token", {
    userId,
    error: error.message,
  });
}

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
    email: auth.appUser.email.toLowerCase(),
    containerName: auth.appUser.container_id,
    ttlSeconds: 10 * 60,
  });

  const host = req.headers.get("host") || "localhost:3000";
  const protoHeader = req.headers.get("x-forwarded-proto");
  const httpProto = protoHeader || (host.includes("localhost") ? "http" : "https");
  const wsProto = httpProto === "https" ? "wss" : "ws";
  const base = `${httpProto}://${host}`;
  let gatewayToken = normalizeGatewayToken(auth.appUser.gateway_token);

  if (!gatewayToken) {
    gatewayToken = await readGatewayTokenFromRuntimeConfig(auth.appUser.id);
    if (gatewayToken) {
      await persistGatewayToken(auth.appUser.id, gatewayToken);
    }
  }

  if (!gatewayToken) {
    return NextResponse.json(
      {
        error: "Assistant gateway token is not configured",
        reason: "gateway_token_missing",
      },
      { status: 409 }
    );
  }

  const wsUrl = `${wsProto}://${host}/agent-ws?proxy_token=${encodeURIComponent(
    token
  )}&token=${encodeURIComponent(gatewayToken)}`;
  const uiUrl = `${base}/agent-ui/openclaw/?embed=1&gatewayUrl=${encodeURIComponent(
    wsUrl
  )}&proxy_token=${encodeURIComponent(token)}&token=${encodeURIComponent(gatewayToken)}`;

  return NextResponse.json({
    proxy_token: token,
    ui_url: uiUrl,
    ws_url: wsUrl,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
}
