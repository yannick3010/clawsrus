"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type ProfileResponse = {
  email: string;
  preferred_name: string | null;
  timezone: string;
  persona: string;
  tier: string;
};

export default function ProfileSettings() {
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
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

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
    } catch {
      setError("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-700">Profile & Preferences</h3>

      {loading ? (
        <div className="mt-5 flex justify-center text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <form onSubmit={onSave} className="mt-4 space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-navy-400">
            Email
            <input
              value={form.email}
              disabled
              className="mt-1 w-full rounded-lg border border-navy-100 bg-navy-50 px-3 py-2 text-sm text-navy-500"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wide text-navy-400">
            Preferred Name
            <input
              value={form.preferred_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, preferred_name: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 focus:border-brand-500 focus:outline-none"
              placeholder="How should your agent address you?"
            />
          </label>

          <label className="block text-xs font-medium uppercase tracking-wide text-navy-400">
            Timezone
            <input
              value={form.timezone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timezone: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 focus:border-brand-500 focus:outline-none"
              placeholder="UTC"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 text-xs text-navy-400">
            <div className="rounded-lg border border-navy-100 bg-navy-50 px-3 py-2">
              <p className="uppercase tracking-wide">Persona</p>
              <p className="mt-1 text-sm font-medium capitalize text-navy-700">
                {form.persona.replaceAll("-", " ")}
              </p>
            </div>
            <div className="rounded-lg border border-navy-100 bg-navy-50 px-3 py-2">
              <p className="uppercase tracking-wide">Tier</p>
              <p className="mt-1 text-sm font-medium capitalize text-navy-700">
                {form.tier}
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      )}
    </section>
  );
}
