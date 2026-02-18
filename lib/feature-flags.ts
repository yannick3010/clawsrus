export function isDashboardOnboardingEnabled(): boolean {
  // Enabled by default unless explicitly disabled.
  return process.env.DASHBOARD_ONBOARDING_V1 !== "false";
}

export function isNativeChatEnabled(): boolean {
  const value = process.env.NATIVE_CHAT_V1 ?? process.env.NEXT_PUBLIC_NATIVE_CHAT_V1;
  // Enabled by default unless explicitly disabled.
  return value !== "false";
}

export function isNativeSkillsEnabled(): boolean {
  const value = process.env.NATIVE_SKILLS_V1 ?? process.env.NEXT_PUBLIC_NATIVE_SKILLS_V1;
  // Disabled by default unless explicitly enabled.
  return value === "true";
}

export function getNativeSkillsAllowlist(): string[] {
  const raw = process.env.NEXT_PUBLIC_NATIVE_SKILLS_ALLOWLIST;
  if (!raw) {
    return [];
  }

  const items = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return [];
  }

  return Array.from(new Set(items));
}
