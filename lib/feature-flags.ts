export function isDashboardOnboardingEnabled(): boolean {
  // Enabled by default unless explicitly disabled.
  return process.env.DASHBOARD_ONBOARDING_V1 !== "false";
}
