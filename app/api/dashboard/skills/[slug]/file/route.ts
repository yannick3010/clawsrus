import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import { getSkillBySlug, resolveSkillPaths } from "@/lib/skills-marketplace";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, ctx: Params) {
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
    const { skillFile } = resolveSkillPaths(skill);
    const content = await readFile(skillFile, "utf8");
    return NextResponse.json({
      slug: skill.slug,
      name: skill.name,
      content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read skill file" },
      { status: 500 }
    );
  }
}
