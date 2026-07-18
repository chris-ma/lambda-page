import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

const MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured — this tool requires a live Claude API call and has no fallback.",
    );
  }
  if (!client) client = new Anthropic();
  return client;
}

export type ImageInput = { base64: string; mediaType: "image/png" | "image/jpeg" | "image/webp" };

/**
 * Runs one structured-output Claude call: adaptive thinking + high effort,
 * since every caller here is a judgment call (positioning, copy fit, visual
 * critique) rather than a low-stakes lookup. Every call in this app is
 * schema-constrained — there's no free-text tool use path — so findings can
 * be persisted directly without a second parsing pass.
 */
export async function judge<T extends z.ZodType>(params: {
  system: string;
  prompt: string;
  images?: ImageInput[];
  schema: T;
}): Promise<z.infer<T>> {
  const content: Anthropic.MessageParam["content"] = [];
  for (const image of params.images ?? []) {
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } });
  }
  content.push({ type: "text", text: params.prompt });

  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(params.schema) },
    system: params.system,
    messages: [{ role: "user", content }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude returned a response that didn't match the expected schema.");
  }
  return response.parsed_output;
}
