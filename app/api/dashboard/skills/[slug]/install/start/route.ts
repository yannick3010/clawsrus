import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import { buildSkillStateForUser } from "@/lib/skills-entitlements";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(_req: Request, ctx: Params) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;

  try {
    const state = await buildSkillStateForUser({
      userId: auth.appUser.id,
      tier: auth.appUser.tier,
    });
    const entry = state.state.find((item) => item.skill.slug === slug);
    if (!entry) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (!entry.entitlement.has_access) {
      return NextResponse.json(
        { error: "Skill requires purchase", requires_purchase: true },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const existingSetupData = entry.install?.setup_data || {};
    const { error } = await supabase.from("user_skill_installs").upsert(
      {
        user_id: auth.appUser.id,
        skill_slug: slug,
        status: "setup_in_progress",
        setup_data: existingSetupData,
        updated_at: now,
      },
      { onConflict: "user_id,skill_slug" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      slug,
      status: "setup_in_progress",
      setup_schema: entry.skill.setup_schema,
      setup_data: existingSetupData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start skill setup" },
      { status: 500 }
    );
  }
}
