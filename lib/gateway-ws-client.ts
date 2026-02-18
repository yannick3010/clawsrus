export type GatewayConnectionConfig = {
  wsUrl: string;
  authToken?: string | null;
};

export type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: { presence: number; health: number };
};

type GatewayResponseFrame = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { code?: string; message?: string; details?: unknown };
};

export type GatewayHelloOk = {
  type: "hello-ok";
  protocol: number;
  features?: { methods?: string[]; events?: string[] };
  snapshot?: unknown;
  auth?: {
    deviceToken?: string;
    role?: string;
    scopes?: string[];
    issuedAtMs?: number;
  };
  policy?: { tickIntervalMs?: number };
};

export type GatewaySessionRow = {
  key: string;
  updatedAt?: number;
  [key: string]: unknown;
};

export type GatewaySessionsListResult = {
  sessions?: GatewaySessionRow[];
  path?: string;
  [key: string]: unknown;
};

export type GatewayChatHistoryResult = {
  sessionKey?: string;
  sessionId?: string;
  messages?: unknown[];
  thinkingLevel?: string;
  verboseLevel?: string;
  [key: string]: unknown;
};

export type GatewayChatSendParams = {
  sessionKey: string;
  message: string;
  idempotencyKey: string;
  deliver?: boolean;
  thinking?: string;
  timeoutMs?: number;
  attachments?: Array<{
    type: "image";
    mimeType: string;
    content: string;
  }>;
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout> | null;
};

type GatewayWsClientOptions = {
  getConnection: () => Promise<GatewayConnectionConfig>;
  requestTimeoutMs?: number;
  connectTimeoutMs?: number;
  onHello?: (hello: GatewayHelloOk) => void | Promise<void>;
  onEvent?: (event: GatewayEventFrame) => void;
  onClose?: (info: { code: number; reason: string }) => void;
  onGap?: (info: { expected: number; received: number }) => void;
  onConnectionError?: (error: Error) => void;
};

const CONNECT_FAILED_CLOSE_CODE = 4008;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 15_000;

function generateRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseAuthTokenFromWsUrl(wsUrl: string): string | undefined {
  try {
    const url = new URL(wsUrl);
    const token = url.searchParams.get("token")?.trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

export class GatewayWsClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private closed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectNonce: string | null = null;
  private connectSent = false;
  private lastSeq: number | null = null;
  private backoffMs = 800;
  private currentConnection: GatewayConnectionConfig | null = null;

  constructor(private readonly options: GatewayWsClientOptions) {}

  start() {
    this.closed = false;
    void this.connect();
  }

  stop() {
    this.closed = true;
    this.clearReconnectTimer();
    this.clearConnectTimer();
    this.ws?.close();
    this.ws = null;
    this.flushPending(new Error("gateway client stopped"));
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async listConversations(params?: {
    activeMinutes?: number;
    limit?: number;
    includeGlobal?: boolean;
    includeUnknown?: boolean;
  }) {
    const payload: Record<string, unknown> = {
      includeGlobal: params?.includeGlobal ?? true,
      includeUnknown: params?.includeUnknown ?? true,
    };
    if (typeof params?.activeMinutes === "number" && params.activeMinutes > 0) {
      payload.activeMinutes = params.activeMinutes;
    }
    if (typeof params?.limit === "number" && params.limit > 0) {
      payload.limit = params.limit;
    }
    return this.request<GatewaySessionsListResult>("sessions.list", payload);
  }

  async getConversation(sessionKey: string, limit = 200) {
    return this.request<GatewayChatHistoryResult>("chat.history", {
      sessionKey,
      limit,
    });
  }

  async getConversationState(sessionKey: string) {
    return this.getConversation(sessionKey, 1);
  }

  async sendMessage(params: GatewayChatSendParams) {
    return this.request<{ runId?: string; status?: string }>("chat.send", params);
  }

  async abortMessage(sessionKey: string, runId?: string | null) {
    return this.request<{ ok?: boolean; aborted?: boolean; runIds?: string[] }>("chat.abort", {
      sessionKey,
      ...(runId ? { runId } : {}),
    });
  }

  request<T = unknown>(
    method: string,
    params?: unknown,
    options?: { timeoutMs?: number }
  ): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("gateway not connected"));
    }

    const timeoutMs = options?.timeoutMs ?? this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const id = generateRequestId();
    const frame = { type: "req", id, method, params };

    return new Promise<T>((resolve, reject) => {
      const timeoutId =
        timeoutMs > 0
          ? setTimeout(() => {
              this.pending.delete(id);
              reject(new Error(`request timed out: ${method}`));
            }, timeoutMs)
          : null;

      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timeoutId,
      });

      try {
        this.ws?.send(JSON.stringify(frame));
      } catch (error) {
      if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearConnectTimer() {
    if (this.connectTimer !== null) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  private flushPending(error: Error) {
    for (const [, pending] of this.pending) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(error);
    }
    this.pending.clear();
  }

  private scheduleReconnect() {
    if (this.closed || this.reconnectTimer !== null) {
      return;
    }

    const delay = this.backoffMs;
    this.backoffMs = Math.min(Math.round(this.backoffMs * 1.7), MAX_RECONNECT_DELAY_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, delay);
  }

  private async connect() {
    if (this.closed || this.ws) {
      return;
    }

    let connection: GatewayConnectionConfig;
    try {
      connection = await this.options.getConnection();
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      this.options.onConnectionError?.(normalized);
      this.scheduleReconnect();
      return;
    }

    if (this.closed) {
      return;
    }

    const wsUrl = connection.wsUrl?.trim();
    if (!wsUrl) {
      const err = new Error("Missing gateway websocket URL");
      this.options.onConnectionError?.(err);
      this.scheduleReconnect();
      return;
    }

    this.currentConnection = connection;
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.queueConnect();
    });

    ws.addEventListener("message", (event) => {
      this.handleMessage(String(event.data ?? ""));
    });

    ws.addEventListener("close", (event) => {
      if (this.ws !== ws) {
        return;
      }
      const reason = String(event.reason ?? "");
      this.ws = null;
      this.clearConnectTimer();
      this.flushPending(new Error(`gateway closed (${event.code}): ${reason}`));
      this.options.onClose?.({ code: event.code, reason });
      this.scheduleReconnect();
    });

    ws.addEventListener("error", () => {
      // Close handler will handle retries.
    });
  }

  private queueConnect() {
    this.connectNonce = null;
    this.connectSent = false;
    this.clearConnectTimer();
    this.connectTimer = setTimeout(() => {
      void this.sendConnect();
    }, 750);
  }

  private async sendConnect() {
    if (this.connectSent || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.connectSent = true;
    this.clearConnectTimer();

    const scopes = ["operator.admin", "operator.approvals", "operator.pairing"];
    const role = "operator";
    const authToken =
      this.currentConnection?.authToken?.trim() ||
      parseAuthTokenFromWsUrl(this.currentConnection?.wsUrl || "");
    const auth = authToken ? { token: authToken } : undefined;

    const params = {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: "openclaw-control-ui",
        version: "clawsrus-native-chat-v1",
        platform: navigator.platform || "web",
        mode: "webchat",
      },
      role,
      scopes,
      caps: [],
      auth,
      userAgent: navigator.userAgent,
      locale: navigator.language,
    };

    try {
      const hello = await this.request<GatewayHelloOk>("connect", params, {
        timeoutMs: this.options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS,
      });
      this.backoffMs = 800;
      await this.options.onHello?.(hello);
    } catch {
      this.ws?.close(CONNECT_FAILED_CLOSE_CODE, "connect failed");
    }
  }

  private handleMessage(raw: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const frame = parsed as { type?: unknown };
    if (frame.type === "event") {
      const eventFrame = parsed as GatewayEventFrame;

      if (eventFrame.event === "connect.challenge") {
        const payload = eventFrame.payload as { nonce?: unknown } | undefined;
        const nonce = typeof payload?.nonce === "string" ? payload.nonce : null;
        if (nonce) {
          this.connectNonce = nonce;
          void this.sendConnect();
        }
        return;
      }

      const seq = typeof eventFrame.seq === "number" ? eventFrame.seq : null;
      if (seq !== null) {
        if (this.lastSeq !== null && seq > this.lastSeq + 1) {
          this.options.onGap?.({ expected: this.lastSeq + 1, received: seq });
        }
        this.lastSeq = seq;
      }

      try {
        this.options.onEvent?.(eventFrame);
      } catch {
        // Swallow listener errors to keep the socket alive.
      }
      return;
    }

    if (frame.type === "res") {
      const response = parsed as GatewayResponseFrame;
      const pending = this.pending.get(response.id);
      if (!pending) {
        return;
      }

      this.pending.delete(response.id);
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }

      if (response.ok) {
        pending.resolve(response.payload);
      } else {
        pending.reject(new Error(response.error?.message || "request failed"));
      }
    }
  }
}
