import { z } from "zod";
import { judge } from "./client";
import { extractPageContent } from "@/lib/analysis/extract-content";

const shareOfVoiceSchema = z.object({
  terms: z.array(
    z.object({
      term: z.string(),
      ranking: z
        .array(
          z.object({
            url: z.string().describe("Exact URL as given in the input, unchanged."),
            rationale: z.string().describe("1 sentence: how directly and thoroughly this specific page addresses this term, relative to the others."),
          }),
        )
        .describe("Every page given, ordered best-to-worst for this specific term — which page an AI answer engine or search result would most likely cite."),
    }),
  ),
  overallNote: z.string().describe("2-3 sentences: overall read on where this page leads or lags the competitive set, and why."),
});

const SYSTEM = `You are judging "share of voice": for each tracked keyword/question, which of several landing pages — this page and its named competitors — most directly and thoroughly addresses it, using only the page content excerpts provided (no external ranking data, no browsing, no prior knowledge of these companies).

For every term, rank ALL given URLs best-to-worst for that specific term, with a one-sentence rationale per entry. This is a content-relevance judgment call, not a real search ranking or traffic measurement — say so plainly in overallNote and never imply certainty the evidence doesn't support.`;

export type ShareOfVoiceResult = z.infer<typeof shareOfVoiceSchema>;

export async function computeShareOfVoice(
  ownUrl: string,
  competitors: { url: string; label: string | null }[],
  terms: string[],
): Promise<ShareOfVoiceResult> {
  if (terms.length === 0) {
    throw new Error("Add at least one tracked keyword, question, or prompt before comparing share of voice.");
  }

  const sites = [{ url: ownUrl, label: "This page" as string | null }, ...competitors];
  const crawled = await Promise.all(
    sites.map(async (s) => {
      try {
        const { title, text } = await extractPageContent(s.url);
        return { ...s, title, text: text.slice(0, 6000), failed: text.length < 40 };
      } catch {
        return { ...s, title: "", text: "", failed: true };
      }
    }),
  );

  const usable = crawled.filter((c) => !c.failed);
  const own = usable.find((c) => c.url === ownUrl);
  if (!own || usable.length < 2) {
    throw new Error("Couldn't crawl enough pages (this page plus at least one competitor) to compare share of voice.");
  }

  const prompt = `Terms to compare (${terms.length}):
${terms.map((t) => `- ${t}`).join("\n")}

Pages (content excerpts):
${usable.map((c) => `### ${c.url}${c.label ? ` (${c.label})` : ""}\nTitle: ${c.title}\n"""\n${c.text}\n"""`).join("\n\n")}`;

  return judge({ system: SYSTEM, schema: shareOfVoiceSchema, prompt });
}
