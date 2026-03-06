export type PlanCode = "free" | "pro";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export function normalizePlanCode(raw: string | null | undefined): PlanCode {
  const value = (raw || "").trim().toLowerCase();
  if (value === "pro" || value === "concierge" || value === "agency" || value === "enterprise") {
    return "pro";
  }
  return "free";
}

export function isAllInclusivePaidPlan(params: {
  planCode: PlanCode;
  subscriptionStatus?: SubscriptionStatus | null;
}) {
  if (params.planCode !== "pro") {
    return false;
  }

  return params.subscriptionStatus === "active" || params.subscriptionStatus === "trialing";
}
