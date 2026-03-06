import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";
import { buildSkillStateForUser } from "@/lib/skills-entitlements";
import {
  getSkillBySlug,
  getUserSkillInstalls,
  resolveSkillPaths,
  type SkillSetupField,
} from "@/lib/skills-marketplace";
import { installRuntimeSkill } from "@/lib/runtime-skills";

type Params = {
  params: Promise<{ slug: string }>;
};

function validateSetupData(requiredSchema: SkillSetupField[], setupData: Record<string, unknown>) {
  const missing: string[] = [];
  for (const field of requiredSchema) {
    if (!field.required) {
      continue;
    }
    const value = setupData[field.id];
    if (typeof value !== "string" || !value.trim()) {
      missing.push(field.id);
    }
  }
  return missing;
}

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

    const body = (await req.json().catch(() => ({}))) as {
      setup_data?: Record<string, unknown>;
    };

    const installs = await getUserSkillInstalls(auth.appUser.id);
    const existing = installs.get(slug);
    const setupData = {
      ...(existing?.setup_data || {}),
      ...(body.setup_data && typeof body.setup_data === "object" ? body.setup_data : {}),
    };

    const missing = validateSetupData(skill.setup_schema, setupData);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "Setup is incomplete",
          missing_fields: missing,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { sourceDir } = resolveSkillPaths(skill);
    const runtime = await installRuntimeSkill({
      userId: auth.appUser.id,
      skillSlug: slug,
      sourceDir,
    });

    if (!runtime.updated) {
      await supabase.from("user_skill_installs").upsert(
        {
          user_id: auth.appUser.id,
          skill_slug: slug,
          status: "error",
          setup_data: setupData,
          last_error: runtime.reason,
          updated_at: now,
        },
        { onConflict: "user_id,skill_slug" }
      );
      return NextResponse.json(
        { error: `Install failed: ${runtime.reason}` },
        { status: 502 }
      );
    }

    const { error } = await supabase.from("user_skill_installs").upsert(
      {
        user_id: auth.appUser.id,
        skill_slug: slug,
        status: "active",
        setup_data: setupData,
        last_error: null,
        installed_at: now,
        locked_at: null,
        updated_at: now,
      },
      { onConflict: "user_id,skill_slug" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      slug,
      status: "active",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete install" },
      { status: 500 }
    );
  }
}
