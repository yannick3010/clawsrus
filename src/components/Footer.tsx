export default function Footer() {
  return (
    <footer className="bg-espresso py-16 text-warm-gray">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3 lg:px-8">
        <div>
          <span className="font-serif text-2xl font-semibold text-cream">
            ClawsRUs
          </span>
          <p className="mt-3 text-sm text-stone">
            Powered by OpenClaw.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-stone">
            Connect
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="https://twitter.com/ClawsRUs"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                Twitter: @ClawsRUs
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@clawsrus.com"
                className="transition-colors hover:text-cream"
              >
                hello@clawsrus.com
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yannick3010/clawsrus"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-stone">
            Navigation
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="#how-it-works" className="transition-colors hover:text-cream">
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" className="transition-colors hover:text-cream">
                What You Get
              </a>
            </li>
            <li>
              <a href="#pricing" className="transition-colors hover:text-cream">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="transition-colors hover:text-cream">
                FAQ
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-earth/30 px-6 pt-8 lg:px-8">
        <p className="text-center text-xs text-stone">
          &copy; 2026 ClawsRUs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
