"use client";

import type { RefObject } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import ChatMessageBubble from "@/components/dashboard/chat/ChatMessageBubble";
import type { NormalizedChatMessage } from "@/components/dashboard/useGatewayChat";

type ChatThreadProps = {
  messages: NormalizedChatMessage[];
  streamingText: string;
  threadRef: RefObject<HTMLDivElement | null>;
  onPromptSelect: (text: string) => void;
};

const starterPrompts = [
  "Give me a priority plan for today.",
  "Draft a message I can send to my team.",
  "Summarize what I should focus on this week.",
];

export default function ChatThread({ messages, streamingText, threadRef, onPromptSelect }: ChatThreadProps) {
  const hasMessages = messages.length > 0 || Boolean(streamingText);

  return (
    <div
      ref={threadRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-48 sm:px-8 lg:px-12"
    >
      {!hasMessages ? (
        <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-surface-100/70 px-6 py-10 text-center">
          <Sparkles className="h-8 w-8 text-brand-500" />
          <p className="mt-3 text-base font-semibold text-ink-700">Start a polished, focused conversation</p>
          <p className="mt-2 text-sm text-ink-500">
            Ask for strategy, drafting, summaries, or operational help. The assistant keeps context for this session.
          </p>

          <div className="mt-5 flex w-full flex-col gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptSelect(prompt)}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-left text-sm text-ink-600 transition hover:border-surface-300 hover:text-ink-700"
              >
                <MessageSquareText className="h-4 w-4 text-ink-400" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {messages.map((message, index) => {
        const prevRole = index > 0 ? messages[index - 1].role : null;
        return (
          <ChatMessageBubble
            key={message.id}
            message={message}
            compact={prevRole === message.role}
          />
        );
      })}

      {streamingText ? (
        <ChatMessageBubble
          isStreaming
          compact={messages[messages.length - 1]?.role === "assistant"}
          message={{
            id: "streaming",
            role: "assistant",
            timestamp: Date.now(),
            parts: [{ kind: "text", text: streamingText }],
          }}
        />
      ) : null}
    </div>
  );
}
