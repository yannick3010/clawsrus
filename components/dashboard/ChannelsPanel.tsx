"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, CircleDashed } from "lucide-react";
import type { ChannelsSummary } from "@/components/dashboard/types";

type Channel = {
  channel: "telegram" | "whatsapp" | "imessage";
  status: "connected" | "not_connected" | "coming_soon";
  meta?: Record<string, unknown>;
};

type ChannelsPanelProps = {
  variant?: "card" | "embedded";
  onSummaryChange?: (summary: ChannelsSummary) => void;
};

export default function ChannelsPanel({
  variant = "card",
  onSummaryChange,
}: ChannelsPanelProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [telegramToken, setTelegramToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/channels", { cache: "no-store" });
      const data = (await res.json()) as Channel[] & { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to load channels");
        return;
      }
      setChannels(data as Channel[]);
      const rows = data as Channel[];
      onSummaryChange?.({
        loading: false,
        error: "",
        total: rows.length,
        connected: rows.filter((item) => item.status === "connected").length,
        telegramStatus: rows.find((item) => item.channel === "telegram")?.status || "not_connected",
      });
    } catch {
      setError("Failed to load channels");
      onSummaryChange?.({
        loading: false,
        error: "Failed to load channels",
        total: 0,
        connected: 0,
        telegramStatus: "not_connected",
      });
    } finally {
      setLoading(false);
    }
  }, [onSummaryChange]);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  async function connectTelegram() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/channels/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_token: telegramToken }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to connect Telegram");
        return;
      }

      setTelegramToken("");
      await loadChannels();
    } catch {
      setError("Failed to connect Telegram");
    } finally {
      setSaving(false);
    }
  }

  const telegram = channels.find((item) => item.channel === "telegram");

  useEffect(() => {
    if (!loading) {
      onSummaryChange?.({
        loading,
        error,
        total: channels.length,
        connected: channels.filter((item) => item.status === "connected").length,
        telegramStatus: channels.find((item) => item.channel === "telegram")?.status || "not_connected",
      });
    }
  }, [channels, error, loading, onSummaryChange]);

  return (
    <section
      className={
        variant === "embedded"
          ? "rounded-xl border border-surface-200 bg-white p-4"
          : "rounded-xl border border-surface-200 bg-white p-5"
      }
    >
      {variant === "card" ? (
        <>
          <h3 className="text-sm font-semibold text-ink-700">Channels</h3>
          <p className="mt-1 text-xs text-ink-400">
            Connect Telegram now. WhatsApp and iMessage are coming soon.
          </p>
        </>
      ) : (
        <p className="text-xs text-ink-400">Connect Telegram. Other channels are coming soon.</p>
      )}

      {loading ? (
        <div className={`${variant === "card" ? "mt-4" : "mt-2"} flex justify-center text-ink-400`}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className={`${variant === "card" ? "mt-4" : "mt-3"} space-y-3`}>
          <div className="rounded-xl border border-ink-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-700">Telegram</p>
              <StatusBadge status={telegram?.status || "not_connected"} />
            </div>
            {telegram?.status === "connected" ? (
              <p className="mt-2 text-xs text-brand-700">
                Connected as @{String(telegram.meta?.bot_username || "bot")}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <input
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="Telegram bot token"
                  className="focus-ring w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 focus:border-brand-500"
                />
                <button
                  onClick={() => void connectTelegram()}
                  disabled={saving || !telegramToken.trim()}
                  className="focus-ring w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                >
                  {saving ? "Connecting..." : "Connect Telegram"}
                </button>
              </div>
            )}
          </div>

          <ChannelComingSoon name="WhatsApp" />
          <ChannelComingSoon name="iMessage" />
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}

function StatusBadge({ status }: { status: Channel["status"] }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Connected
      </span>
    );
  }

  if (status === "coming_soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 text-xs font-medium text-ink-500">
        <CircleDashed className="h-3.5 w-3.5" />
        Coming soon
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
      <CircleDashed className="h-3.5 w-3.5" />
      Not connected
    </span>
  );
}

function ChannelComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-600">{name}</p>
        <StatusBadge status="coming_soon" />
      </div>
      <p className="mt-1 text-xs text-ink-400">We&apos;re working on this integration.</p>
    </div>
  );
}
