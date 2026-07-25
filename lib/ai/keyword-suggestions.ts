import { z } from "zod";
import { judge } from "./client";
import { extractPageContent } from "@/lib/analysis/extract-content";

const suggestionSchema = z.object({
  suggestions: z
    .array(
      z.object({
        term: z.string().describe("The keyword, natural-language question, or short phrase itself."),
        kind: z.enum(["keyword", "question", "phrase"]),
        reason: z.string().describe("1 sentence, tied to something concrete on this page, on why it should target this term."),
      }),
    )
    .min(5)
    .max(12)
    .describe("A mix weighted toward natural-language questions/phrases (how people actually ask AI answer engines things), plus a few classic short-tail keywords."),
});

const SYSTEM = `You are an SEO/AEO strategist. Given a landing page's title and rendered visible text, and the terms it's already known to be tracking, propose additional keywords, natural-language questions, and short phrases this specific page should target — the kind of things a real person types into Google or asks an AI assistant when they'd want to land on a page like this one.

Ground every suggestion in the page's actual content and framing, not generic industry buzzwords a template could have produced. Never repeat a term that's already tracked.`;

export type KeywordSuggestionResult = { term: string; kind: "keyword" | "question" | "phrase"; reason: string };

export async function generateKeywordSuggestions(pageUrl: string, existingTerms: string[]): Promise<KeywordSuggestionResult[]> {
  const { title, text } = await extractPageContent(pageUrl);
  if (!text || text.length < 40) {
    throw new Error("Could not extract enough visible text from this page to suggest keywords.");
  }

  const prompt = `Page URL: ${pageUrl}
Page title: ${title}

Already tracked (do not repeat these): ${existingTerms.length ? existingTerms.join(", ") : "none yet"}

Page visible text (rendered, truncated to 10k chars):
"""
${text.slice(0, 10000)}
"""`;

  const result = await judge({ system: SYSTEM, schema: suggestionSchema, prompt });
  return result.suggestions;
}
