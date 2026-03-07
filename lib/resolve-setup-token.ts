import { stripe } from "@/lib/stripe";

export async function resolveSetupToken(params: {
  setup_token?: string;
  session_id?: string;
}): Promise<string | null> {
  if (params.setup_token) return params.setup_token;
  if (!params.session_id) return null;
  const session = await stripe.checkout.sessions.retrieve(params.session_id);
  return session.metadata?.setup_token || null;
}
