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
};

export default function ChatComposer({
  draft,
  onDraftChange,
  onSubmit,
  disabled,
  connected,
  busy,
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
    <form onSubmit={handleSubmit} className="border-t border-surface-200 bg-white px-3 pb-3 pt-2 sm:px-4">
      <div className="flex items-end gap-2 rounded-2xl border border-surface-200 bg-surface-50 p-2">
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message your assistant..."
          rows={1}
          className="focus-ring min-h-[44px] max-h-[160px] flex-1 resize-none rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm text-navy-700 placeholder:text-navy-400"
        />

        <button
          data-testid="chat-send"
          type="submit"
          disabled={disabled}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-navy-300"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-navy-400">
        <p>Press Enter to send. Shift + Enter for newline.</p>
        {!connected ? <p>Waiting for connection...</p> : busy ? <p>Assistant is responding...</p> : null}
      </div>
    </form>
  );
}
