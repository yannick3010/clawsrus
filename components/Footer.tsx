export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div>
            <div className="font-display text-2xl tracking-tight text-ink-800">
              ClawsRUs
            </div>
            <p className="mt-2 text-sm text-ink-400">
              Your personal AI team, ready in minutes.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8 text-sm text-ink-400">
            <a
              href="#personas"
              className="transition-colors hover:text-ink-800"
            >
              Personas
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-ink-800"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-ink-800"
            >
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-ink-800">
              FAQ
            </a>
            <a
              href="mailto:hello@clawsrus.com"
              className="transition-colors hover:text-ink-800"
            >
              Contact
            </a>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-8 text-xs text-ink-300 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} ClawsRUs. All rights reserved.
          </span>
          <span>Powered by OpenClaw</span>
        </div>
      </div>
    </footer>
  );
}
