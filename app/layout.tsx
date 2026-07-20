import type { Metadata } from "next";
import { Fraunces, Jost, Special_Elite } from "next/font/google";
import "./globals.css";

// Fraunces over the old Bodoni Moda: still a serif with real editorial
// character, but Bodoni's hairline/thick-stroke contrast gets illegible
// fast below display sizes — Fraunces keeps sturdier strokes at every
// weight and ships an optical-size axis so text stays readable from
// small card headings up to the hero.
const fraunces = Fraunces({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const jost = Jost({
  variable: "--font-body-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const specialElite = Special_Elite({
  variable: "--font-mono-raw",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Lambda Page — Diagnostic Toolkit for Landing Pages",
  description:
    "The function between traffic and conversion, made visible. See exactly where a landing page breaks — before you build, while it's live, and everywhere in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jost.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">{children}</body>
    </html>
  );
}
