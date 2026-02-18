export function isDashboardOnboardingEnabled(): boolean {
  // Enabled by default unless explicitly disabled.
  return process.env.DASHBOARD_ONBOARDING_V1 !== "false";
}

export function isNativeChatEnabled(): boolean {
  const value = process.env.NATIVE_CHAT_V1 ?? process.env.NEXT_PUBLIC_NATIVE_CHAT_V1;
  // Enabled by default unless explicitly disabled.
  return value !== "false";
}
