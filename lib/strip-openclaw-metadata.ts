/**
 * Shared utility to strip openclaw metadata prefix from messages.
 *
 * The gateway prepends conversation context like:
 *   Conversation info (untrusted metadata):\n\n{...json...}\n[timestamp] actual text
 *
 * We extract just the actual user text after the timestamp bracket.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

/** Check if the metadata JSON indicates a Telegram-sourced message. */
export function detectSource(raw: string, jsonStr?: string): "telegram" | undefined {
  const block = jsonStr ?? raw.match(/\{[\s\S]*?\}/)?.[0];
  if (!block) return undefined;
  try {
    const parsed = JSON.parse(block);
    if (
      isRecord(parsed) &&
      typeof parsed.message_id === "string" &&
      typeof parsed.sender === "string"
    ) {
      return "telegram";
    }
  } catch {
    // not valid JSON – ignore
  }
  return undefined;
}

/**
 * Strip openclaw metadata prefix from a message string.
 *
 * Returns the cleaned text plus an optional source (e.g. "telegram") detected
 * from the metadata JSON.
 */
export function stripOpenclawMetadata(raw: string): { text: string; source?: "telegram" } {
  // Primary: original regex that expects a [timestamp] bracket after the JSON block
  const withBracket = raw.match(
    /^Conversation info \(untrusted metadata\):[\s\S]*?\n\[.*?\]\s*([\s\S]*)$/
  );
  if (withBracket) {
    const source = detectSource(raw);
    return { text: withBracket[1].trim(), source };
  }

  // Fallback: metadata header + JSON block without a [timestamp] bracket
  const fallback = raw.match(
    /^Conversation info \(untrusted metadata\):\s*\n\s*(\{[\s\S]*?\})\s*\n([\s\S]*)$/
  );
  if (fallback) {
    const source = detectSource(raw, fallback[1]);
    return { text: fallback[2].trim(), source };
  }

  return { text: raw.trim() };
}
