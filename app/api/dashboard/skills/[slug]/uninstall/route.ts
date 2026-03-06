import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { getSkillBySlug } from "@/lib/skills-marketplace";
import { supabase } from "@/lib/supabase";
import { uninstallRuntimeSkill } from "@/lib/runtime-skills";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(_req: Request, ctx: Params) {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const runtime = await uninstallRuntimeSkill({
    userId: auth.appUser.id,
    skillSlug: slug,
  });

  if (!runtime.updated) {
    await supabase
      .from("user_skill_installs")
      .update({
        status: "error",
        last_error: runtime.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", auth.appUser.id)
      .eq("skill_slug", slug);

    return NextResponse.json(
      { error: `Uninstall failed: ${runtime.reason}` },
      { status: 502 }
    );
  }

  const { error } = await supabase
    .from("user_skill_installs")
    .delete()
    .eq("user_id", auth.appUser.id)
    .eq("skill_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug, uninstalled: true });
}
