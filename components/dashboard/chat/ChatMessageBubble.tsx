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

  if (isUser) {
    return (
      <div
        data-testid="chat-message"
        data-role="user"
        className={`flex justify-end ${compact ? "mt-1" : "mt-5"}`}
      >
        <article className="max-w-[85%] rounded-2xl bg-surface-100 px-4 py-3 sm:max-w-[75%]">
          <div className="chat-markdown text-ink-700">
            {message.parts.map((part, index) => {
              if (part.kind !== "text") {
                return null;
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
          <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-400">
            {message.source === "telegram" && (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3 w-3"
                aria-label="Sent from Telegram"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            )}
            <time>{formatTime(message.timestamp)}</time>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div
      data-testid="chat-message"
      data-role="assistant"
      className={`${compact ? "mt-1" : "mt-5"}`}
    >
      <article className="group max-w-[92%] sm:max-w-[86%]">
        <div className="chat-markdown">
          {message.parts.map((part, index) => {
            if (part.kind !== "text") {
              return null;
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

        <div className="mt-1.5 flex items-center gap-2">
          <time className="text-[11px] text-ink-400">
            {formatTime(message.timestamp)}
          </time>
          {!isStreaming ? (
            <button
              type="button"
              onClick={() => void copyMessage()}
              className="focus-ring rounded-md p-1 text-ink-300 opacity-0 transition group-hover:opacity-100 hover:bg-surface-100 hover:text-ink-600"
              aria-label="Copy assistant response"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}
