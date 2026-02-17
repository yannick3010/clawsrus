"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Rocket,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      }
    >
      <SetupWizard />
    </Suspense>
  );
}

function SetupWizard() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [step, setStep] = useState<1 | 2>(1);
  const [telegramToken, setTelegramToken] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenVerifying, setTokenVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const verifyToken = useCallback(async () => {
    if (!telegramToken.trim()) return;
    setTokenVerifying(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${telegramToken.trim()}/getMe`
      );
      const data = await res.json();
      if (data.ok) {
        setBotUsername(data.result.username);
        setTokenVerified(true);
      } else {
        setError("Invalid bot token. Please check and try again.");
        setTokenVerified(false);
      }
    } catch {
      setError("Could not verify token. Check your connection.");
      setTokenVerified(false);
    } finally {
      setTokenVerifying(false);
    }
  }, [telegramToken]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          telegram_bot_token: telegramToken.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 font-display text-xl text-navy-800">
            Invalid Setup Link
          </h1>
          <p className="mt-2 text-navy-400">
            This page requires a valid checkout session. Please start from the{" "}
            <a href="/" className="text-brand-500 underline">
              homepage
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-6 font-display text-2xl text-navy-800">
            Your AI Assistant is Being Set Up!
          </h1>
          <p className="mt-4 text-navy-400">
            We&apos;re configuring your assistant right now. You&apos;ll receive
            an email within a few minutes with a link to start chatting on
            Telegram.
          </p>
          {botUsername && (
            <p className="mt-4 text-navy-500">
              Your bot:{" "}
              <a
                href={`https://t.me/${botUsername}`}
                className="font-semibold text-brand-500"
                target="_blank"
              >
                @{botUsername}
              </a>
            </p>
          )}
          <div className="mt-8">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-500" />
            <p className="mt-2 text-sm text-navy-300">
              Provisioning... check your email shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <a
          href="/"
          className="font-display text-2xl tracking-tight text-navy-800"
        >
          ClawsRUs
        </a>

        <h1 className="mt-10 font-display text-3xl tracking-tight text-navy-800">
          Set Up Your AI Assistant
        </h1>
        <p className="mt-2 text-navy-400">
          Just one step — create a Telegram bot and you&apos;re live.
        </p>

        {/* Progress */}
        <div className="mt-8 flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-brand-500" : "bg-navy-100"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Telegram */}
        {step === 1 && (
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-navy-800">
                Step 1: Create Your Telegram Bot
              </h2>
            </div>
            <div className="mt-6 space-y-4 rounded-xl border border-navy-100 bg-navy-50 p-6">
              <p className="text-sm text-navy-500">
                Follow these steps to create your own Telegram bot:
              </p>
              <ol className="ml-4 list-decimal space-y-3 text-sm text-navy-400">
                <li>
                  Open Telegram and search for{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-brand-500 underline"
                  >
                    @BotFather
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  Send{" "}
                  <code className="rounded-md bg-navy-100 px-1.5 py-0.5 text-navy-600">
                    /newbot
                  </code>
                </li>
                <li>
                  Choose a display name for your bot (e.g., &quot;My AI
                  Assistant&quot;)
                </li>
                <li>
                  Choose a username ending in &quot;bot&quot; (e.g.,
                  &quot;myai_assistant_bot&quot;)
                </li>
                <li>
                  BotFather will give you a token — copy it and paste below
                </li>
              </ol>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-navy-600">
                Bot Token
              </label>
              <div className="mt-2 flex gap-3">
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => {
                    setTelegramToken(e.target.value);
                    setTokenVerified(false);
                  }}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                  className="flex-1 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder-navy-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  onClick={verifyToken}
                  disabled={!telegramToken.trim() || tokenVerifying}
                  className="rounded-xl bg-navy-100 px-4 py-2.5 text-sm font-medium text-navy-600 transition hover:bg-navy-200 disabled:opacity-50"
                >
                  {tokenVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {tokenVerified && (
                <p className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified — your bot is @{botUsername}
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!tokenVerified}
              className="mt-8 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Confirm & Launch */}
        {step === 2 && (
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-navy-800">
                Step 2: Confirm & Launch
              </h2>
            </div>

            <div className="mt-6 space-y-4 rounded-xl border border-navy-100 bg-navy-50 p-6">
              <div className="flex justify-between border-b border-navy-100 pb-3">
                <span className="text-sm text-navy-400">Telegram Bot</span>
                <span className="text-sm font-medium text-navy-800">
                  @{botUsername}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-navy-400">AI Model</span>
                <span className="text-sm font-medium text-navy-800">
                  OpenAI (GPT-4o)
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-600 transition hover:border-navy-300"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Launch My Assistant
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
