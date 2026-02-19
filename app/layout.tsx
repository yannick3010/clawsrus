import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ClawsRUs — Your Personal AI Assistant, Ready in Minutes",
  description:
    "No setup headaches. No prompt engineering. Just a ready-to-go assistant on Telegram that handles your life admin.",
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
