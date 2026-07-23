import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import sharp from "sharp";
import type { z } from "zod";

const MODEL = "claude-opus-4-8";

// Claude's vision API hard-rejects any image with a dimension over 8000px —
// a full-page screenshot of a long landing page (design-audit, eye-tracking
// stimuli) routinely exceeds this. Findings/pins use normalized 0..1
// coordinates, not absolute pixels, so shrinking the copy sent to Claude
// doesn't affect where a finding ends up pinned on the original image shown
// in the UI.
const MAX_IMAGE_DIMENSION = 8000;

async function ensureWithinDimensionLimit(image: ImageInput): Promise<ImageInput> {
  const buffer = Buffer.from(image.base64, "base64");
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) return image;
  if (metadata.width <= MAX_IMAGE_DIMENSION && metadata.height <= MAX_IMAGE_DIMENSION) return image;

  let pipeline = sharp(buffer).resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: "inside" });
  if (image.mediaType === "image/png") pipeline = pipeline.png();
  else if (image.mediaType === "image/jpeg") pipeline = pipeline.jpeg();
  else pipeline = pipeline.webp();

  const resized = await pipeline.toBuffer();
  return { base64: resized.toString("base64"), mediaType: image.mediaType };
}

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
  /** Overrides the default 8000-token cap — needed for calls whose output is a long free-text field (e.g. a full HTML document) rather than a handful of findings. */
  maxTokens?: number;
}): Promise<z.infer<T>> {
  const content: Anthropic.MessageParam["content"] = [];
  for (const image of params.images ?? []) {
    const safeImage = await ensureWithinDimensionLimit(image);
    content.push({ type: "image", source: { type: "base64", media_type: safeImage.mediaType, data: safeImage.base64 } });
  }
  content.push({ type: "text", text: params.prompt });

  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: params.maxTokens ?? 8000,
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
