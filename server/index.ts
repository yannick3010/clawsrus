import http from "node:http";
import { URL, parse as parseUrl } from "node:url";
import next from "next";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Socket } from "node:net";
import type { Duplex } from "node:stream";
import httpProxy from "http-proxy";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import {
  getGatewayHttpTargetForUser,
  getGatewayWsTargetForUser,
  verifyProxyToken,
} from "../lib/proxy-token";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true,
  secure: false,
});

proxy.on("error", (err, req, res) => {
  console.error("Gateway proxy error:", err);
  if (res && "writeHead" in res) {
    const serverRes = res as ServerResponse;
    if (!serverRes.headersSent) {
      serverRes.writeHead(502, { "Content-Type": "application/json" });
    }
    serverRes.end(JSON.stringify({ error: "Gateway unavailable" }));
  } else if (req && "socket" in req) {
    (req.socket as Socket).destroy();
  }
});

function stripPrefix(pathname: string, prefix: string) {
  if (pathname === prefix) {
    return "/";
  }
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length);
  }
  return pathname;
}

function setProxySessionCookie(res: ServerResponse, token: string, secure: boolean) {
  const cookie = serializeCookie("claws_proxy_session", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 10,
  });
  res.setHeader("Set-Cookie", cookie);
}

function resolveIdentityFromRequest(
  req: IncomingMessage,
  res?: ServerResponse
): { userId: string; email: string } | null {
  const origin = `http://${req.headers.host || "localhost"}`;
  const parsed = new URL(req.url || "/", origin);
  const queryToken = parsed.searchParams.get("proxy_token");
  const cookies = parseCookie(req.headers.cookie || "");
  const cookieToken = cookies.claws_proxy_session;

  const token = queryToken || cookieToken;
  if (!token) {
    return null;
  }

  const payload = verifyProxyToken(token);
  if (!payload) {
    return null;
  }

  if (queryToken && res) {
    const forwardedProto = String(req.headers["x-forwarded-proto"] || "");
    const secure = forwardedProto === "https" || (!dev && !forwardedProto);
    setProxySessionCookie(res, token, secure);
  }

  return { userId: payload.user_id, email: payload.email };
}

function requestProtocol(req: IncomingMessage) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (typeof forwardedProto === "string" && forwardedProto.length > 0) {
    return forwardedProto.split(",")[0]?.trim() || "https";
  }
  return dev ? "http" : "https";
}

function requestHost(req: IncomingMessage) {
  return String(req.headers.host || "localhost");
}

function removeProxyTokenFromUrl(rawUrl: string) {
  const parsed = new URL(rawUrl, "http://localhost");
  parsed.searchParams.delete("proxy_token");
  return `${parsed.pathname}${parsed.search}`;
}

function handleAgentUi(req: IncomingMessage, res: ServerResponse) {
  const identity = resolveIdentityFromRequest(req, res);
  if (!identity) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  const target = getGatewayHttpTargetForUser(identity.userId);
  const rawUrl = req.url || "/agent-ui";
  const parsed = new URL(rawUrl, "http://localhost");
  const strippedPath = stripPrefix(parsed.pathname, "/agent-ui");
  const normalized = `${strippedPath}${parsed.search}`;
  req.url = removeProxyTokenFromUrl(normalized);

  proxy.web(req, res, {
    target,
    headers: {
      "x-forwarded-user": identity.email,
      "x-forwarded-proto": requestProtocol(req),
      "x-forwarded-host": requestHost(req),
    },
  });
}

function handleAgentWs(req: IncomingMessage, socket: Duplex, head: Buffer) {
  const identity = resolveIdentityFromRequest(req);
  if (!identity) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const target = getGatewayWsTargetForUser(identity.userId);
  const parsed = new URL(req.url || "/agent-ws", "http://localhost");
  parsed.searchParams.delete("proxy_token");
  req.url = parsed.pathname + parsed.search;

  proxy.ws(req, socket, head, {
    target,
    headers: {
      "x-forwarded-user": identity.email,
      "x-forwarded-proto": requestProtocol(req),
      "x-forwarded-host": requestHost(req),
    },
  });
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const path = (req.url || "").split("?")[0];

    if (path.startsWith("/agent-ui")) {
      handleAgentUi(req, res);
      return;
    }

    const parsed = parseUrl(req.url || "/", true);
    handle(req, res, parsed);
  });

  server.on("upgrade", (req, socket, head) => {
    const path = (req.url || "").split("?")[0];
    if (path.startsWith("/agent-ws")) {
      handleAgentWs(req, socket, head);
      return;
    }
    socket.destroy();
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
