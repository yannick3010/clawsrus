"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "./FadeIn";

const faqs = [
  {
    q: "Do I need any technical skills to set up my assistant?",
    a: "Nope. After checkout, you\u2019ll follow a simple guided walkthrough that takes about 10 minutes. If you can install an app on your phone, you can set this up.",
  },
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is the powerful open-source AI framework that runs under the hood. We handle all the technical stuff \u2014 you just chat with your assistant on Telegram.",
  },
  {
    q: "How is this different from ChatGPT or other AI tools?",
    a: 'Most AI tools give you a blank chat window and leave you to figure it out. Your ClawsRUs assistant comes pre-configured for a specific job, remembers your preferences across conversations, and gets better over time. It\u2019s the difference between hiring someone and Googling "how to do things."',
  },
  {
    q: "What can my assistant actually do?",
    a: "Research, scheduling, reminders, travel planning, email drafting, shopping lists, event planning, and general Q&A \u2014 to start. You can add skill packs to expand its capabilities anytime.",
  },
  {
    q: "Does my assistant remember things between conversations?",
    a: "Yes. Your assistant has long-term memory built in. It remembers your preferences, past requests, and context \u2014 so you never have to repeat yourself.",
  },
  {
    q: "How do I create a Telegram bot?",
    a: "It takes about 2 minutes. After checkout, our setup page walks you through it step-by-step: open Telegram, message @BotFather, send /newbot, pick a name, and copy the token. That's it.",
  },
  {
    q: "What messaging apps does it work with?",
    a: "Right now, Telegram. We\u2019re adding Discord and Slack support soon.",
  },
  {
    q: "Can I switch personas later?",
    a: "Not yet in the self-serve flow, but email us and we can switch your persona within 24 hours. Self-serve switching is coming soon.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Each customer gets an isolated container. Your conversations go through your own Telegram bot. We don\u2019t have access to your chat content.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <h2 className="text-center font-display text-3xl tracking-tight text-navy-800 sm:text-4xl lg:text-5xl">
            Questions? We&rsquo;ve got answers.
          </h2>
        </FadeIn>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div className="rounded-xl border border-navy-100 bg-white transition-all hover:border-navy-200">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 font-medium text-navy-800">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-navy-300 transition-transform duration-300 ${
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
                    <div className="px-6 pb-5 leading-relaxed text-navy-400">
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
