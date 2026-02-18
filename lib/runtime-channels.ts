import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function hasInvalidTelegramToken(token: string): boolean {
  const value = token.trim().toLowerCase();
  return value.length === 0 || value === "null" || value === "undefined";
}

export async function applyTelegramRuntimeConfig(params: {
  userId: string;
  botToken: string;
  botUsername: string;
}) {
  if (process.env.ENABLE_RUNTIME_PATCH !== "true") {
    return { updated: false, reason: "runtime_patch_disabled" } as const;
  }

  if (hasInvalidTelegramToken(params.botToken)) {
    return { updated: false, reason: "invalid_bot_token" } as const;
  }

  try {
    await execFileAsync("/bin/bash", [
      "./scripts/connect-telegram.sh",
      params.userId,
      params.botToken,
      params.botUsername,
    ]);

    return { updated: true } as const;
  } catch (error) {
    return {
      updated: false,
      reason: "runtime_patch_failed",
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}

export async function removeTelegramRuntimeConfig(userId: string) {
  if (process.env.ENABLE_RUNTIME_PATCH !== "true") {
    return { updated: false, reason: "runtime_patch_disabled" } as const;
  }

  try {
    await execFileAsync("/bin/bash", ["./scripts/connect-telegram.sh", userId, "--disconnect"]);
    return { updated: true } as const;
  } catch (error) {
    return {
      updated: false,
      reason: "runtime_patch_failed",
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}
