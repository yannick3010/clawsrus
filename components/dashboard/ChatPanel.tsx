"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { isNativeChatEnabled } from "@/lib/feature-flags";
import { useGatewayChat } from "@/components/dashboard/useGatewayChat";
import ChatThread from "@/components/dashboard/chat/ChatThread";
import ChatComposer from "@/components/dashboard/chat/ChatComposer";
import type { ChatSummary } from "@/components/dashboard/types";

type ChatPanelProps = {
  onSummaryChange?: (summary: ChatSummary) => void;
};

export default function ChatPanel({ onSummaryChange }: ChatPanelProps) {
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
      return "Connecting to assistant";
    }
    if (connectionStatus === "reconnecting") {
      return "Reconnecting to assistant";
    }
    if (phase === "awaiting") {
      return "Loading conversation";
    }
    if (phase === "processing") {
      return "Processing request";
    }
    if (phase === "responding") {
      return "Assistant is responding";
    }
    return "Ready";
  }, [connectionStatus, phase]);

  useEffect(() => {
    onSummaryChange?.({
      phase,
      connectionStatus,
      error,
      connected: isConnected,
    });
  }, [connectionStatus, error, isConnected, onSummaryChange, phase]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingText]);

  async function onSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    setDraft("");
    await sendMessage(text);
  }

  if (!nativeChatEnabled) {
    return (
      <section className="surface-elevated flex min-h-[560px] overflow-hidden rounded-2xl border border-surface-200 bg-white">
        <div className="flex w-full items-center justify-center px-6 text-center text-sm text-red-600">
          Native chat is currently disabled. Set `NATIVE_CHAT_V1=true` to re-enable it.
        </div>
      </section>
    );
  }

  return (
    <section className="surface-elevated flex h-full min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-surface-200 px-3 py-3 sm:px-4">
        <div>
          <h2 className="text-sm font-semibold text-navy-800">Agent Chat</h2>
          <p className="text-xs text-navy-400">{phaseLabel}</p>
        </div>

        <button
          onClick={() => void refresh()}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-600 hover:border-surface-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col" data-testid="native-chat-panel">
        {!isConnected ? (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-status-warn">
            <AlertCircle className="h-3.5 w-3.5" />
            Gateway status: {connectionStatus}. Messages will send once connection is restored.
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-status-error">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        ) : null}

        <ChatThread
          messages={messages}
          streamingText={streamingText}
          threadRef={threadRef}
          onPromptSelect={setDraft}
        />

        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => onSubmit()}
          disabled={!isConnected || isBusy || !draft.trim()}
          connected={isConnected}
          busy={isBusy}
        />

        {connectionStatus === "connecting" && messages.length === 0 && !error ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-50/65 text-navy-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
