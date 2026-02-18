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
};

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

  const { data: byAuthId, error: byAuthIdError } = await supabase
    .from("users")
    .select(
      "id,email,persona,tier,status,container_id,auth_user_id,preferred_name,timezone"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (byAuthIdError) {
    return null;
  }

  let appUser = byAuthId as AppUser | null;
  if (!appUser) {
    const { data: byEmail, error: byEmailError } = await supabase
      .from("users")
      .select(
        "id,email,persona,tier,status,container_id,auth_user_id,preferred_name,timezone"
      )
      .eq("email", user.email)
      .limit(1)
      .maybeSingle();

    if (byEmailError || !byEmail) {
      return null;
    }
    appUser = byEmail as AppUser;
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
