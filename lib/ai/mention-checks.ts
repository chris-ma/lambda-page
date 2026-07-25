import { z } from "zod";
import { judge } from "./client";
import { extractPageContent } from "@/lib/analysis/extract-content";

const promptSuggestSchema = z.object({
  prompts: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Realistic prompts a real person might type into an AI assistant or AI-powered search, where this specific page would be a genuinely good, relevant answer or citation."),
});

const PROMPT_SYSTEM = `You are an AI-search visibility strategist. Given a landing page's title and rendered visible text, propose realistic prompts a real person might type into ChatGPT, Claude, Perplexity, or Google's AI Overview — questions where this specific page would be a genuinely strong, relevant answer or citation.

Write them the way people actually talk to AI assistants (natural questions, not SEO keyword strings), and ground them in what this page specifically offers — not generic category questions a template could have produced. Never repeat a prompt that's already been tested.`;

const answerSchema = z.object({
  answer: z.string().describe("A natural, complete answer to the question, exactly as you would normally give it in a real conversation."),
});

const ANSWER_SYSTEM = `Answer the user's question naturally and helpfully, exactly as you normally would in conversation. Do not mention that this is a test or that you are being evaluated.`;

export type MentionResult = { status: "mentioned" | "not_mentioned"; detail: string };

/**
 * Sends the prompt to Claude cold — no page context, no framing that reveals
 * this is a test — then checks the free-text answer for the page's own
 * hostname. This is a real, honest signal, but a narrow one: it reflects
 * only what's in Claude's own training knowledge, since these API calls
 * don't browse the live web. Callers should label it that way rather than
 * implying it reflects live AI Overview / ChatGPT / Perplexity behavior.
 */
export async function checkClaudeMention(prompt: string, pageUrl: string): Promise<MentionResult> {
  const hostname = new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
  const { answer } = await judge({ system: ANSWER_SYSTEM, schema: answerSchema, prompt, effort: "medium" });
  const mentioned = hostname.length > 3 && answer.toLowerCase().includes(hostname);
  const trimmed = answer.length > 400 ? `${answer.slice(0, 400)}…` : answer;
  return {
    status: mentioned ? "mentioned" : "not_mentioned",
    detail: mentioned ? `Claude's answer referenced ${hostname}: "${trimmed}"` : `Claude's answer didn't mention ${hostname}. What it said instead: "${trimmed}"`,
  };
}

export async function generateMentionPrompts(pageUrl: string, existingPrompts: string[]): Promise<{ prompt: string; claude: MentionResult }[]> {
  const { title, text } = await extractPageContent(pageUrl);
  if (!text || text.length < 40) {
    throw new Error("Could not extract enough visible text from this page to suggest prompts.");
  }

  const prompt = `Page URL: ${pageUrl}
Page title: ${title}

Already tested (do not repeat these): ${existingPrompts.length ? existingPrompts.join(" | ") : "none yet"}

Page visible text (rendered, truncated to 8k chars):
"""
${text.slice(0, 8000)}
"""`;

  const { prompts } = await judge({ system: PROMPT_SYSTEM, schema: promptSuggestSchema, prompt });
  return Promise.all(prompts.map(async (p) => ({ prompt: p, claude: await checkClaudeMention(p, pageUrl) })));
}
