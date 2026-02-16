"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "What You Get", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 top-0 z-40 transition-shadow duration-300",
        "bg-cream/90 backdrop-blur-md",
        scrolled && "shadow-sm",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="font-serif text-2xl font-semibold text-espresso">
          ClawsRUs
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-medium uppercase tracking-wider text-earth transition-colors hover:text-espresso"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Button href="#pricing" className="px-6 py-2 text-xs">
            Get Your AI Assistant
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={clsx(
              "h-0.5 w-6 bg-espresso transition-transform duration-200",
              menuOpen && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={clsx(
              "h-0.5 w-6 bg-espresso transition-opacity duration-200",
              menuOpen && "opacity-0",
            )}
          />
          <span
            className={clsx(
              "h-0.5 w-6 bg-espresso transition-transform duration-200",
              menuOpen && "-translate-y-2 -rotate-45",
            )}
          />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={clsx(
          "fixed inset-0 top-[64px] bg-cream/95 backdrop-blur-md transition-opacity duration-300 md:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex flex-col items-center gap-8 pt-16">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium uppercase tracking-wider text-earth transition-colors hover:text-espresso"
            >
              {l.label}
            </a>
          ))}
          <Button
            href="#pricing"
            className="mt-4"
            onClick={() => setMenuOpen(false)}
          >
            Get Your AI Assistant
          </Button>
        </div>
      </div>
    </nav>
  );
}
