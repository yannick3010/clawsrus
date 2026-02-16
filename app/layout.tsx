import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClawsRUs — Your Personal AI Team, Ready in Minutes",
  description:
    "Pick a persona, connect your Telegram, and get an AI assistant that actually gets things done. Chief of Staff, Sales Expert, or Personal Assistant — powered by OpenClaw.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
