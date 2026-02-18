"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, CircleDashed } from "lucide-react";

type Channel = {
  channel: "telegram" | "whatsapp" | "imessage";
  status: "connected" | "not_connected" | "coming_soon";
  meta?: Record<string, unknown>;
};

export default function ChannelsPanel() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [telegramToken, setTelegramToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadChannels() {
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
    } catch {
      setError("Failed to load channels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChannels();
  }, []);

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

  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-700">Channels</h3>
      <p className="mt-1 text-xs text-navy-400">
        Connect Telegram now. WhatsApp and iMessage are coming soon.
      </p>

      {loading ? (
        <div className="mt-4 flex justify-center text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-navy-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-navy-700">Telegram</p>
              <StatusBadge status={telegram?.status || "not_connected"} />
            </div>
            {telegram?.status === "connected" ? (
              <p className="mt-2 text-xs text-emerald-700">
                Connected as @{String(telegram.meta?.bot_username || "bot")}
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                <input
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="Telegram bot token"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-brand-500 focus:outline-none"
                />
                <button
                  onClick={() => void connectTelegram()}
                  disabled={saving || !telegramToken.trim()}
                  className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
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
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Connected
      </span>
    );
  }

  if (status === "coming_soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-1 text-xs font-medium text-navy-500">
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
    <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy-600">{name}</p>
        <StatusBadge status="coming_soon" />
      </div>
      <p className="mt-1 text-xs text-navy-400">We&apos;re working on this integration.</p>
    </div>
  );
}
