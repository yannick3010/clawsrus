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
                return (
                  <p
                    key={`${message.id}-unsupported-${index}`}
                    className="rounded-md bg-surface-200 px-2 py-1 text-xs text-ink-500"
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
          <time className="mt-1.5 block text-right text-[11px] text-ink-400">
            {formatTime(message.timestamp)}
          </time>
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
              return (
                <p
                  key={`${message.id}-unsupported-${index}`}
                  className="rounded-md bg-surface-100 px-2 py-1 text-xs text-ink-500"
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
