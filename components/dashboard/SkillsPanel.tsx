"use client";

import { useEffect, useMemo } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getNativeSkillsAllowlist, isNativeSkillsEnabled } from "@/lib/feature-flags";
import { useGatewaySkills } from "@/components/dashboard/useGatewaySkills";
import type { SkillsSummary } from "@/components/dashboard/types";

type SkillsPanelProps = {
  variant?: "card" | "embedded";
  onSummaryChange?: (summary: SkillsSummary) => void;
};

export default function SkillsPanel({
  variant = "card",
  onSummaryChange,
}: SkillsPanelProps) {
  const nativeSkillsEnabled = isNativeSkillsEnabled();
  const allowlist = useMemo(() => getNativeSkillsAllowlist(), []);
  const shouldConnectSkills = nativeSkillsEnabled && allowlist.length > 0;
  const {
    skills,
    loading,
    savingSkillId,
    connectionStatus,
    error,
    refresh,
    toggleSkill,
    isConnected,
  } = useGatewaySkills(shouldConnectSkills, allowlist);

  useEffect(() => {
    onSummaryChange?.({
      loading,
      error,
      total: skills.length,
      enabled: skills.filter((skill) => skill.enabled).length,
      connected: isConnected,
      connectionStatus,
    });
  }, [connectionStatus, error, isConnected, loading, onSummaryChange, skills]);

  if (!nativeSkillsEnabled) {
    return (
      <section
        className={
          variant === "embedded"
            ? "rounded-xl border border-surface-200 bg-white p-4"
            : "rounded-xl border border-surface-200 bg-white p-5"
        }
      >
        {variant === "card" ? <h3 className="text-sm font-semibold text-ink-700">Skills</h3> : null}
        <p className="mt-1 text-xs text-ink-400">Native skills controls are disabled.</p>
        <p className="mt-4 text-xs text-red-600">
          Set <code>NATIVE_SKILLS_V1=true</code> to enable this panel.
        </p>
      </section>
    );
  }

  if (allowlist.length === 0) {
    return (
      <section
        className={
          variant === "embedded"
            ? "rounded-xl border border-surface-200 bg-white p-4"
            : "rounded-xl border border-surface-200 bg-white p-5"
        }
      >
        {variant === "card" ? <h3 className="text-sm font-semibold text-ink-700">Skills</h3> : null}
        <p className="mt-1 text-xs text-ink-400">No dashboard-managed skills configured.</p>
        <p className="mt-4 text-xs text-ink-500">
          Set <code>NEXT_PUBLIC_NATIVE_SKILLS_ALLOWLIST</code> with comma-separated skill IDs.
        </p>
      </section>
    );
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
            Status: <span className={isConnected ? "text-brand-700" : "text-amber-700"}>{connectionStatus}</span>
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="space-y-3 p-4" data-testid="native-skills-panel">
        {loading ? (
          <div className="flex justify-center py-4 text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : null}

        {!loading && skills.length === 0 ? (
          <p className="text-xs text-ink-400">
            No allowlisted skills were returned by your OpenClaw runtime.
          </p>
        ) : null}

        {!loading
          ? skills.map((skill) => {
              const isSaving = savingSkillId === skill.id;
              const toggleDisabled = isSaving || !skill.mutable || !isConnected;

              return (
                <div
                  key={skill.id}
                  data-testid={`skills-row-${skill.id}`}
                  className="rounded-xl border border-ink-100 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-700">{skill.name}</p>
                      <p className="mt-1 text-xs text-ink-500">{skill.description || skill.id}</p>
                    </div>

                    <button
                      data-testid={`skills-toggle-${skill.id}`}
                      data-enabled={skill.enabled ? "true" : "false"}
                      type="button"
                      disabled={toggleDisabled}
                      onClick={() => void toggleSkill(skill.id, !skill.enabled)}
                      className={`focus-ring rounded-full px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 ${
                        skill.enabled ? "bg-brand-500 hover:bg-brand-400" : "bg-ink-600 hover:bg-ink-500"
                      }`}
                    >
                      {isSaving ? "Saving..." : skill.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  {!skill.mutable ? (
                    <p className="mt-2 text-xs text-ink-400">This skill cannot be changed from the dashboard.</p>
                  ) : null}
                </div>
              );
            })
          : null}

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}
