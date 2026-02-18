"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GatewayWsClient,
  type GatewaySkillRowRaw,
  type GatewaySkillsListResult,
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

type GatewayConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

type LoadSkillsOptions = {
  showLoading?: boolean;
};

export type GatewaySkill = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  mutable: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readFirstString(row: GatewaySkillRowRaw, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) {
        return normalized;
      }
    }
  }
  return "";
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "enabled", "active", "on", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "disabled", "inactive", "off", "no"].includes(normalized)) {
      return false;
    }
  }
  return null;
}

function normalizeSkill(row: GatewaySkillRowRaw): GatewaySkill | null {
  const id = readFirstString(row, ["id", "skillId", "skillKey", "key", "name"]);
  if (!id) {
    return null;
  }

  const name = readFirstString(row, ["name", "title"]) || id;
  const description = readFirstString(row, ["description", "summary"]);

  const enabled =
    readBoolean(row.enabled) ??
    readBoolean(row.isEnabled) ??
    readBoolean(row.active) ??
    (() => {
      const disabled = readBoolean(row.disabled);
      return disabled === null ? null : !disabled;
    })() ??
    readBoolean(row.state) ??
    false;

  const mutable =
    (() => {
      const always = readBoolean(row.always);
      return always === true ? false : null;
    })() ??
    readBoolean(row.mutable) ??
    readBoolean(row.canToggle) ??
    (() => {
      const readonly = readBoolean(row.readonly);
      if (readonly !== null) {
        return !readonly;
      }
      const locked = readBoolean(row.locked);
      if (locked !== null) {
        return !locked;
      }
      return true;
    })();

  return {
    id,
    name,
    description,
    enabled,
    mutable,
  };
}

function extractSkillRows(result: GatewaySkillsListResult | unknown): GatewaySkillRowRaw[] {
  if (Array.isArray(result)) {
    return result.filter((item): item is GatewaySkillRowRaw => isRecord(item));
  }

  if (!isRecord(result)) {
    return [];
  }

  const directCandidates = ["skills", "items", "list", "rows"] as const;
  for (const key of directCandidates) {
    const value = result[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is GatewaySkillRowRaw => isRecord(item));
    }
  }

  const nestedCandidates = ["result", "data", "payload"] as const;
  for (const key of nestedCandidates) {
    const nested = result[key];
    if (!isRecord(nested)) {
      continue;
    }

    for (const nestedKey of directCandidates) {
      const value = nested[nestedKey];
      if (Array.isArray(value)) {
        return value.filter((item): item is GatewaySkillRowRaw => isRecord(item));
      }
    }
  }

  return [];
}

function filterAndSortSkills(skills: GatewaySkill[], allowlist: string[]): GatewaySkill[] {
  const rank = new Map(allowlist.map((id, index) => [id, index]));
  return skills
    .filter((skill) => rank.has(skill.id))
    .sort((a, b) => {
      const aRank = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bRank = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
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
  return data.error || "Failed to initialize skills";
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

export function useGatewaySkills(enabled: boolean, allowlist: string[]) {
  const clientRef = useRef<GatewayWsClient | null>(null);
  const hasConnectedOnceRef = useRef(false);

  const normalizedAllowlist = useMemo(
    () => Array.from(new Set(allowlist.map((item) => item.trim()).filter(Boolean))),
    [allowlist]
  );

  const [skills, setSkills] = useState<GatewaySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSkillId, setSavingSkillId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<GatewayConnectionStatus>("connecting");
  const [error, setError] = useState("");

  const loadSkills = useCallback(
    async (client: GatewayWsClient, options?: LoadSkillsOptions) => {
      const showLoading = options?.showLoading ?? true;
      if (showLoading) {
        setLoading(true);
      }

      try {
        const result = await client.listSkills();
        const rows = extractSkillRows(result as GatewaySkillsListResult);
        const normalized = rows
          .map((row) => normalizeSkill(row))
          .filter((row): row is GatewaySkill => Boolean(row));
        setSkills(filterAndSortSkills(normalized, normalizedAllowlist));
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [normalizedAllowlist]
  );

  useEffect(() => {
    if (!enabled) {
      setConnectionStatus("disconnected");
      setLoading(false);
      setSkills([]);
      setSavingSkillId(null);
      setError("Native skills are disabled. Set NATIVE_SKILLS_V1=true to enable.");
      return;
    }

    let cancelled = false;
    setError("");
    setLoading(true);
    setConnectionStatus("connecting");

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
      onHello: async () => {
        if (cancelled) {
          return;
        }
        hasConnectedOnceRef.current = true;
        setConnectionStatus("connected");
        setError("");

        try {
          await loadSkills(client);
        } catch (loadError) {
          if (cancelled) {
            return;
          }
          setError(loadError instanceof Error ? loadError.message : String(loadError));
          setLoading(false);
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
  }, [enabled, loadSkills]);

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
      await loadSkills(client);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
      setLoading(false);
    }
  }, [enabled, loadSkills]);

  const toggleSkill = useCallback(
    async (skillId: string, enabledNext: boolean) => {
      if (!enabled) {
        return;
      }

      const client = clientRef.current;
      if (!client || !client.connected) {
        setError("Gateway not connected yet.");
        return;
      }

      const targetId = skillId.trim();
      if (!targetId) {
        return;
      }

      const current = skills.find((skill) => skill.id === targetId);
      if (!current || !current.mutable) {
        return;
      }

      setError("");
      setSavingSkillId(targetId);
      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === targetId
            ? {
                ...skill,
                enabled: enabledNext,
              }
            : skill
        )
      );

      try {
        await client.setSkillEnabled({ skillId: targetId, enabled: enabledNext });
      } catch (toggleError) {
        setSkills((prev) =>
          prev.map((skill) =>
            skill.id === targetId
              ? {
                  ...skill,
                  enabled: current.enabled,
                }
              : skill
          )
        );
        setError(toggleError instanceof Error ? toggleError.message : String(toggleError));
        setSavingSkillId(null);
        return;
      }

      setSavingSkillId(null);
      void loadSkills(client, { showLoading: false }).catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      });
    },
    [enabled, loadSkills, skills]
  );

  return {
    skills,
    loading,
    savingSkillId,
    connectionStatus,
    error,
    refresh,
    toggleSkill,
    isConnected: connectionStatus === "connected",
  };
}
