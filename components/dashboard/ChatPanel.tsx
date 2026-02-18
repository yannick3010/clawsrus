"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

type ProxyTokenResponse = {
  ui_url: string;
  expires_at: string;
};

export default function ChatPanel() {
  const [iframeUrl, setIframeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProxySession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agent/proxy-token", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json()) as ProxyTokenResponse & { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to initialize chat");
        setLoading(false);
        return;
      }

      setIframeUrl(data.ui_url);
    } catch {
      setError("Unable to connect chat right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProxySession();
  }, [loadProxySession]);

  return (
    <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-navy-700">Agent Chat</h2>
          <p className="text-xs text-navy-400">Your assistant is ready.</p>
        </div>
        <button
          onClick={() => void loadProxySession()}
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 hover:border-navy-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="h-[640px] bg-navy-50">
        {loading ? (
          <div className="flex h-full items-center justify-center text-navy-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-600">
            {error}
          </div>
        ) : (
          <iframe
            src={iframeUrl}
            title="OpenClaw Chat"
            className="h-full w-full border-0"
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>
    </section>
  );
}
