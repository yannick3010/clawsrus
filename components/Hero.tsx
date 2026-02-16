"use client";

import { ArrowRight, Bot } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-300">
          <Bot className="h-4 w-4" />
          Powered by OpenClaw
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Your Personal AI Team
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Ready in Minutes
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          Pick a persona. Connect your Telegram. Get an AI assistant that
          actually gets things done — not another chatbot that forgets who you
          are.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-blue-500"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-8 py-3.5 text-base font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
