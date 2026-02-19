"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

type ChatComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  disabled: boolean;
  connected: boolean;
  busy: boolean;
  phaseLabel?: string;
};

export default function ChatComposer({
  draft,
  onDraftChange,
  onSubmit,
  disabled,
  connected,
  busy,
  phaseLabel,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }

    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [draft]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) {
        void onSubmit();
      }
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      {/* Gradient fade so text doesn't cut off abruptly */}
      <div className="h-16 bg-gradient-to-t from-white to-transparent" />

      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto mx-4 mb-[calc(12px+env(safe-area-inset-bottom))] rounded-2xl border border-surface-200 bg-white shadow-surface-2 sm:mx-8 sm:mb-4 lg:mx-12"
      >
        <div className="flex items-end gap-2 px-3 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            data-testid="chat-input"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Reply..."
            rows={1}
            className="focus-ring min-h-[44px] max-h-[160px] flex-1 resize-none rounded-lg border-none bg-transparent px-1 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="flex items-center justify-between border-t border-surface-100 px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] text-ink-400">
            {!connected ? (
              <span>Waiting for connection...</span>
            ) : phaseLabel && phaseLabel !== "Ready" ? (
              <span>{phaseLabel}</span>
            ) : (
              <span>Enter to send</span>
            )}
          </div>
          <button
            data-testid="chat-send"
            type="submit"
            disabled={disabled}
            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:bg-ink-300"
            aria-label="Send message"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
