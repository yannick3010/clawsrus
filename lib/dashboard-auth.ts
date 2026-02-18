import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabase } from "@/lib/supabase";

export type AppUser = {
  id: string;
  email: string;
  persona: string;
  tier: string;
  status: string;
  container_id: string | null;
  auth_user_id: string | null;
  preferred_name: string | null;
  timezone: string | null;
  gateway_token: string | null;
};

const APP_USER_SELECT_WITH_GATEWAY_TOKEN =
  "id,email,persona,tier,status,container_id,auth_user_id,preferred_name,timezone,gateway_token";
const APP_USER_SELECT_LEGACY =
  "id,email,persona,tier,status,container_id,auth_user_id,preferred_name,timezone";

function isMissingGatewayTokenColumn(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = "code" in error ? String((error as { code?: unknown }).code || "") : "";
  const message =
    "message" in error ? String((error as { message?: unknown }).message || "") : "";
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.toLowerCase().includes("gateway_token")
  );
}

async function fetchAppUserByAuthId(authUserId: string, includeGatewayToken: boolean) {
  return supabase
    .from("users")
    .select(includeGatewayToken ? APP_USER_SELECT_WITH_GATEWAY_TOKEN : APP_USER_SELECT_LEGACY)
    .eq("auth_user_id", authUserId)
    .maybeSingle();
}

async function fetchAppUserByEmail(email: string, includeGatewayToken: boolean) {
  return supabase
    .from("users")
    .select(includeGatewayToken ? APP_USER_SELECT_WITH_GATEWAY_TOKEN : APP_USER_SELECT_LEGACY)
    .eq("email", email)
    .limit(1)
    .maybeSingle();
}

export async function getAuthenticatedAppUser(): Promise<{
  authUserId: string;
  authEmail: string;
  appUser: AppUser;
} | null> {
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user?.id || !user.email) {
    return null;
  }

  let includeGatewayToken = true;
  let { data: byAuthId, error: byAuthIdError } = await fetchAppUserByAuthId(
    user.id,
    includeGatewayToken
  );

  if (byAuthIdError && isMissingGatewayTokenColumn(byAuthIdError)) {
    includeGatewayToken = false;
    ({ data: byAuthId, error: byAuthIdError } = await fetchAppUserByAuthId(
      user.id,
      includeGatewayToken
    ));
  }

  if (byAuthIdError) {
    return null;
  }

  let appUser = byAuthId as AppUser | null;
  if (!appUser) {
    let { data: byEmail, error: byEmailError } = await fetchAppUserByEmail(
      user.email,
      includeGatewayToken
    );

    if (byEmailError && includeGatewayToken && isMissingGatewayTokenColumn(byEmailError)) {
      includeGatewayToken = false;
      ({ data: byEmail, error: byEmailError } = await fetchAppUserByEmail(
        user.email,
        includeGatewayToken
      ));
    }

    if (byEmailError || !byEmail) {
      return null;
    }
    appUser = {
      ...(byEmail as unknown as Omit<AppUser, "gateway_token">),
      gateway_token: null,
    };
  } else if (!includeGatewayToken) {
    appUser = {
      ...(appUser as unknown as Omit<AppUser, "gateway_token">),
      gateway_token: null,
    };
  }

  if (!appUser.auth_user_id) {
    await supabase
      .from("users")
      .update({ auth_user_id: user.id, updated_at: new Date().toISOString() })
      .eq("id", appUser.id);
    appUser.auth_user_id = user.id;
  }

  return {
    authUserId: user.id,
    authEmail: user.email,
    appUser: appUser as AppUser,
  };
}
