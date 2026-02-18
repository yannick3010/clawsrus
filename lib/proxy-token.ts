import crypto from "node:crypto";

export type ProxyTokenPayload = {
  user_id: string;
  email: string;
  container_name?: string;
  exp: number;
};

const DEFAULT_TTL_SECONDS = 5 * 60;

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSecret() {
  const secret =
    process.env.AGENT_PROXY_TOKEN_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Missing AGENT_PROXY_TOKEN_SECRET (or STRIPE_WEBHOOK_SECRET fallback)"
    );
  }
  return secret;
}

export function createProxyToken(payload: {
  userId: string;
  email: string;
  containerName?: string | null;
  ttlSeconds?: number;
}) {
  const exp = Math.floor(Date.now() / 1000) + (payload.ttlSeconds || DEFAULT_TTL_SECONDS);
  const body: ProxyTokenPayload = {
    user_id: payload.userId,
    email: payload.email,
    ...(payload.containerName ? { container_name: payload.containerName } : {}),
    exp,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyProxyToken(token: string): ProxyTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let payload: ProxyTokenPayload;
  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload)) as ProxyTokenPayload;
  } catch {
    return null;
  }

  if (!payload.user_id || !payload.email || !payload.exp) {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
