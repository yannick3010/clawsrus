import { NextResponse } from "next/server";
import { getAuthenticatedAppUser } from "@/lib/dashboard-auth";
import {
  buildSkillStateForUser,
  reconcileLockedSkillsForUser,
} from "@/lib/skills-entitlements";

export async function GET() {
  const auth = await getAuthenticatedAppUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const skillState = await buildSkillStateForUser({
      userId: auth.appUser.id,
      tier: auth.appUser.tier,
    });

    await reconcileLockedSkillsForUser({
      userId: auth.appUser.id,
      state: skillState.state,
    });

    const skills = skillState.state.map((entry) => {
      const installStatus = entry.install?.status || null;
      const installExists = Boolean(entry.install);
      return {
        slug: entry.skill.slug,
        name: entry.skill.name,
        category: entry.skill.category,
        summary: entry.skill.summary,
        is_paid: entry.skill.is_paid,
        price_cents: entry.skill.price_cents,
        setup_schema: entry.skill.setup_schema,
        entitlement: entry.entitlement,
        install: entry.install,
        actions: {
          can_install: entry.entitlement.has_access,
          can_purchase: entry.skill.is_paid && !entry.entitlement.has_access,
          can_uninstall:
            installExists &&
            installStatus !== "setup_in_progress" &&
            installStatus !== "ready_to_activate",
        },
      };
    });

    const summary = {
      total: skills.length,
      installed: skills.filter((item) => Boolean(item.install)).length,
      active: skills.filter((item) => item.install?.status === "active").length,
      locked: skills.filter((item) => item.install?.status === "locked").length,
    };

    return NextResponse.json({
      plan_code: skillState.planCode,
      subscription_status: skillState.subscriptionStatus,
      trial_ends_at: skillState.trialEndsAt,
      trial_expired: skillState.trialExpired,
      summary,
      skills,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load skills" },
      { status: 500 }
    );
  }
}
