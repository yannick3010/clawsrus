import { supabase } from "@/lib/supabase";
import {
  canInstallSkill,
  getCatalogSkills,
  getOwnedSkillSlugs,
  getUserSubscriptionSnapshot,
  getUserSkillInstalls,
  type SkillCatalogItem,
  type UserSkillEntitlement,
  type UserSkillInstall,
} from "@/lib/skills-marketplace";
import { isAllInclusivePaidPlan } from "@/lib/plans";
import { lockRuntimeSkill, unlockRuntimeSkill } from "@/lib/runtime-skills";

export type SkillWithUserState = {
  skill: SkillCatalogItem;
  entitlement: UserSkillEntitlement;
  install: UserSkillInstall | null;
};

export async function buildSkillStateForUser(params: {
  userId: string;
  tier: string;
}) {
  const [catalog, ownedSkills, installs, subscriptionSnapshot] = await Promise.all([
    getCatalogSkills(),
    getOwnedSkillSlugs(params.userId),
    getUserSkillInstalls(params.userId),
    getUserSubscriptionSnapshot(params.userId),
  ]);

  const subscriptionStatus = subscriptionSnapshot?.status ?? null;
  const planCode = isAllInclusivePaidPlan({
    planCode: "pro",
    subscriptionStatus,
  })
    ? "pro"
    : "free";

  const state: SkillWithUserState[] = catalog.map((skill) => {
    const entitlement = canInstallSkill({
      planCode,
      subscriptionStatus,
      ownedPaidSkills: ownedSkills,
      skill,
    });
    const install = installs.get(skill.slug) || null;
    return { skill, entitlement, install };
  });

  return {
    planCode,
    subscriptionStatus,
    trialEndsAt: subscriptionSnapshot?.current_period_end ?? null,
    trialExpired: subscriptionSnapshot?.trial_expired ?? false,
    state,
  };
}

export async function reconcileLockedSkillsForUser(params: {
  userId: string;
  state: SkillWithUserState[];
}) {
  for (const entry of params.state) {
    const install = entry.install;
    if (!install) {
      continue;
    }

    if (entry.skill.is_paid && !entry.entitlement.has_access && install.status !== "locked") {
      const runtime = await lockRuntimeSkill({
        userId: params.userId,
        skillSlug: entry.skill.slug,
      });

      await supabase
        .from("user_skill_installs")
        .update({
          status: "locked",
          locked_at: new Date().toISOString(),
          last_error: runtime.updated ? null : `Lock warning: ${runtime.reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", params.userId)
        .eq("skill_slug", entry.skill.slug);

      entry.install = {
        ...install,
        status: "locked",
        last_error: runtime.updated ? null : `Lock warning: ${runtime.reason}`,
      };
      continue;
    }

    if (install.status === "locked" && entry.entitlement.has_access) {
      const runtime = await unlockRuntimeSkill({
        userId: params.userId,
        skillSlug: entry.skill.slug,
      });
      const nextStatus = install.installed_at ? "active" : "ready_to_activate";

      await supabase
        .from("user_skill_installs")
        .update({
          status: nextStatus,
          locked_at: null,
          last_error: runtime.updated ? null : `Unlock warning: ${runtime.reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", params.userId)
        .eq("skill_slug", entry.skill.slug);

      entry.install = {
        ...install,
        status: nextStatus,
        last_error: runtime.updated ? null : `Unlock warning: ${runtime.reason}`,
      };
    }
  }
}
