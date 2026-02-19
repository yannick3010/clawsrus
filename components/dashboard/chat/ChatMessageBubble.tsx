"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import type { NormalizedChatMessage } from "@/components/dashboard/useGatewayChat";

type ChatMessageBubbleProps = {
  message: NormalizedChatMessage;
  compact?: boolean;
  isStreaming?: boolean;
};

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function ChatMessageBubble({
  message,
  compact = false,
  isStreaming = false,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const textForCopy = useMemo(() => {
    return message.parts
      .filter((part) => part.kind === "text")
      .map((part) => part.text)
      .join("\n\n")
      .trim();
  }, [message.parts]);

  async function copyMessage() {
    if (!textForCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textForCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      data-testid="chat-message"
      data-role={message.role}
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${compact ? "mt-1" : "mt-4"}`}
    >
      <article
        className={`group max-w-[92%] rounded-2xl border px-4 py-3 shadow-surface-1 sm:max-w-[86%] ${
          isUser
            ? "border-brand-500 bg-brand-500 text-white"
            : "border-surface-200 bg-white text-navy-700"
        }`}
      >
        <header className="mb-2 flex items-center justify-between gap-3">
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${isUser ? "text-brand-50" : "text-navy-400"}`}>
            {message.role === "assistant" ? "Assistant" : message.role}
          </p>

          <div className="flex items-center gap-2">
            <time className={`text-[11px] ${isUser ? "text-brand-100" : "text-navy-400"}`}>
              {formatTime(message.timestamp)}
            </time>
            {!isUser && !isStreaming ? (
              <button
                type="button"
                onClick={() => void copyMessage()}
                className={`focus-ring rounded-md p-1 transition ${
                  isUser
                    ? "text-brand-50/90 hover:bg-white/15"
                    : "text-navy-400 hover:bg-surface-100 hover:text-navy-600"
                }`}
                aria-label="Copy assistant response"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            ) : null}
          </div>
        </header>

        <div className={isUser ? "chat-markdown text-white" : "chat-markdown"}>
          {message.parts.map((part, index) => {
            if (part.kind !== "text") {
              return (
                <p
                  key={`${message.id}-unsupported-${index}`}
                  className="rounded-md bg-surface-100 px-2 py-1 text-xs text-navy-500"
                >
                  Unsupported content type
                </p>
              );
            }

            return (
              <ReactMarkdown
                key={`${message.id}-text-${index}`}
                remarkPlugins={[remarkGfm]}
                allowedElements={["p", "ul", "ol", "li", "strong", "em", "a", "code", "pre", "blockquote"]}
                components={{
                  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
                }}
              >
                {part.text}
              </ReactMarkdown>
            );
          })}
        </div>
      </article>
    </div>
  );
}
