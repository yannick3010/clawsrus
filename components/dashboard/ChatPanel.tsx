"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex w-full flex-1 items-center justify-center px-6 text-center text-sm text-red-600">
          Native chat is currently disabled. Set `NATIVE_CHAT_V1=true` to re-enable it.
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
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
          phaseLabel={phaseLabel}
        />

        {connectionStatus === "connecting" && messages.length === 0 && !error ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-100/65 text-ink-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
