import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: auth.appUser.email,
    preferred_name: auth.appUser.preferred_name,
    timezone: auth.appUser.timezone || "UTC",
    persona: auth.appUser.persona,
    tier: auth.appUser.tier,
    status: auth.appUser.status,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      preferred_name?: string;
      timezone?: string;
    };

    const preferred_name = body.preferred_name?.trim() || null;
    const timezone = body.timezone?.trim() || "UTC";

    const { data, error } = await supabase
      .from("users")
      .update({
        preferred_name,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.appUser.id)
      .select("email,preferred_name,timezone,persona,tier,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
