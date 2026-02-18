"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { isNativeChatEnabled } from "@/lib/feature-flags";
import { useGatewayChat } from "@/components/dashboard/useGatewayChat";

export default function ChatPanel() {
  const nativeChatEnabled = isNativeChatEnabled();
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    streamingText,
    phase,
    connectionStatus,
    error,
    sendMessage,
    refresh,
    isBusy,
    isConnected,
  } = useGatewayChat(nativeChatEnabled);

  const phaseLabel = useMemo(() => {
    if (connectionStatus === "connecting") {
      return "Connecting to assistant...";
    }
    if (connectionStatus === "reconnecting") {
      return "Reconnecting...";
    }
    if (phase === "awaiting") {
      return "Loading conversation...";
    }
    if (phase === "processing") {
      return "Processing...";
    }
    if (phase === "responding") {
      return "Responding...";
    }
    return "Ready";
  }, [connectionStatus, phase]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingText]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    setDraft("");
    await sendMessage(text);
  }

  if (!nativeChatEnabled) {
    return (
      <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-navy-700">Agent Chat</h2>
            <p className="text-xs text-navy-400">Native chat is disabled.</p>
          </div>
        </div>
        <div className="flex h-[640px] items-center justify-center px-6 text-center text-sm text-red-600">
          Native chat is currently disabled. Set `NATIVE_CHAT_V1=true` to re-enable it.
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-navy-700">Agent Chat</h2>
          <p className="text-xs text-navy-400">{phaseLabel}</p>
        </div>
        <button
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 hover:border-navy-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="relative h-[640px] bg-navy-50" data-testid="native-chat-panel">
        <div className="flex h-full flex-col">
          <div className="border-b border-navy-100 bg-white px-4 py-2 text-xs text-navy-500">
            Status:{" "}
            <span className={isConnected ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>
              {connectionStatus}
            </span>
          </div>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !streamingText ? (
              <div className="text-sm text-navy-400">Start the conversation with your assistant.</div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                data-testid="chat-message"
                data-role={message.role}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  message.role === "user"
                    ? "ml-auto bg-brand-500 text-white"
                    : "mr-auto bg-white text-navy-700"
                }`}
              >
                {message.parts.map((part, index) =>
                  part.kind === "text" ? (
                    <p key={`${message.id}-text-${index}`} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  ) : (
                    <p
                      key={`${message.id}-unsupported-${index}`}
                      className="rounded-md bg-navy-50 px-2 py-1 text-xs text-navy-500"
                    >
                      Unsupported content type
                    </p>
                  )
                )}
              </div>
            ))}

            {streamingText ? (
              <div
                data-testid="chat-message"
                data-role="assistant"
                className="mr-auto max-w-[85%] animate-pulse rounded-2xl bg-white px-3 py-2 text-sm text-navy-700 shadow-sm"
              >
                <p className="whitespace-pre-wrap">{streamingText}</p>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="border-t border-navy-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>
          ) : null}

          <form onSubmit={onSubmit} className="border-t border-navy-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                data-testid="chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-navy-200 px-3 py-2 text-sm text-navy-700 focus:border-brand-500 focus:outline-none"
              />
              <button
                data-testid="chat-send"
                type="submit"
                disabled={!isConnected || isBusy || !draft.trim()}
                className="rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {!isConnected ? (
              <p className="mt-2 text-xs text-navy-400">Waiting for gateway connection.</p>
            ) : null}
          </form>
        </div>
        {connectionStatus === "connecting" && messages.length === 0 && !error ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-50/70 text-navy-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
