import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type SkillAction = "install" | "uninstall" | "lock" | "unlock";

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug.trim());
}

async function runSkillAction(params: {
  userId: string;
  action: SkillAction;
  skillSlug: string;
  sourceDir?: string;
}) {
  if (process.env.ENABLE_RUNTIME_PATCH !== "true") {
    return { updated: false, reason: "runtime_patch_disabled" } as const;
  }

  if (!isValidSlug(params.skillSlug)) {
    return { updated: false, reason: "invalid_skill_slug" } as const;
  }

  const args = ["./scripts/manage-skill.sh", params.userId, params.action, params.skillSlug];
  if (params.action === "install") {
    if (!params.sourceDir) {
      return { updated: false, reason: "source_dir_required" } as const;
    }
    args.push(params.sourceDir);
  }

  try {
    await execFileAsync("/bin/bash", args);
    return { updated: true } as const;
  } catch (error) {
    return {
      updated: false,
      reason: "runtime_skill_action_failed",
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}

export async function installRuntimeSkill(params: {
  userId: string;
  skillSlug: string;
  sourceDir: string;
}) {
  return runSkillAction({
    userId: params.userId,
    action: "install",
    skillSlug: params.skillSlug,
    sourceDir: params.sourceDir,
  });
}

export async function uninstallRuntimeSkill(params: { userId: string; skillSlug: string }) {
  return runSkillAction({
    userId: params.userId,
    action: "uninstall",
    skillSlug: params.skillSlug,
  });
}

export async function lockRuntimeSkill(params: { userId: string; skillSlug: string }) {
  return runSkillAction({
    userId: params.userId,
    action: "lock",
    skillSlug: params.skillSlug,
  });
}

export async function unlockRuntimeSkill(params: { userId: string; skillSlug: string }) {
  return runSkillAction({
    userId: params.userId,
    action: "unlock",
    skillSlug: params.skillSlug,
  });
}
