export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <div className="text-lg font-bold">ClawsRUs</div>
            <p className="mt-1 text-sm text-slate-500">
              Your personal AI team, ready in minutes.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#personas" className="hover:text-white">
              Personas
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
            <a href="mailto:support@clawsrus.com" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} ClawsRUs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
