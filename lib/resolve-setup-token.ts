import { stripe } from "@/lib/stripe";

export type ResolveResult = {
  setup_token: string;
  payment_confirmed: boolean;
} | null;

export async function resolveSetupToken(params: {
  setup_token?: string;
  session_id?: string;
}): Promise<ResolveResult> {
  if (params.setup_token) return { setup_token: params.setup_token, payment_confirmed: false };
  if (!params.session_id) return null;
  const session = await stripe.checkout.sessions.retrieve(params.session_id);
  const token = session.metadata?.setup_token;
  if (!token) return null;
  return { setup_token: token, payment_confirmed: session.payment_status === "paid" };
}
