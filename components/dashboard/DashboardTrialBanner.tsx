"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DashboardMeResponse = {
  subscription_status?: "active" | "trialing" | "past_due" | "canceled" | null;
  trial_ends_at?: string | null;
  trial_expired?: boolean;
};

export default function DashboardTrialBanner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [status, setStatus] = useState<DashboardMeResponse>({
    subscription_status: null,
    trial_ends_at: null,
    trial_expired: false,
  });

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/me", { cache: "no-store" });
      const data = (await res.json()) as DashboardMeResponse & { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to load subscription status");
        return;
      }
      setStatus({
        subscription_status: data.subscription_status || null,
        trial_ends_at: data.trial_ends_at || null,
        trial_expired: data.trial_expired === true,
      });
    } catch {
      setError("Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const daysLeft = useMemo(() => {
    if (!status.trial_ends_at) {
      return 0;
    }
    const msLeft = Date.parse(status.trial_ends_at) - Date.now();
    return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  }, [status.trial_ends_at]);

  async function upgradeToPro() {
    setUpgrading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/pro/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Failed to start Pro checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) {
    return null;
  }

  if (status.subscription_status === "active") {
    return null;
  }

  if (!(status.subscription_status === "trialing" || status.trial_expired)) {
    return null;
  }

  if (status.trial_expired) {
    return (
      <section className="border-b border-amber-200 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-amber-800">
            Your 7-day Pro trial has ended. Upgrade to keep paid skills and future Pro features.
          </p>
          <button
            type="button"
            onClick={() => void upgradeToPro()}
            disabled={upgrading}
            className="focus-ring rounded-full bg-ink-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-ink-700 disabled:opacity-50"
          >
            {upgrading ? "Redirecting..." : "Upgrade to Pro"}
          </button>
        </div>
        {error ? <p className="mx-auto mt-1 w-full max-w-7xl text-xs text-red-600">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="border-b border-brand-200 bg-brand-50 px-4 py-3">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-brand-700">
          Pro trial active. {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining.
        </p>
        <button
          type="button"
          onClick={() => void upgradeToPro()}
          disabled={upgrading}
          className="focus-ring rounded-full border border-brand-300 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400 disabled:opacity-50"
        >
          {upgrading ? "Redirecting..." : "Upgrade now"}
        </button>
      </div>
      {error ? <p className="mx-auto mt-1 w-full max-w-7xl text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
