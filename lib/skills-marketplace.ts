import path from "node:path";
import { readdir } from "node:fs/promises";
import { supabase } from "@/lib/supabase";
import { isAllInclusivePaidPlan, normalizePlanCode, type PlanCode, type SubscriptionStatus } from "@/lib/plans";

export type SkillSetupField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
};

export type SkillCatalogItem = {
  slug: string;
  name: string;
  category: string;
  is_paid: boolean;
  price_cents: number;
  stripe_price_id: string | null;
  source_dir: string;
  skill_md_path: string;
  summary: string;
  setup_schema: SkillSetupField[];
  active: boolean;
};

export type UserSkillInstallState =
  | "setup_in_progress"
  | "ready_to_activate"
  | "active"
  | "locked"
  | "error";

export type UserSkillInstall = {
  skill_slug: string;
  status: UserSkillInstallState;
  setup_data: Record<string, unknown>;
  installed_at: string | null;
  updated_at: string | null;
  last_error: string | null;
};

export type UserSkillEntitlement = {
  slug: string;
  has_access: boolean;
  requires_purchase: boolean;
  reason: "free" | "purchased" | "pro_inclusive" | "not_entitled";
};

export type UserSubscriptionSnapshot = {
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_expired: boolean;
};

const FREE_LIBRARY_ROOT = path.resolve(process.cwd(), "skill-library/free");

function titleFromSlug(slug: string) {
  return slug
    .replace(/^openclaw-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseSetupSchema(value: unknown): SkillSetupField[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const rows: Array<SkillSetupField | null> = value.map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const obj = entry as Record<string, unknown>;
      const id = typeof obj.id === "string" ? obj.id.trim() : "";
      const label = typeof obj.label === "string" ? obj.label.trim() : "";
      const type = typeof obj.type === "string" ? obj.type : "text";
      const required = obj.required === true;
      const options = Array.isArray(obj.options)
        ? obj.options.filter((item): item is string => typeof item === "string")
        : undefined;

      if (!id || !label) {
        return null;
      }

      if (!["text", "textarea", "select"].includes(type)) {
        return null;
      }

      const parsed: SkillSetupField = {
        id,
        label,
        type: type as SkillSetupField["type"],
        required,
        ...(options ? { options } : {}),
      };
      return parsed;
    });

  return rows.filter((entry): entry is SkillSetupField => entry !== null);
}

export async function getCatalogSkills(): Promise<SkillCatalogItem[]> {
  const { data, error } = await supabase
    .from("skills_catalog")
    .select(
      "slug,name,category,is_paid,price_cents,stripe_price_id,source_dir,skill_md_path,summary,setup_schema,active"
    )
    .eq("active", true)
    .order("is_paid", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    throw error;
  }

  const dbRows = ((data || []) as Array<Record<string, unknown>>).map((row) => ({
    slug: String(row.slug || ""),
    name: String(row.name || ""),
    category: String(row.category || "general"),
    is_paid: row.is_paid === true,
    price_cents: Number(row.price_cents || 0),
    stripe_price_id: typeof row.stripe_price_id === "string" ? row.stripe_price_id : null,
    source_dir: String(row.source_dir || ""),
    skill_md_path: String(row.skill_md_path || ""),
    summary: String(row.summary || ""),
    setup_schema: parseSetupSchema(row.setup_schema),
    active: row.active === true,
  }));

  const discovered = await discoverFreeLibrarySkills();
  const existing = new Set(dbRows.map((row) => row.slug));
  const discoveredMissing: SkillCatalogItem[] = [];
  for (const skill of discovered) {
    if (!existing.has(skill.slug)) {
      dbRows.push(skill);
      discoveredMissing.push(skill);
    }
  }

  if (discoveredMissing.length > 0) {
    const { error: upsertError } = await supabase.from("skills_catalog").upsert(
      discoveredMissing.map((skill) => ({
        slug: skill.slug,
        name: skill.name,
        category: skill.category,
        is_paid: skill.is_paid,
        price_cents: skill.price_cents,
        stripe_price_id: skill.stripe_price_id,
        source_dir: skill.source_dir,
        skill_md_path: skill.skill_md_path,
        summary: skill.summary,
        setup_schema: skill.setup_schema,
        active: skill.active,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "slug" }
    );
    if (upsertError && upsertError.code !== "42P01") {
      throw upsertError;
    }
  }

  return dbRows.sort((a, b) => {
    if (a.is_paid === b.is_paid) {
      return a.name.localeCompare(b.name);
    }
    return a.is_paid ? 1 : -1;
  });
}

export async function getSkillBySlug(slug: string): Promise<SkillCatalogItem | null> {
  const { data, error } = await supabase
    .from("skills_catalog")
    .select(
      "slug,name,category,is_paid,price_cents,stripe_price_id,source_dir,skill_md_path,summary,setup_schema,active"
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return null;
    }
    throw error;
  }

  if (!data) {
    const discovered = await discoverFreeLibrarySkills();
    return discovered.find((skill) => skill.slug === slug) || null;
  }

  const row = data as Record<string, unknown>;
  return {
    slug: String(row.slug || ""),
    name: String(row.name || ""),
    category: String(row.category || "general"),
    is_paid: row.is_paid === true,
    price_cents: Number(row.price_cents || 0),
    stripe_price_id: typeof row.stripe_price_id === "string" ? row.stripe_price_id : null,
    source_dir: String(row.source_dir || ""),
    skill_md_path: String(row.skill_md_path || ""),
    summary: String(row.summary || ""),
    setup_schema: parseSetupSchema(row.setup_schema),
    active: row.active === true,
  };
}

async function discoverFreeLibrarySkills(): Promise<SkillCatalogItem[]> {
  let dirEntries: string[] = [];
  try {
    const rows = await readdir(FREE_LIBRARY_ROOT, { withFileTypes: true });
    dirEntries = rows.filter((row) => row.isDirectory()).map((row) => row.name);
  } catch {
    return [];
  }

  return dirEntries.map((dirName) => {
    const slug = dirName.trim().toLowerCase();
    const source = path.join("skill-library", "free", dirName);
    return {
      slug,
      name: titleFromSlug(slug),
      category: "openclaw-free",
      is_paid: false,
      price_cents: 0,
      stripe_price_id: null,
      source_dir: source,
      skill_md_path: path.join(source, "SKILL.md"),
      summary: "OpenClaw free skill mirrored into the ClawsRUs marketplace.",
      setup_schema: [],
      active: true,
    };
  });
}

export async function getUserSubscriptionSnapshot(
  userId: string
): Promise<UserSubscriptionSnapshot | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status,current_period_start,current_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return null;
    }
    throw error;
  }

  if (!data || typeof data.status !== "string") {
    return null;
  }

  const status = data.status as SubscriptionStatus;
  if (!["active", "trialing", "past_due", "canceled"].includes(status)) {
    return null;
  }

  const currentPeriodStart =
    typeof data.current_period_start === "string" ? data.current_period_start : null;
  const currentPeriodEnd =
    typeof data.current_period_end === "string" ? data.current_period_end : null;

  const now = Date.now();
  const trialExpired =
    status === "trialing" &&
    typeof currentPeriodEnd === "string" &&
    Number.isFinite(Date.parse(currentPeriodEnd)) &&
    Date.parse(currentPeriodEnd) <= now;

  if (trialExpired) {
    const nowIso = new Date().toISOString();
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: nowIso,
      })
      .eq("user_id", userId)
      .eq("status", "trialing")
      .lte("current_period_end", nowIso);

    await supabase
      .from("users")
      .update({
        tier: "free",
        updated_at: nowIso,
      })
      .eq("id", userId)
      .eq("tier", "pro");

    return {
      status: "canceled",
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      trial_expired: true,
    };
  }

  return {
    status,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    trial_expired: false,
  };
}

export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  const snapshot = await getUserSubscriptionSnapshot(userId);
  return snapshot?.status ?? null;
}

export async function getOwnedSkillSlugs(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_skill_purchases")
    .select("skill_slug")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42P01") {
      return new Set();
    }
    throw error;
  }

  const set = new Set<string>();
  for (const row of (data || []) as Array<{ skill_slug?: unknown }>) {
    if (typeof row.skill_slug === "string" && row.skill_slug.trim()) {
      set.add(row.skill_slug);
    }
  }
  return set;
}

export async function getUserSkillInstalls(userId: string): Promise<Map<string, UserSkillInstall>> {
  const { data, error } = await supabase
    .from("user_skill_installs")
    .select("skill_slug,status,setup_data,installed_at,updated_at,last_error")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42P01") {
      return new Map();
    }
    throw error;
  }

  const map = new Map<string, UserSkillInstall>();
  for (const row of (data || []) as Array<Record<string, unknown>>) {
    const slug = typeof row.skill_slug === "string" ? row.skill_slug : "";
    if (!slug) {
      continue;
    }
    const statusRaw = typeof row.status === "string" ? row.status : "error";
    const status = (
      ["setup_in_progress", "ready_to_activate", "active", "locked", "error"].includes(statusRaw)
        ? statusRaw
        : "error"
    ) as UserSkillInstallState;

    map.set(slug, {
      skill_slug: slug,
      status,
      setup_data:
        row.setup_data && typeof row.setup_data === "object"
          ? (row.setup_data as Record<string, unknown>)
          : {},
      installed_at: typeof row.installed_at === "string" ? row.installed_at : null,
      updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
      last_error: typeof row.last_error === "string" ? row.last_error : null,
    });
  }
  return map;
}

export function canInstallSkill(params: {
  planCode: PlanCode;
  subscriptionStatus?: SubscriptionStatus | null;
  ownedPaidSkills: Set<string>;
  skill: SkillCatalogItem;
}): UserSkillEntitlement {
  if (!params.skill.is_paid) {
    return {
      slug: params.skill.slug,
      has_access: true,
      requires_purchase: false,
      reason: "free",
    };
  }

  if (isAllInclusivePaidPlan({
    planCode: params.planCode,
    subscriptionStatus: params.subscriptionStatus ?? null,
  })) {
    return {
      slug: params.skill.slug,
      has_access: true,
      requires_purchase: false,
      reason: "pro_inclusive",
    };
  }

  if (params.ownedPaidSkills.has(params.skill.slug)) {
    return {
      slug: params.skill.slug,
      has_access: true,
      requires_purchase: false,
      reason: "purchased",
    };
  }

  return {
    slug: params.skill.slug,
    has_access: false,
    requires_purchase: true,
    reason: "not_entitled",
  };
}

function safeResolvedPath(relativePath: string): string {
  const normalized = relativePath.trim().replace(/^\/+/, "");
  const resolved = path.resolve(process.cwd(), normalized);
  const root = path.resolve(process.cwd());

  if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
    throw new Error("Invalid skill path");
  }
  return resolved;
}

export function resolveSkillPaths(skill: SkillCatalogItem) {
  const sourceDir = safeResolvedPath(skill.source_dir);
  const skillFile = safeResolvedPath(skill.skill_md_path);
  return { sourceDir, skillFile };
}

export function normalizeUserPlan(tier: string | null | undefined) {
  return normalizePlanCode(tier);
}

export function resolveSkillStripePriceId(skill: SkillCatalogItem): string | null {
  if (skill.stripe_price_id && skill.stripe_price_id.trim()) {
    return skill.stripe_price_id.trim();
  }

  const envKey = `STRIPE_PRICE_SKILL_${skill.slug.replace(/-/g, "_").toUpperCase()}`;
  const fromEnv = process.env[envKey];
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return null;
}
