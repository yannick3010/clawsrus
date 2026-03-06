import type { Metadata, Viewport } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "ClawsRUs — Managed AI Assistant on Telegram | Standard or Concierge Setup",
  description:
    "ClawsRUs is a done-for-you AI assistant that runs on Telegram. Choose Standard or Concierge setup, start with a 7-day Pro trial, then continue on Free or Pro membership. Built on OpenClaw.",
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
      <body className="font-body text-ink-800 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
