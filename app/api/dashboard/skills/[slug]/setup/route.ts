import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { getSkillBySlug } from "@/lib/skills-marketplace";
import { supabase } from "@/lib/supabase";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, ctx: Params) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  try {
    const body = (await req.json()) as {
      setup_data?: Record<string, unknown>;
    };
    const setupData =
      body.setup_data && typeof body.setup_data === "object" ? body.setup_data : null;

    if (!setupData) {
      return NextResponse.json({ error: "setup_data is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("user_skill_installs").upsert(
      {
        user_id: auth.appUser.id,
        skill_slug: slug,
        status: "setup_in_progress",
        setup_data: setupData,
        updated_at: now,
      },
      { onConflict: "user_id,skill_slug" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug, status: "setup_in_progress", setup_data: setupData });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
