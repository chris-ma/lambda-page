import type { Metadata } from "next";
import { Bodoni_Moda, Jost, Special_Elite } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
      className={`${bodoni.variable} ${jost.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">{children}</body>
    </html>
  );
}
