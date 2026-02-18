type StripeErrorShape = {
  type?: string;
  code?: string;
};

export function isMissingCheckoutSession(error: unknown): boolean {
  const candidate = error as StripeErrorShape | null;
  return (
    !!candidate &&
    candidate.type === "StripeInvalidRequestError" &&
    candidate.code === "resource_missing"
  );
}
