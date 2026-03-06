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
  title: "ClawsRUs — Pre-Configured AI Assistant on Telegram | Free Trial",
  description:
    "ClawsRUs is a pre-configured personal AI assistant on Telegram. Handles scheduling, research, reminders, and life admin. Set up in 10 minutes. Free tier available.",
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
