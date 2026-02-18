import http from "node:http";
import net from "node:net";

export type RuntimeUnavailableReason =
  | "container_missing"
  | "container_not_running"
  | "container_unreachable";

export class RuntimeUnavailableError extends Error {
  reason: RuntimeUnavailableReason;
  userId: string;
  containerName: string;

  constructor(
    message: string,
    details: {
      reason: RuntimeUnavailableReason;
      userId: string;
      containerName: string;
    }
  ) {
    super(message);
    this.name = "RuntimeUnavailableError";
    this.reason = details.reason;
    this.userId = details.userId;
    this.containerName = details.containerName;
  }
}

export type GatewayTarget = {
  userId: string;
  containerName: string;
  ip: string;
  port: number;
  httpTarget: string;
  wsTarget: string;
};

type ResolveGatewayOptions = {
  expectedContainerName?: string;
  requireReachable?: boolean;
  ttlMs?: number;
  port?: number;
  networkName?: string;
};

type DockerInspectResponse = {
  State?: {
    Running?: boolean;
  };
  NetworkSettings?: {
    Networks?: Record<string, { IPAddress?: string }>;
  };
};

type CacheEntry = {
  expiresAt: number;
  value?: GatewayTarget;
  error?: RuntimeUnavailableError;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<GatewayTarget>>();

const DOCKER_SOCKET_PATH = process.env.DOCKER_SOCKET_PATH || "/var/run/docker.sock";
const DEFAULT_NETWORK_NAME = process.env.OPENCLAW_DOCKER_NETWORK || "clawsrus-network";
const DEFAULT_GATEWAY_PORT = Number.parseInt(
  process.env.OPENCLAW_GATEWAY_PORT || "18789",
  10
);
const DEFAULT_CACHE_TTL_MS = Number.parseInt(
  process.env.OPENCLAW_RESOLVER_CACHE_TTL_MS || "5000",
  10
);

function buildContainerName(userId: string) {
  return `clawsrus-${userId}`;
}

function buildCacheKey(
  containerName: string,
  requireReachable: boolean,
  port: number,
  networkName: string
) {
  return `${containerName}|${requireReachable ? 1 : 0}|${port}|${networkName}`;
}

function cloneRuntimeError(error: RuntimeUnavailableError) {
  return new RuntimeUnavailableError(error.message, {
    reason: error.reason,
    userId: error.userId,
    containerName: error.containerName,
  });
}

function readCache(cacheKey: string) {
  const existing = cache.get(cacheKey);
  if (!existing) {
    return null;
  }

  if (existing.expiresAt <= Date.now()) {
    cache.delete(cacheKey);
    return null;
  }

  if (existing.error) {
    throw cloneRuntimeError(existing.error);
  }

  return existing.value || null;
}

function writeCache(cacheKey: string, ttlMs: number, entry: Omit<CacheEntry, "expiresAt">) {
  cache.set(cacheKey, {
    ...entry,
    expiresAt: Date.now() + Math.max(ttlMs, 500),
  });
}

async function inspectContainer(containerName: string): Promise<DockerInspectResponse | null> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath: DOCKER_SOCKET_PATH,
        path: `/containers/${encodeURIComponent(containerName)}/json`,
        method: "GET",
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode === 404) {
            resolve(null);
            return;
          }

          if (!res.statusCode || res.statusCode >= 400) {
            reject(
              new Error(
                `Docker inspect failed (${res.statusCode || "unknown"}): ${body.slice(
                  0,
                  250
                )}`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(body) as DockerInspectResponse);
          } catch {
            reject(new Error("Docker inspect returned invalid JSON"));
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function extractContainerIp(
  inspect: DockerInspectResponse,
  preferredNetworkName: string
): string | null {
  const networks = inspect.NetworkSettings?.Networks || {};

  const preferred = networks[preferredNetworkName]?.IPAddress?.trim();
  if (preferred) {
    return preferred;
  }

  for (const details of Object.values(networks)) {
    const ip = details.IPAddress?.trim();
    if (ip) {
      return ip;
    }
  }

  return null;
}

async function isPortReachable(ip: string, port: number, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finalize = (value: boolean) => {
      if (done) {
        return;
      }
      done = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
    socket.connect(port, ip);
  });
}

export async function resolveGatewayTargetForUser(
  userId: string,
  options: ResolveGatewayOptions = {}
): Promise<GatewayTarget> {
  const containerName = options.expectedContainerName || buildContainerName(userId);
  const requireReachable = options.requireReachable ?? false;
  const ttlMs = options.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const port = options.port ?? DEFAULT_GATEWAY_PORT;
  const networkName = options.networkName || DEFAULT_NETWORK_NAME;
  const cacheKey = buildCacheKey(containerName, requireReachable, port, networkName);

  const cached = readCache(cacheKey);
  if (cached) {
    return cached;
  }

  const existingInflight = inflight.get(cacheKey);
  if (existingInflight) {
    return existingInflight;
  }

  const work = (async () => {
    const inspect = await inspectContainer(containerName);
    if (!inspect) {
      throw new RuntimeUnavailableError("Assistant container was not found", {
        reason: "container_missing",
        userId,
        containerName,
      });
    }

    if (!inspect.State?.Running) {
      throw new RuntimeUnavailableError("Assistant container is not running", {
        reason: "container_not_running",
        userId,
        containerName,
      });
    }

    const ip = extractContainerIp(inspect, networkName);
    if (!ip) {
      throw new RuntimeUnavailableError("Assistant container has no reachable IP", {
        reason: "container_unreachable",
        userId,
        containerName,
      });
    }

    if (requireReachable) {
      const reachable = await isPortReachable(ip, port);
      if (!reachable) {
        throw new RuntimeUnavailableError("Assistant gateway port is unreachable", {
          reason: "container_unreachable",
          userId,
          containerName,
        });
      }
    }

    return {
      userId,
      containerName,
      ip,
      port,
      httpTarget: `http://${ip}:${port}`,
      wsTarget: `ws://${ip}:${port}`,
    } satisfies GatewayTarget;
  })();

  inflight.set(cacheKey, work);

  try {
    const result = await work;
    writeCache(cacheKey, ttlMs, { value: result });
    return result;
  } catch (error) {
    if (error instanceof RuntimeUnavailableError) {
      writeCache(cacheKey, ttlMs, { error });
    }
    throw error;
  } finally {
    inflight.delete(cacheKey);
  }
}

export function isRuntimeUnavailableError(
  error: unknown
): error is RuntimeUnavailableError {
  return error instanceof RuntimeUnavailableError;
}
