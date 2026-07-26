import { Inter_Tight, JetBrains_Mono } from "next/font/google";

// Variable grotesque — the display/body face for the Parametric Atlas
// system. Loaded without a fixed `weight` so the full variable axis ships
// and components can set any numeric font-weight to encode a real value
// (severity, confidence, recency) rather than a hand-picked style.
export const atlasSans = Inter_Tight({
  variable: "--atlas-font-sans",
  subsets: ["latin"],
});

// One mono, for measurements only — never an eyebrow, never decoration.
export const atlasMono = JetBrains_Mono({
  variable: "--atlas-font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
