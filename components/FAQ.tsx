"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is a popular open-source AI agent framework with 180K+ stars on GitHub. It handles memory, skills, multi-provider AI support, and Telegram integration out of the box. We configure it with specialized personas so you don't have to.",
  },
  {
    q: "How do I create a Telegram bot?",
    a: "It takes about 2 minutes. After checkout, our setup page walks you through it step-by-step: open Telegram, message @BotFather, send /newbot, pick a name, and copy the token. That's it.",
  },
  {
    q: "Can I switch personas later?",
    a: "Not yet in the self-serve flow, but email us and we can switch your persona within 24 hours. Self-serve switching is coming soon.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Each customer gets an isolated Docker container. Your conversations go through your own Telegram bot. We don't have access to your chat content.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-slate-900 py-24 text-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-800 bg-slate-900/50"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
