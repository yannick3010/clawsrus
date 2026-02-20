/**
 * Shared utility to strip openclaw metadata prefix from messages.
 *
 * The gateway prepends conversation context like:
 *   Conversation info (untrusted metadata):\n\n{...json...}\n[timestamp] actual text
 *
 * We extract just the actual user text after the timestamp bracket.
 */

const METADATA_HEADER = "Conversation info (untrusted metadata):";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

/**
 * Find the outermost JSON object in a string starting from `start`.
 * Properly handles nested braces.
 * Returns the JSON substring or null.
 */
function findJsonBlock(str: string, start: number): string | null {
  const open = str.indexOf("{", start);
  if (open === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = open; i < str.length; i++) {
    const ch = str[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return str.slice(open, i + 1);
      }
    }
  }

  return null;
}

/** Check if the metadata JSON indicates a Telegram-sourced message. */
export function detectSource(raw: string, jsonStr?: string): "telegram" | undefined {
  const block = jsonStr ?? findJsonBlock(raw, 0);
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
  if (!raw.startsWith(METADATA_HEADER)) {
    return { text: raw.trim() };
  }

  // --- Strategy 1: [timestamp] bracket after metadata ---
  // The primary pattern: header ... \n[timestamp] user text
  const withBracket = raw.match(
    /^Conversation info \(untrusted metadata\):[\s\S]*?\n\[.*?\]\s*([\s\S]*)$/
  );
  if (withBracket) {
    const source = detectSource(raw);
    return { text: withBracket[1].trim(), source };
  }

  // --- Strategy 2: proper JSON block parsing (handles nested braces) ---
  const jsonBlock = findJsonBlock(raw, METADATA_HEADER.length);
  if (jsonBlock) {
    const jsonEnd = raw.indexOf(jsonBlock) + jsonBlock.length;
    const source = detectSource(raw, jsonBlock);
    // Everything after the JSON block is the user message
    const rest = raw.slice(jsonEnd).trim();
    if (rest) {
      return { text: rest, source };
    }
    // JSON was the entire content — metadata only, no user text
    return { text: "", source };
  }

  // --- Strategy 3: aggressive fallback ---
  // Header is present but we couldn't parse the structure.
  // Try to find the first line that doesn't look like metadata.
  const lines = raw.split("\n");
  const textLines: string[] = [];
  let pastHeader = false;
  for (const line of lines) {
    if (!pastHeader) {
      // Skip the header line itself
      if (line.startsWith(METADATA_HEADER)) {
        pastHeader = true;
        continue;
      }
    }
    if (pastHeader) {
      // Skip empty lines and JSON-like lines between header and user text
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("{") || trimmed.startsWith("}") || trimmed.startsWith('"')) continue;
      // Once we hit a non-metadata line, take everything from here
      const idx = raw.indexOf(line);
      const rest = raw.slice(idx).trim();
      if (rest) {
        return { text: rest, source: detectSource(raw) };
      }
    }
    textLines.push(line);
  }

  // Nothing matched — log and return as-is (better than showing metadata)
  if (typeof console !== "undefined") {
    console.warn(
      "[strip-openclaw-metadata] Unrecognized metadata format, first 300 chars:",
      raw.slice(0, 300)
    );
  }
  return { text: raw.trim() };
}
