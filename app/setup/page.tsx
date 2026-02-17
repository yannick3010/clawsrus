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
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-xl font-bold">Invalid Setup Link</h1>
          <p className="mt-2 text-slate-400">
            This page requires a valid checkout session. Please start from the{" "}
            <a href="/" className="text-blue-400 underline">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-6 text-2xl font-bold">
            Your AI Assistant is Being Set Up!
          </h1>
          <p className="mt-4 text-slate-400">
            We&apos;re configuring your assistant right now. You&apos;ll receive
            an email within a few minutes with a link to start chatting on
            Telegram.
          </p>
          {botUsername && (
            <p className="mt-4 text-slate-300">
              Your bot:{" "}
              <a
                href={`https://t.me/${botUsername}`}
                className="font-semibold text-blue-400"
                target="_blank"
              >
                @{botUsername}
              </a>
            </p>
          )}
          <div className="mt-8">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-400" />
            <p className="mt-2 text-sm text-slate-500">
              Provisioning... check your email shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">Set Up Your AI Assistant</h1>
        <p className="mt-2 text-slate-400">
          Just one step — create a Telegram bot and you&apos;re live.
        </p>

        {/* Progress */}
        <div className="mt-8 flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-blue-600" : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Step 1: Telegram */}
        {step === 1 && (
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold">
                Step 1: Create Your Telegram Bot
              </h2>
            </div>
            <div className="mt-6 space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-sm text-slate-300">
                Follow these steps to create your own Telegram bot:
              </p>
              <ol className="ml-4 list-decimal space-y-3 text-sm text-slate-400">
                <li>
                  Open Telegram and search for{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-blue-400 underline"
                  >
                    @BotFather
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  Send{" "}
                  <code className="rounded bg-slate-800 px-1.5 py-0.5">
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
              <label className="block text-sm font-medium text-slate-300">
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
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={verifyToken}
                  disabled={!telegramToken.trim() || tokenVerifying}
                  className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-600 disabled:opacity-50"
                >
                  {tokenVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {tokenVerified && (
                <p className="mt-2 flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified — your bot is @{botUsername}
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!tokenVerified}
              className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Confirm & Launch */}
        {step === 2 && (
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold">
                Step 2: Confirm & Launch
              </h2>
            </div>

            <div className="mt-6 space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-sm text-slate-400">Telegram Bot</span>
                <span className="text-sm font-medium">@{botUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">AI Model</span>
                <span className="text-sm font-medium">
                  OpenAI (GPT-4o)
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold transition hover:border-slate-500"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
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
