"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "What You Get", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-ink-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          className="font-display text-2xl tracking-tight text-ink-800"
        >
          ClawsRUs
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-400 transition-colors hover:text-ink-800"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/signup?setup_package=standard&persona=personal-assistant"
          className="hidden rounded-full bg-ink-800 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-ink-700 hover:shadow-md md:inline-flex"
        >
          Get Your AI Assistant
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-ink-600 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-ink-500 transition-colors hover:text-ink-800"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/signup?setup_package=standard&persona=personal-assistant"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-ink-800 px-5 py-2.5 text-center text-sm font-medium text-white"
            >
              Get Your AI Assistant
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
