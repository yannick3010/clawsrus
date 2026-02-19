"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}> 
      <LoginForm />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-surface-200 bg-white p-8">
        <p className="text-sm text-ink-400">Loading login...</p>
      </div>
    </main>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [envError, setEnvError] = useState("");
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // Fail fast so config issues appear immediately on page load.
      createSupabaseBrowserClient();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to initialize login configuration.";
      console.error("Login env preflight failed:", err);
      setEnvError(message);
      setError(message);
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (envError) {
      setError(envError);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const next = searchParams.get("next") || "/dashboard";
      const appUrl = window.location.origin;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      console.error("Failed to send magic link:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-surface-200 bg-white p-8">
        <h1 className="font-display text-3xl tracking-tight text-ink-800">
          Sign in to your dashboard
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          We&apos;ll send a secure magic link to your email.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Magic link sent. Check your inbox to continue.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-ink-600">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(envError)}
              className="w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
