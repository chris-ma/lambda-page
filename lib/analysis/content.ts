const JARGON_WORDS = [
  "synergy", "synergies", "leverage", "leveraging", "paradigm", "holistic", "disruptive",
  "seamless", "seamlessly", "robust", "innovative", "cutting-edge", "best-in-class",
  "game-changer", "game-changing", "turnkey", "value-add", "bandwidth", "circle back",
  "low-hanging fruit", "move the needle", "actionable", "empower", "empowering", "ecosystem",
  "streamline", "streamlined", "utilize", "utilizing", "revolutionary", "next-generation",
  "world-class", "state-of-the-art", "mission-critical", "frictionless", "unlock", "unlocking",
  "supercharge", "elevate", "elevating", "reimagine", "transformative", "end-to-end",
];

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

export function fleschReadingEase(text: string): { score: number; words: number; sentences: number } {
  const words = (text.match(/[A-Za-z']+/g) || []);
  const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length || 1;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordCount = words.length || 1;
  const score = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  return { score: Math.round(score * 10) / 10, words: words.length, sentences };
}

export function jargonDensity(text: string): { density: number; hits: string[] } {
  const lower = text.toLowerCase();
  const words = (lower.match(/[a-z']+/g) || []).length || 1;
  const hits: string[] = [];
  for (const term of JARGON_WORDS) {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    const m = lower.match(re);
    if (m) hits.push(...m);
  }
  return { density: hits.length / words, hits: Array.from(new Set(hits)) };
}

export function readabilityLabel(score: number): string {
  if (score >= 70) return "Plain English (easy)";
  if (score >= 50) return "Fairly readable";
  if (score >= 30) return "Difficult";
  return "Very difficult / academic";
}
