"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Rocket,
  RefreshCw,
} from "lucide-react";

type SetupStatus =
  | "awaiting_setup"
  | "pending_provision"
  | "provisioning"
  | "active"
  | "provision_failed";

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <SetupStatusPage />
    </Suspense>
  );
}

function SetupStatusPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const initializedRef = useRef(false);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "awaiting_setup":
        return "Preparing your setup...";
      case "pending_provision":
        return "Queued for provisioning";
      case "provisioning":
        return "Provisioning your OpenClaw instance";
      case "active":
        return "Ready";
      case "provision_failed":
        return "Provisioning failed";
      default:
        return "Initializing...";
    }
  }, [status]);

  const triggerSetup = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setError("");
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(data.error || "Failed to start setup");
    }
  }, [sessionId]);

  const checkStatus = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    const res = await fetch(`/api/setup/status?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as { status?: SetupStatus; error?: string };

    if (!res.ok || !data.status) {
      throw new Error(data.error || "Failed to fetch setup status");
    }

    setStatus(data.status);
    return data.status;
  }, [sessionId]);

  const bootstrapAndRedirect = useCallback(async () => {
    if (!sessionId || bootstrapped) {
      return;
    }

    setBootstrapped(true);
    setRedirecting(true);

    try {
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = (await res.json()) as { redirect_url?: string; error?: string };
      if (!res.ok || !data.redirect_url) {
        throw new Error(data.error || "Could not sign you in");
      }

      window.location.href = data.redirect_url;
    } catch (err) {
      setRedirecting(false);
      setError(err instanceof Error ? err.message : "Could not redirect");
      setBootstrapped(false);
    }
  }, [bootstrapped, sessionId]);

  useEffect(() => {
    if (!sessionId || initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    async function start() {
      try {
        await triggerSetup();
        const current = await checkStatus();
        if (current === "active") {
          await bootstrapAndRedirect();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Setup failed");
      }
    }

    void start();
  }, [sessionId, triggerSetup, checkStatus, bootstrapAndRedirect]);

  useEffect(() => {
    if (!sessionId || redirecting) {
      return;
    }

    if (!status || ["pending_provision", "provisioning", "awaiting_setup"].includes(status)) {
      const timer = window.setInterval(async () => {
        try {
          const current = await checkStatus();
          if (current === "active") {
            await bootstrapAndRedirect();
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Status check failed");
        }
      }, 4000);

      return () => window.clearInterval(timer);
    }
  }, [sessionId, status, redirecting, checkStatus, bootstrapAndRedirect]);

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 font-display text-2xl text-navy-800">Invalid setup link</h1>
          <p className="mt-2 text-sm text-navy-400">
            This page requires a valid checkout session. Please restart from the homepage.
          </p>
          <a
            href="/"
            className="mt-5 inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-50 px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          {status === "active" ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : status === "provision_failed" ? (
            <AlertCircle className="h-8 w-8 text-red-500" />
          ) : (
            <Rocket className="h-8 w-8 text-brand-500" />
          )}
          <div>
            <h1 className="font-display text-3xl tracking-tight text-navy-800">
              Setting up your assistant
            </h1>
            <p className="mt-1 text-sm text-navy-400">{statusLabel}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-500">
          We&apos;re provisioning your dedicated OpenClaw instance. You&apos;ll be redirected
          automatically to your dashboard once it is ready.
        </div>

        {redirecting && (
          <div className="mt-6 flex items-center gap-2 text-sm text-brand-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing you in and opening dashboard...
          </div>
        )}

        {status === "provision_failed" && (
          <button
            onClick={() => {
              setError("");
              setStatus("awaiting_setup");
              void (async () => {
                try {
                  await triggerSetup();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Retry provisioning failed"
                  );
                }
              })();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-600 hover:border-navy-300"
          >
            <RefreshCw className="h-4 w-4" />
            Retry provisioning
          </button>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
