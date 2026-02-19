"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AccountSummary } from "@/components/dashboard/types";

type ProfileResponse = {
  email: string;
  preferred_name: string | null;
  timezone: string;
  persona: string;
  tier: string;
};

type ProfileSettingsProps = {
  variant?: "card" | "embedded";
  onSummaryChange?: (summary: AccountSummary) => void;
};

export default function ProfileSettings({
  variant = "card",
  onSummaryChange,
}: ProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    email: "",
    preferred_name: "",
    timezone: "UTC",
    persona: "",
    tier: "",
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/dashboard/me", { cache: "no-store" });
        const data = (await res.json()) as ProfileResponse & { error?: string };
        if (!res.ok) {
          setError(data.error || "Failed to load profile");
          return;
        }

        setForm({
          email: data.email,
          preferred_name: data.preferred_name || "",
          timezone: data.timezone || "UTC",
          persona: data.persona,
          tier: data.tier,
        });
        onSummaryChange?.({
          preferredName: data.preferred_name || "",
          persona: data.persona,
          tier: data.tier,
        });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [onSummaryChange]);

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/dashboard/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_name: form.preferred_name,
          timezone: form.timezone,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not save settings");
        return;
      }

      setSuccess("Saved");
      onSummaryChange?.({
        preferredName: form.preferred_name,
        persona: form.persona,
        tier: form.tier,
      });
    } catch {
      setError("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={
        variant === "embedded"
          ? "rounded-xl border border-surface-200 bg-white p-4"
          : "rounded-xl border border-surface-200 bg-white p-5"
      }
    >
      {variant === "card" ? (
        <h3 className="text-sm font-semibold text-ink-700">Profile & Preferences</h3>
      ) : null}

      {loading ? (
        <div className={`${variant === "card" ? "mt-5" : "mt-2"} flex justify-center text-ink-400`}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <form onSubmit={onSave} className={`${variant === "card" ? "mt-4" : "mt-0"} space-y-3`}>
          <label className="block text-xs font-medium uppercase tracking-wide text-ink-400">
            Email
            <input
              value={form.email}
              disabled
              className="mt-1 w-full rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-500"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wide text-ink-400">
            Preferred Name
            <input
              value={form.preferred_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferred_name: e.target.value }))
              }
              className="focus-ring mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-500"
              placeholder="How should your agent address you?"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wide text-ink-400">
            Timezone
            <input
              value={form.timezone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timezone: e.target.value }))
              }
              className="focus-ring mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-500"
              placeholder="UTC"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 text-xs text-ink-400">
            <div className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
              <p className="uppercase tracking-wide">Persona</p>
              <p className="mt-1 text-sm font-medium capitalize text-ink-700">
                {form.persona.replaceAll("-", " ")}
              </p>
            </div>
            <div className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
              <p className="uppercase tracking-wide">Tier</p>
              <p className="mt-1 text-sm font-medium capitalize text-ink-700">
                {form.tier}
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-brand-600">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="focus-ring w-full rounded-full bg-ink-800 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      )}
    </section>
  );
}
