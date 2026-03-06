"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "./FadeIn";

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Do I need any technical skills to set up my assistant?",
    a: "Nope. After checkout, you\u2019ll follow a simple guided walkthrough that takes about 10 minutes. If you can install an app on your phone, you can set this up.",
  },
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is the powerful open-source AI framework that runs under the hood. We handle all the technical stuff \u2014 you just chat with your assistant from your dashboard.",
  },
  {
    q: "How is this different from ChatGPT or other AI tools?",
    a: 'Most AI tools give you a blank chat window and leave you to figure it out. ClawsRUs agents come pre-configured and trained for specific jobs \u2014 install one with a single click and start chatting from your dashboard. Your assistant remembers your preferences across conversations and gets better over time. It\u2019s the difference between hiring someone and Googling "how to do things."',
  },
  {
    q: "How much does ClawsRUs cost?",
    a: "ClawsRUs offers a Free tier ($0 forever) and a Pro tier ($79/month). Every signup starts with a 7-day Pro trial so you can try all features before deciding.",
  },
  {
    q: "Is ClawsRUs free?",
    a: "Yes \u2014 ClawsRUs has a free tier that includes your AI assistant with all free skills. You can upgrade to Pro ($79/month) anytime to unlock paid skills and priority support.",
  },
  {
    q: "What can my assistant actually do?",
    a: (
      <>
        Your assistant can help with:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Research and quick answers</li>
          <li>Scheduling and calendar management</li>
          <li>Reminders and follow-ups</li>
          <li>Travel planning</li>
          <li>Email drafting</li>
          <li>Shopping lists and product research</li>
          <li>Event planning and coordination</li>
          <li>General Q&amp;A</li>
        </ul>
        <span className="mt-2 block">
          You can add skill packs to expand its capabilities anytime.
        </span>
      </>
    ),
  },
  {
    q: "Does ClawsRUs work on iPhone and Android?",
    a: "Yes. ClawsRUs runs inside Telegram, which is available on iPhone, Android, desktop, and web. No separate app to install.",
  },
  {
    q: "Does my assistant remember things between conversations?",
    a: "Yes. Your assistant has long-term memory built in. It remembers your preferences, past requests, and context \u2014 so you never have to repeat yourself.",
  },
  {
    q: "Do I need to install any app to use my assistant?",
    a: "No. Your assistant lives in your ClawsRUs dashboard \u2014 just log in and start chatting. No Telegram, no Slack, no extra apps to install.",
  },
  {
    q: "Can I switch personas later?",
    a: "Not yet in the self-serve flow, but email us and we can switch your persona within 24 hours. Self-serve switching is coming soon.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Each customer gets an isolated container. Your conversations stay in your private dashboard. We don\u2019t have access to your chat content.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <h2 className="text-center font-display text-3xl tracking-tight text-ink-800 sm:text-4xl lg:text-5xl">
            Questions? We&rsquo;ve got answers.
          </h2>
        </FadeIn>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div className="rounded-xl border border-ink-100 bg-white transition-all hover:border-ink-200">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 font-medium text-ink-800">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-300 transition-transform duration-300 ${
                      open === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 leading-relaxed text-ink-400">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
