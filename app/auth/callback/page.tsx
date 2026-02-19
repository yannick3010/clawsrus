"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function sanitizeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/dashboard";
  }
  return rawNext;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-surface-200 bg-white p-8">
        <div className="flex items-center gap-3 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
          Completing sign-in...
        </div>
      </div>
    </main>
  );
}

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);

  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next")),
    [searchParams]
  );

  useEffect(() => {
    let mounted = true;
    let navigated = false;
    const timeoutId =
      typeof window !== "undefined"
        ? window.setTimeout(() => {
            if (mounted && !navigated) {
              setTimedOut(true);
            }
          }, 8000)
        : null;

    async function completeAuth() {
      try {
        const supabase = createSupabaseBrowserClient();

        if (typeof window !== "undefined") {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) {
              if (mounted) setError(setSessionError.message);
              return;
            }
          }

          if (window.location.hash) {
            window.history.replaceState(
              {},
              document.title,
              `${window.location.pathname}${window.location.search}`
            );
          }
        }

        const code = searchParams.get("code");
        if (code && typeof window !== "undefined") {
          const hasSessionTokens = window.location.hash.includes("access_token=");
          if (!hasSessionTokens) {
            const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            if (codeError) {
              if (mounted && /code verifier|pkce/i.test(codeError.message)) {
                setError(
                  "This magic link expired or was opened in a different browser. Request a new link from login."
                );
                return;
              }
              if (mounted) setError(codeError.message);
              return;
            }
          }
        }

        navigated = true;
        window.location.replace(nextPath);
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Authentication failed. Please request a new magic link."
          );
        }
      } finally {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      }
    }

    void completeAuth();

    return () => {
      mounted = false;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [nextPath, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-surface-200 bg-white p-8">
        {error ? (
          <>
            <h1 className="font-display text-2xl text-ink-800">Authentication failed</h1>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <p className="mt-3 text-sm text-ink-500">
              Please request a new magic link from the login page.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
              Completing sign-in...
            </div>
            {timedOut && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Sign-in is taking longer than expected.
                <a
                  href={nextPath}
                  className="ml-1 font-semibold underline decoration-amber-500/70 underline-offset-2"
                >
                  Continue manually
                </a>
                .
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
