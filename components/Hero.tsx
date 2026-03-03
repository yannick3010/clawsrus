import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-32 sm:pb-32 sm:pt-40">
      {/* Animated orbital background circles */}
      <div className="pointer-events-none absolute inset-0">
        {/* Orbit 1 - slow clockwise */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-spin-slow-20">
          <div className="absolute -top-[300px] left-[-300px] h-[600px] w-[600px] rounded-full bg-brand-200/[0.12] blur-[100px]" />
        </div>

        {/* Orbit 2 - medium counterclockwise */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-spin-reverse-30">
          <div className="absolute -top-[200px] left-[100px] h-[400px] w-[400px] rounded-full bg-blue-200/[0.08] blur-[120px]" />
        </div>

        {/* Orbit 3 - slow clockwise */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-spin-slow-25">
          <div className="absolute -top-[150px] left-[-400px] h-[500px] w-[500px] rounded-full bg-teal-200/10 blur-[90px]" />
        </div>

        {/* Orbit 4 - very slow counterclockwise */}
        <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-spin-reverse-35">
          <div className="absolute top-[50px] left-[200px] h-[350px] w-[350px] rounded-full bg-brand-200/[0.06] blur-[110px]" />
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h1
          className="animate-fade-in-up font-display text-5xl tracking-tight text-ink-800 sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          your personal ai agent in one click
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-400 sm:text-xl"
          style={{ animationDelay: "0.3s" }}
        >
          No setup headaches. No prompt engineering. Choose a pre-configured
          agent, install with one click, and start chatting right from your
          dashboard.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.5s" }}
        >
          <a
            href="/signup?tier=standard&persona=personal-assistant"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30"
          >
            Get Started — From $199
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-8 py-3.5 text-base font-semibold text-ink-600 transition-all hover:border-ink-300 hover:text-ink-800"
          >
            See How It Works
          </a>
        </div>

        <p
          className="animate-fade-in-up mt-6 text-sm text-ink-300"
          style={{ animationDelay: "0.65s" }}
        >
          One-click install. One-time setup fee — no recurring costs from us.
        </p>
      </div>
    </section>
  );
}
