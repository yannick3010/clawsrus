"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GatewayHelloOk,
  GatewayWsClient,
  type GatewayChatHistoryResult,
  type GatewayChatSendParams,
} from "@/lib/gateway-ws-client";

type ProxyTokenErrorReason =
  | "container_missing"
  | "container_not_running"
  | "container_unreachable"
  | "gateway_token_missing";

type ProxyTokenResponse = {
  ws_url?: string;
  expires_at?: string;
  error?: string;
  reason?: ProxyTokenErrorReason;
};

type ChatRole = "user" | "assistant" | "system";
type ChatPhase = "idle" | "awaiting" | "processing" | "responding";
type ChatConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

type NormalizedMessagePart =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "unsupported";
      contentType: string;
    };

export type NormalizedChatMessage = {
  id: string;
  role: ChatRole;
  timestamp: number;
  parts: NormalizedMessagePart[];
};

type ChatEventPayload = {
  runId?: string;
  sessionKey?: string;
  state?: "delta" | "final" | "aborted" | "error";
  message?: unknown;
  errorMessage?: string;
};

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function toTextParts(content: unknown): NormalizedMessagePart[] {
  if (typeof content === "string") {
    return content.trim()
      ? [{ kind: "text", text: content }]
      : [{ kind: "unsupported", contentType: "empty" }];
  }

  if (!Array.isArray(content)) {
    return [];
  }

  const parts: NormalizedMessagePart[] = [];
  for (const item of content) {
    if (!isRecord(item)) {
      parts.push({ kind: "unsupported", contentType: "unknown" });
      continue;
    }

    const type = typeof item.type === "string" ? item.type : "unknown";
    if (type === "text" && typeof item.text === "string") {
      parts.push({ kind: "text", text: item.text });
      continue;
    }

    parts.push({ kind: "unsupported", contentType: type });
  }

  return parts;
}

function normalizeHistoryMessage(message: unknown, index: number): NormalizedChatMessage | null {
  if (!isRecord(message)) {
    return null;
  }

  const role = typeof message.role === "string" ? message.role : "assistant";
  const normalizedRole: ChatRole =
    role === "user" || role === "assistant" || role === "system" ? role : "assistant";
  const timestamp =
    typeof message.timestamp === "number" && Number.isFinite(message.timestamp)
      ? message.timestamp
      : Date.now() + index;

  let parts = toTextParts(message.content);
  if (parts.length === 0 && typeof message.text === "string") {
    parts = [{ kind: "text", text: message.text }];
  }
  if (parts.length === 0) {
    return null;
  }

  const id = typeof message.id === "string" && message.id.trim() ? message.id : `${role}-${index}-${timestamp}`;
  return {
    id,
    role: normalizedRole,
    timestamp,
    parts,
  };
}

function extractText(message: unknown): string | null {
  if (!isRecord(message)) {
    return null;
  }

  if (typeof message.text === "string") {
    return message.text;
  }

  const content = message.content;
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return null;
  }

  const textParts = content
    .map((part) => {
      if (!isRecord(part)) {
        return null;
      }
      if (part.type === "text" && typeof part.text === "string") {
        return part.text;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));

  if (textParts.length === 0) {
    return null;
  }
  return textParts.join("\n");
}

function normalizeSessionKeyWithDefaults(
  sessionKey: string,
  defaults: { defaultAgentId?: string; mainKey?: string; mainSessionKey?: string } | undefined
) {
  const raw = sessionKey.trim();
  const mainSessionKey = defaults?.mainSessionKey?.trim();
  if (!mainSessionKey) {
    return raw;
  }
  if (!raw) {
    return mainSessionKey;
  }

  const mainKey = defaults?.mainKey?.trim() || "main";
  const defaultAgentId = defaults?.defaultAgentId?.trim();
  const isAlias =
    raw === "main" ||
    raw === mainKey ||
    (defaultAgentId &&
      (raw === `agent:${defaultAgentId}:main` || raw === `agent:${defaultAgentId}:${mainKey}`));
  return isAlias ? mainSessionKey : raw;
}

function mapProxyTokenError(status: number, data: ProxyTokenResponse): string {
  if (status === 409 && data.reason) {
    if (data.reason === "container_missing") {
      return "Assistant runtime not found. Please retry setup from your setup link.";
    }
    if (data.reason === "container_not_running") {
      return "Assistant is still starting. Try refresh in a few seconds.";
    }
    if (data.reason === "container_unreachable") {
      return "Assistant is starting, but chat gateway is not reachable yet.";
    }
    if (data.reason === "gateway_token_missing") {
      return "Assistant setup is incomplete. Please contact support to finish provisioning.";
    }
  }
  return data.error || "Failed to initialize chat";
}

async function fetchProxyConnection() {
  const res = await fetch("/api/agent/proxy-token", {
    method: "GET",
    cache: "no-store",
  });
  const data = (await res.json()) as ProxyTokenResponse;
  if (!res.ok) {
    throw new Error(mapProxyTokenError(res.status, data));
  }

  const wsUrl = typeof data.ws_url === "string" ? data.ws_url : "";
  if (!wsUrl) {
    throw new Error("Missing gateway websocket URL");
  }

  let authToken: string | undefined;
  try {
    authToken = new URL(wsUrl).searchParams.get("token") || undefined;
  } catch {
    authToken = undefined;
  }

  return {
    wsUrl,
    authToken,
  };
}

function localMessage(role: ChatRole, text: string): NormalizedChatMessage {
  return {
    id: generateId(),
    role,
    timestamp: Date.now(),
    parts: [{ kind: "text", text }],
  };
}

export function useGatewayChat(enabled: boolean) {
  const clientRef = useRef<GatewayWsClient | null>(null);
  const runIdRef = useRef<string | null>(null);
  const sessionKeyRef = useRef<string>("main");
  const streamTextRef = useRef<string>("");
  const hasConnectedOnceRef = useRef(false);

  const [messages, setMessages] = useState<NormalizedChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [phase, setPhase] = useState<ChatPhase>("awaiting");
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>("connecting");
  const [error, setError] = useState("");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState("main");

  const setRunId = useCallback((runId: string | null) => {
    runIdRef.current = runId;
    setActiveRunId(runId);
  }, []);

  const resolveSessionKey = useCallback(
    async (client: GatewayWsClient, hello: GatewayHelloOk | undefined) => {
      const snapshot = isRecord(hello?.snapshot)
        ? (hello?.snapshot as {
            sessionDefaults?: {
              defaultAgentId?: string;
              mainKey?: string;
              mainSessionKey?: string;
            };
          })
        : undefined;
      const defaults = snapshot?.sessionDefaults;

      let selectedKey = normalizeSessionKeyWithDefaults("", defaults);
      try {
        const list = await client.listConversations({
          activeMinutes: 120,
          limit: 100,
          includeGlobal: true,
          includeUnknown: true,
        });
        const rows = Array.isArray(list.sessions) ? list.sessions.slice() : [];
        rows.sort((a, b) => {
          const aUpdated = typeof a.updatedAt === "number" ? a.updatedAt : 0;
          const bUpdated = typeof b.updatedAt === "number" ? b.updatedAt : 0;
          return bUpdated - aUpdated;
        });

        const first = rows.find((row) => typeof row.key === "string" && row.key.trim());
        if (first?.key) {
          selectedKey = normalizeSessionKeyWithDefaults(first.key, defaults);
        }
      } catch {
        // If sessions.list fails, continue with defaults below.
      }

      if (!selectedKey) {
        selectedKey = normalizeSessionKeyWithDefaults("main", defaults) || "main";
      }
      return selectedKey;
    },
    []
  );

  const loadHistory = useCallback(async (client: GatewayWsClient, targetSessionKey: string) => {
    setPhase("awaiting");
    const history = await client.getConversation(targetSessionKey, 200);
    const rawMessages = Array.isArray((history as GatewayChatHistoryResult).messages)
      ? ((history as GatewayChatHistoryResult).messages as unknown[])
      : [];
    const normalized = rawMessages
      .map((message, index) => normalizeHistoryMessage(message, index))
      .filter((message): message is NormalizedChatMessage => Boolean(message));
    setMessages(normalized);
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (!enabled) {
      setConnectionStatus("disconnected");
      setError("Native chat is disabled right now. Set NATIVE_CHAT_V1=true to re-enable.");
      setPhase("idle");
      return;
    }

    let cancelled = false;
    setError("");
    setConnectionStatus("connecting");
    setPhase("awaiting");

    const client = new GatewayWsClient({
      getConnection: async () => {
        if (hasConnectedOnceRef.current) {
          setConnectionStatus("reconnecting");
        } else {
          setConnectionStatus("connecting");
        }
        return fetchProxyConnection();
      },
      onConnectionError: (connectionError) => {
        if (cancelled) {
          return;
        }
        setError(connectionError.message);
      },
      onHello: async (hello) => {
        if (cancelled) {
          return;
        }
        hasConnectedOnceRef.current = true;
        setConnectionStatus("connected");
        setError("");
        setRunId(null);
        streamTextRef.current = "";
        setStreamingText("");

        const selectedSessionKey = await resolveSessionKey(client, hello);
        if (cancelled) {
          return;
        }
        sessionKeyRef.current = selectedSessionKey;
        setSessionKey(selectedSessionKey);

        try {
          await loadHistory(client, selectedSessionKey);
        } catch (historyError) {
          if (cancelled) {
            return;
          }
          setError(historyError instanceof Error ? historyError.message : String(historyError));
          setPhase("idle");
        }
      },
      onClose: () => {
        if (cancelled) {
          return;
        }
        if (hasConnectedOnceRef.current) {
          setConnectionStatus("reconnecting");
        }
      },
      onEvent: (event) => {
        if (cancelled || event.event !== "chat" || !isRecord(event.payload)) {
          return;
        }

        const payload = event.payload as ChatEventPayload;
        if (typeof payload.sessionKey === "string" && payload.sessionKey !== sessionKeyRef.current) {
          return;
        }

        const payloadRunId = typeof payload.runId === "string" ? payload.runId : null;
        const currentRunId = runIdRef.current;
        if (payloadRunId && currentRunId && payloadRunId !== currentRunId) {
          if (payload.state === "final") {
            void loadHistory(client, sessionKeyRef.current).catch((historyError) => {
              if (!cancelled) {
                setError(historyError instanceof Error ? historyError.message : String(historyError));
              }
            });
          }
          return;
        }

        if (payload.state === "delta") {
          const next = extractText(payload.message);
          if (typeof next === "string") {
            setStreamingText((prev) => {
              if (!prev || next.length >= prev.length) {
                streamTextRef.current = next;
                return next;
              }
              return prev;
            });
            setPhase("responding");
          }
          return;
        }

        if (payload.state === "final") {
          setRunId(null);
          streamTextRef.current = "";
          setStreamingText("");
          setPhase("awaiting");
          void loadHistory(client, sessionKeyRef.current)
            .then(() => {
              if (!cancelled) {
                setPhase("idle");
              }
            })
            .catch((historyError) => {
              if (!cancelled) {
                setError(historyError instanceof Error ? historyError.message : String(historyError));
                setPhase("idle");
              }
            });
          return;
        }

        if (payload.state === "aborted") {
          const maybeAssistant = normalizeHistoryMessage(payload.message, Date.now());
          if (maybeAssistant) {
            setMessages((prev) => [...prev, maybeAssistant]);
          } else if (streamTextRef.current.trim()) {
            setMessages((prev) => [...prev, localMessage("assistant", streamTextRef.current)]);
          }
          setRunId(null);
          streamTextRef.current = "";
          setStreamingText("");
          setPhase("idle");
          return;
        }

        if (payload.state === "error") {
          setRunId(null);
          streamTextRef.current = "";
          setStreamingText("");
          setError(payload.errorMessage || "Chat error");
          setPhase("idle");
        }
      },
    });

    clientRef.current = client;
    client.start();

    return () => {
      cancelled = true;
      client.stop();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [enabled, loadHistory, resolveSessionKey, setRunId]);

  const isBusy = useMemo(
    () => Boolean(activeRunId) || phase === "processing" || phase === "responding",
    [activeRunId, phase]
  );

  const sendMessage = useCallback(
    async (rawInput: string) => {
      if (!enabled) {
        return;
      }
      const text = rawInput.trim();
      if (!text) {
        return;
      }

      const client = clientRef.current;
      if (!client || !client.connected) {
        setError("Gateway not connected yet.");
        return;
      }

      if (isBusy) {
        return;
      }

      const runId = generateId();
      const params: GatewayChatSendParams = {
        sessionKey: sessionKeyRef.current,
        message: text,
        idempotencyKey: runId,
        deliver: false,
      };

      setError("");
      setMessages((prev) => [...prev, localMessage("user", text)]);
      setRunId(runId);
      streamTextRef.current = "";
      setStreamingText("");
      setPhase("processing");

      try {
        await client.sendMessage(params);
      } catch (sendError) {
        setRunId(null);
        setPhase("idle");
        const message = sendError instanceof Error ? sendError.message : String(sendError);
        setError(message);
        setMessages((prev) => [...prev, localMessage("assistant", `Error: ${message}`)]);
      }
    },
    [enabled, isBusy, setRunId]
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    const client = clientRef.current;
    if (!client) {
      return;
    }

    setError("");
    if (!client.connected) {
      client.stop();
      client.start();
      return;
    }

    try {
      await loadHistory(client, sessionKeyRef.current);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
      setPhase("idle");
    }
  }, [enabled, loadHistory]);

  return {
    messages,
    streamingText,
    phase,
    connectionStatus,
    error,
    sendMessage,
    refresh,
    isBusy,
    isConnected: connectionStatus === "connected",
    sessionKey,
  };
}
