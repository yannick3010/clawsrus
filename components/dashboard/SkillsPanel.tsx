"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Lock, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SkillsSummary } from "@/components/dashboard/types";

type SkillsPanelProps = {
  variant?: "card" | "embedded";
  onSummaryChange?: (summary: SkillsSummary) => void;
};

type SkillSetupField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
};

type SkillEntry = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  is_paid: boolean;
  price_cents: number;
  setup_schema: SkillSetupField[];
  entitlement: {
    has_access: boolean;
    requires_purchase: boolean;
    reason: "free" | "purchased" | "pro_inclusive" | "not_entitled";
  };
  install: {
    status: "setup_in_progress" | "ready_to_activate" | "active" | "locked" | "error";
    setup_data: Record<string, string>;
    last_error?: string | null;
  } | null;
  actions: {
    can_install: boolean;
    can_purchase: boolean;
    can_uninstall: boolean;
  };
};

type SkillsResponse = {
  plan_code: "free" | "pro";
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | null;
  trial_ends_at: string | null;
  trial_expired: boolean;
  summary: {
    total: number;
    installed: number;
    active: number;
    locked: number;
  };
  skills: SkillEntry[];
};

type SkillFileResponse = {
  slug: string;
  name: string;
  content: string;
};

type FilterId = "all" | "free" | "paid" | "installed" | "locked";

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "installed", label: "Installed" },
  { id: "locked", label: "Locked" },
];

export default function SkillsPanel({
  variant = "card",
  onSummaryChange,
}: SkillsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SkillsResponse | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [fileViewer, setFileViewer] = useState<{
    open: boolean;
    loading: boolean;
    skillName: string;
    content: string;
  }>({
    open: false,
    loading: false,
    skillName: "",
    content: "",
  });
  const [setupWizard, setSetupWizard] = useState<{
    open: boolean;
    slug: string;
    name: string;
    schema: SkillSetupField[];
    setupData: Record<string, string>;
    saving: boolean;
    completing: boolean;
    error: string;
  }>({
    open: false,
    slug: "",
    name: "",
    schema: [],
    setupData: {},
    saving: false,
    completing: false,
    error: "",
  });

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/dashboard/skills", { cache: "no-store" });
      const data = (await res.json()) as SkillsResponse & { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to load skills");
        setResponse(null);
        return;
      }
      setResponse(data as SkillsResponse);
    } catch {
      setError("Failed to load skills");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    onSummaryChange?.({
      loading,
      error,
      total: response?.summary.total || 0,
      installed: response?.summary.installed || 0,
      active: response?.summary.active || 0,
      locked: response?.summary.locked || 0,
    });
  }, [error, loading, onSummaryChange, response]);

  const visibleSkills = useMemo(() => {
    const skills = response?.skills || [];
    if (activeFilter === "all") return skills;
    if (activeFilter === "free") return skills.filter((skill) => !skill.is_paid);
    if (activeFilter === "paid") return skills.filter((skill) => skill.is_paid);
    if (activeFilter === "installed") return skills.filter((skill) => Boolean(skill.install));
    if (activeFilter === "locked") return skills.filter((skill) => skill.install?.status === "locked");
    return skills;
  }, [activeFilter, response]);

  async function openSkillFile(skill: SkillEntry) {
    setFileViewer({
      open: true,
      loading: true,
      skillName: skill.name,
      content: "",
    });
    try {
      const res = await fetch(`/api/dashboard/skills/${encodeURIComponent(skill.slug)}/file`, {
        cache: "no-store",
      });
      const data = (await res.json()) as SkillFileResponse & { error?: string };
      if (!res.ok) {
        setFileViewer((prev) => ({
          ...prev,
          loading: false,
          content: data.error || "Failed to load skill file.",
        }));
        return;
      }
      setFileViewer({
        open: true,
        loading: false,
        skillName: data.name,
        content: data.content,
      });
    } catch {
      setFileViewer((prev) => ({
        ...prev,
        loading: false,
        content: "Failed to load skill file.",
      }));
    }
  }

  async function startInstall(skill: SkillEntry) {
    setBusySlug(skill.slug);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/skills/${encodeURIComponent(skill.slug)}/install/start`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        setup_schema?: SkillSetupField[];
        setup_data?: Record<string, string>;
      };
      if (!res.ok) {
        setError(data.error || "Could not start skill setup");
        return;
      }
      setSetupWizard({
        open: true,
        slug: skill.slug,
        name: skill.name,
        schema: data.setup_schema || [],
        setupData: data.setup_data || {},
        saving: false,
        completing: false,
        error: "",
      });
      await loadSkills();
    } finally {
      setBusySlug(null);
    }
  }

  async function saveSetupProgress() {
    setSetupWizard((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      const res = await fetch(`/api/dashboard/skills/${encodeURIComponent(setupWizard.slug)}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup_data: setupWizard.setupData }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSetupWizard((prev) => ({
          ...prev,
          saving: false,
          error: data.error || "Failed to save setup",
        }));
        return;
      }
      setSetupWizard((prev) => ({ ...prev, saving: false, error: "" }));
      await loadSkills();
    } catch {
      setSetupWizard((prev) => ({
        ...prev,
        saving: false,
        error: "Failed to save setup",
      }));
    }
  }

  async function completeInstall() {
    setSetupWizard((prev) => ({ ...prev, completing: true, error: "" }));
    try {
      const res = await fetch(
        `/api/dashboard/skills/${encodeURIComponent(setupWizard.slug)}/install/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup_data: setupWizard.setupData }),
        }
      );
      const data = (await res.json()) as { error?: string; missing_fields?: string[] };
      if (!res.ok) {
        const missing = Array.isArray(data.missing_fields) ? ` (${data.missing_fields.join(", ")})` : "";
        setSetupWizard((prev) => ({
          ...prev,
          completing: false,
          error: (data.error || "Failed to install skill") + missing,
        }));
        return;
      }
      setSetupWizard({
        open: false,
        slug: "",
        name: "",
        schema: [],
        setupData: {},
        saving: false,
        completing: false,
        error: "",
      });
      await loadSkills();
    } catch {
      setSetupWizard((prev) => ({
        ...prev,
        completing: false,
        error: "Failed to install skill",
      }));
    }
  }

  async function uninstallSkill(skill: SkillEntry) {
    setBusySlug(skill.slug);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/skills/${encodeURIComponent(skill.slug)}/uninstall`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to uninstall skill");
        return;
      }
      await loadSkills();
    } finally {
      setBusySlug(null);
    }
  }

  async function purchaseSkill(skill: SkillEntry) {
    setBusySlug(skill.slug);
    setError("");
    try {
      const res = await fetch(`/api/billing/skills/${encodeURIComponent(skill.slug)}/checkout`, {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Failed to start checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <section
      className={
        variant === "embedded"
          ? "overflow-hidden rounded-xl border border-surface-200 bg-white"
          : "overflow-hidden rounded-xl border border-surface-200 bg-white"
      }
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div>
          {variant === "card" ? <h3 className="text-sm font-semibold text-ink-700">Skills</h3> : null}
          <p className="text-xs text-ink-400">
            {response
              ? `${response.plan_code.toUpperCase()} plan${
                  response.subscription_status ? ` · Subscription: ${response.subscription_status}` : ""
                }`
              : "Skills marketplace"}
          </p>
        </div>
        <button
          onClick={() => void loadSkills()}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="space-y-3 p-4" data-testid="native-skills-panel">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                activeFilter === filter.id
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-4 text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : null}

        {!loading && visibleSkills.length === 0 ? (
          <p className="text-xs text-ink-400">
            No skills match this filter.
          </p>
        ) : null}

        {!loading
          ? visibleSkills.map((skill) => {
              const isBusy = busySlug === skill.slug;
              const priceLabel = skill.is_paid ? `$${(skill.price_cents / 100).toFixed(2)}` : "Free";

              return (
                <div
                  key={skill.slug}
                  data-testid={`skills-row-${skill.slug}`}
                  className="rounded-xl border border-ink-100 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink-700">{skill.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            skill.is_paid
                              ? "bg-amber-50 text-amber-700"
                              : "bg-brand-50 text-brand-700"
                          }`}
                        >
                          {priceLabel}
                        </span>
                        {skill.install?.status ? (
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                            {skill.install.status}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-ink-500">{skill.summary}</p>
                    </div>
                  </div>

                  {skill.install?.status === "locked" ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700">
                      <Lock className="h-3 w-3" />
                      Locked until purchased or Pro subscription is active.
                    </p>
                  ) : null}

                  {skill.install?.last_error ? (
                    <p className="mt-2 text-xs text-red-600">{skill.install.last_error}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openSkillFile(skill)}
                      className="focus-ring inline-flex items-center gap-1 rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 hover:border-ink-300"
                    >
                      <FileText className="h-3 w-3" />
                      View SKILL.md
                    </button>

                    {skill.actions.can_purchase ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void purchaseSkill(skill)}
                        className="focus-ring rounded-full bg-ink-800 px-3 py-1 text-xs font-semibold text-white hover:bg-ink-700 disabled:opacity-50"
                      >
                        {isBusy ? "Starting..." : `Buy ${priceLabel}`}
                      </button>
                    ) : null}

                    {skill.actions.can_install ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void startInstall(skill)}
                        className="focus-ring rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                      >
                        {isBusy
                          ? "Working..."
                          : skill.install
                            ? "Edit Setup / Reinstall"
                            : "Install"}
                      </button>
                    ) : null}

                    {skill.actions.can_uninstall ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void uninstallSkill(skill)}
                        className="focus-ring rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {isBusy ? "Removing..." : "Uninstall"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          : null}

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>

      {fileViewer.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-ink-700">{fileViewer.skillName}</h4>
              <button
                type="button"
                onClick={() => setFileViewer({ open: false, loading: false, skillName: "", content: "" })}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-500 hover:border-ink-300"
              >
                Close
              </button>
            </div>
            <div className="prose prose-sm max-h-[70vh] overflow-y-auto px-4 py-3 text-ink-700">
              {fileViewer.loading ? (
                <div className="flex items-center gap-2 text-ink-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading file...
                </div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {fileViewer.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {setupWizard.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-ink-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-ink-700">{setupWizard.name} Setup</h4>
              <p className="mt-1 text-xs text-ink-400">
                Complete setup before activation.
              </p>
            </div>
            <div className="max-h-[65vh] space-y-3 overflow-y-auto px-4 py-4">
              {setupWizard.schema.length === 0 ? (
                <p className="text-xs text-ink-500">No setup fields required for this skill.</p>
              ) : (
                setupWizard.schema.map((field) => (
                  <label key={field.id} className="block text-xs font-medium text-ink-500">
                    {field.label} {field.required ? "*" : ""}
                    {field.type === "textarea" ? (
                      <textarea
                        value={setupWizard.setupData[field.id] || ""}
                        onChange={(e) =>
                          setSetupWizard((prev) => ({
                            ...prev,
                            setupData: { ...prev.setupData, [field.id]: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700"
                        rows={3}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={setupWizard.setupData[field.id] || ""}
                        onChange={(e) =>
                          setSetupWizard((prev) => ({
                            ...prev,
                            setupData: { ...prev.setupData, [field.id]: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700"
                      >
                        <option value="">Select...</option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={setupWizard.setupData[field.id] || ""}
                        onChange={(e) =>
                          setSetupWizard((prev) => ({
                            ...prev,
                            setupData: { ...prev.setupData, [field.id]: e.target.value },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700"
                      />
                    )}
                  </label>
                ))
              )}

              {setupWizard.error ? <p className="text-xs text-red-600">{setupWizard.error}</p> : null}
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  setSetupWizard({
                    open: false,
                    slug: "",
                    name: "",
                    schema: [],
                    setupData: {},
                    saving: false,
                    completing: false,
                    error: "",
                  })
                }
                className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void saveSetupProgress()}
                  disabled={setupWizard.saving || setupWizard.completing}
                  className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300 disabled:opacity-50"
                >
                  {setupWizard.saving ? "Saving..." : "Save setup"}
                </button>
                <button
                  type="button"
                  onClick={() => void completeInstall()}
                  disabled={setupWizard.saving || setupWizard.completing}
                  className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
                >
                  {setupWizard.completing ? "Installing..." : "Complete install"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
