"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const HELP_TOPICS = [
  { id: "email", label: "Email", description: "Triage, summarize, and draft responses" },
  { id: "calendar", label: "Calendar", description: "Meeting reminders and scheduling" },
  { id: "tasks", label: "Tasks", description: "Track to-dos and daily reminders" },
  { id: "research", label: "Research", description: "Web search and summarization" },
  { id: "notes", label: "Notes", description: "Meeting notes and templates" },
] as const;

const COMMUNICATION_STYLES = [
  { id: "brief", label: "Brief & direct", description: "Short, to-the-point answers" },
  { id: "detailed", label: "Detailed", description: "Thorough explanations and context" },
  { id: "casual", label: "Casual", description: "Friendly and conversational" },
] as const;

const TOP_PRIORITIES = [
  { id: "productivity", label: "Productivity" },
  { id: "email", label: "Email management" },
  { id: "calendar", label: "Calendar management" },
  { id: "research", label: "Research" },
  { id: "all", label: "All of the above" },
] as const;

const TOTAL_STEPS = 4;

interface SignupData {
  name: string;
  email: string;
  role: string;
  helpTopics: string[];
  communicationStyle: string;
  topPriority: string;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-lg rounded-xl border border-surface-200 bg-white p-8">
        <p className="text-sm text-ink-400">Loading...</p>
      </div>
    </main>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get("tier") || "free";
  const persona = searchParams.get("persona") || "personal-assistant";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<SignupData>({
    name: "",
    email: "",
    role: "",
    helpTopics: [],
    communicationStyle: "",
    topPriority: "",
  });

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return data.name.trim() !== "" && data.email.trim() !== "";
      case 2:
        return true; // role is optional
      case 3:
        return data.helpTopics.length > 0;
      case 4:
        return data.communicationStyle !== "" && data.topPriority !== "";
      default:
        return false;
    }
  }

  function toggleHelpTopic(id: string) {
    setData((prev) => ({
      ...prev,
      helpTopics: prev.helpTopics.includes(id)
        ? prev.helpTopics.filter((t) => t !== id)
        : [...prev.helpTopics, id],
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          persona,
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role.trim() || null,
          helpTopics: data.helpTopics,
          communicationStyle: data.communicationStyle,
          topPriority: data.topPriority,
        }),
      });
      const result = await res.json();
      if (result.setup_url) {
        window.location.href = result.setup_url;
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/#pricing");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-100 px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-ink-400">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-ink-400 transition hover:text-ink-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-ink-100">
            <div
              className="h-1.5 rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white p-8">
          {step === 1 && (
            <StepBasics
              data={data}
              onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
            />
          )}
          {step === 2 && (
            <StepRole
              data={data}
              onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
            />
          )}
          {step === 3 && (
            <StepHelpTopics
              data={data}
              onToggle={toggleHelpTopic}
            />
          )}
          {step === 4 && (
            <StepPreferences
              data={data}
              onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!canAdvance() || loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              "Creating trial account..."
            ) : step === TOTAL_STEPS ? (
              <>
                Start 7-Day Pro Trial
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="mt-3 w-full text-center text-sm text-ink-400 transition hover:text-ink-600"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function StepBasics({
  data,
  onChange,
}: {
  data: SignupData;
  onChange: (updates: Partial<SignupData>) => void;
}) {
  return (
    <>
      <h2 className="font-display text-2xl tracking-tight text-ink-800 sm:text-3xl">
        Let&apos;s get started
      </h2>
      <p className="mt-2 text-sm text-ink-400">
        Tell us a bit about yourself so your assistant can be personalized from day one.
      </p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-ink-600">
          Your name
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Nick"
          />
        </label>
        <label className="block text-sm font-medium text-ink-600">
          Email
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </label>
      </div>
    </>
  );
}

function StepRole({
  data,
  onChange,
}: {
  data: SignupData;
  onChange: (updates: Partial<SignupData>) => void;
}) {
  return (
    <>
      <h2 className="font-display text-2xl tracking-tight text-ink-800 sm:text-3xl">
        What do you do?
      </h2>
      <p className="mt-2 text-sm text-ink-400">
        This helps your assistant tailor its suggestions. Totally optional.
      </p>
      <div className="mt-6">
        <label className="block text-sm font-medium text-ink-600">
          Role or industry
          <input
            type="text"
            value={data.role}
            onChange={(e) => onChange({ role: e.target.value })}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="e.g. Marketing, Engineering, Founder"
          />
        </label>
      </div>
    </>
  );
}

function StepHelpTopics({
  data,
  onToggle,
}: {
  data: SignupData;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <h2 className="font-display text-2xl tracking-tight text-ink-800 sm:text-3xl">
        What do you need help with?
      </h2>
      <p className="mt-2 text-sm text-ink-400">
        Select everything that applies. Your assistant will set these up automatically.
      </p>
      <div className="mt-6 grid gap-3">
        {HELP_TOPICS.map((topic) => {
          const selected = data.helpTopics.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onToggle(topic.id)}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all ${
                selected
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-ink-200 bg-white hover:border-ink-300"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  selected
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-ink-300 bg-white"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
              </div>
              <div>
                <span className="text-sm font-medium text-ink-800">
                  {topic.label}
                </span>
                <span className="ml-2 text-sm text-ink-400">
                  {topic.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepPreferences({
  data,
  onChange,
}: {
  data: SignupData;
  onChange: (updates: Partial<SignupData>) => void;
}) {
  return (
    <>
      <h2 className="font-display text-2xl tracking-tight text-ink-800 sm:text-3xl">
        Almost there
      </h2>
      <p className="mt-2 text-sm text-ink-400">
        A couple more preferences so your assistant communicates just right.
      </p>

      <div className="mt-6 space-y-6">
        <fieldset>
          <legend className="text-sm font-medium text-ink-600">
            How should your assistant communicate?
          </legend>
          <div className="mt-3 grid gap-2">
            {COMMUNICATION_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => onChange({ communicationStyle: style.id })}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  data.communicationStyle === style.id
                    ? "border-brand-500 bg-brand-50 shadow-sm"
                    : "border-ink-200 bg-white hover:border-ink-300"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    data.communicationStyle === style.id
                      ? "border-brand-500"
                      : "border-ink-300"
                  }`}
                >
                  {data.communicationStyle === style.id && (
                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-ink-800">
                    {style.label}
                  </span>
                  <span className="ml-2 text-sm text-ink-400">
                    — {style.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-ink-600">
            What&apos;s your top priority?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOP_PRIORITIES.map((priority) => (
              <button
                key={priority.id}
                type="button"
                onClick={() => onChange({ topPriority: priority.id })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  data.topPriority === priority.id
                    ? "bg-brand-500 text-white shadow-md"
                    : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </>
  );
}
