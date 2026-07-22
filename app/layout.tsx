import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// Playfair Display — the high-contrast editorial serif this reskin is built
// around. Body copy and mono labels fall back to system stacks (Georgia,
// ui-monospace) rather than loading web fonts for them, matching the
// reference stylesheet exactly.
const playfair = Playfair_Display({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Lambda — Diagnostic Toolkit for Landing Pages",
  description:
    "The function between traffic and conversion, made visible. See exactly where a landing page breaks — before you build, while it's live, and everywhere in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">{children}</body>
    </html>
  );
}
