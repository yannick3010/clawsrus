import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ClawsRUs — Managed AI Assistant on Telegram | No Setup, Free to Start",
  description:
    "ClawsRUs is a done-for-you AI assistant that runs on Telegram. Pre-configured for busy professionals — handles scheduling, research, email, reminders. Set up in 10 minutes, no coding required. Free tier forever, Pro at $79/mo. Built on OpenClaw.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body className="font-body text-ink-800 antialiased">{children}</body>
    </html>
  );
}
