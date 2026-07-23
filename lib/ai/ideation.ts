import { z } from "zod";
import { judge } from "./client";

/**
 * Condensed from a behavioral page-design pattern library (20 patterns, 5
 * groups, each annotated with the mechanism it solves for). A single-page
 * promotional MVP draws almost entirely from groups 2 and 4 — occasionally
 * 1 or 3 for a more story-driven idea — so only the patterns realistically
 * applicable to a one-page promo are included here.
 */
const PATTERN_LIBRARY = `Reference pattern library — pick 2-4 patterns that genuinely fit THIS page, not a fixed set:

1 — NARRATIVE & STORYTELLING (behaviour: sustained attention)
  P·01 Narrative scroll (scrollytelling) — solves skimming & abandonment on complex explanations
  P·02 Pin & swap (stacked panels) — solves divided attention across competing messages
  P·05 Parallax depth layering — solves flat pages that fail to signal craft or atmosphere

2 — CONVERSION & DECISION (behaviour: action under uncertainty)
  P·06 Five-second hero — solves instant bounce from ambiguity
  P·07 Long-form persuasion (objection sequence) — solves hesitation on high-consideration decisions
  P·09 Distributed social proof — solves perceived risk of being the first/only one
  P·11 Persistent action bar (sticky CTA) — solves intent that spikes mid-page with no action in reach

3 — EXPLORATION & DISCOVERY (behaviour: information foraging)
  P·12 Bento grid — solves forcing a linear reading order on non-linear browsers

4 — ORIENTATION & SCANNING (behaviour: the user who doesn't read)
  P·16 F-pattern content layout — solves readers who scan text-heavy pages instead of reading
  P·17 Z-pattern landing layout — solves gaze routing on low-text, visual pages

Name every pattern you actually apply, using its exact P·NN id and name, in patternsUsed.`;

const IDEATION_SYSTEM = `You are a senior product marketer and front-end designer building a single promotional landing page for a pre-launch business idea. This is an MVP marketing page only — not a working app, not a prototype, not a signup flow with a real backend. The business itself still needs to be built; this page's only job is to explain the idea clearly and capture interest.

${PATTERN_LIBRARY}

Requirements for the HTML you produce:
- One complete, valid, self-contained HTML5 document — from <!DOCTYPE html> through </html>. All CSS in one <style> block in <head>. At most a small vanilla-JS <script> at the end of <body> for light interactivity (mobile nav toggle, smooth-scroll, a lightweight demo animation, an inline "thanks, you're on the list" confirmation on form submit) — no external JS libraries, no build step, no framework.
- No external image URLs of any kind — you cannot know if any image URL actually resolves, and a broken <img> looks worse than no image. Build every visual from CSS (gradients, shapes, borders, blur, layered blobs) and inline SVG icons/illustrations. Treat this constraint as the aesthetic, not a limitation — it's how a lot of modern SaaS/product pages are built anyway.
- You may link exactly one Google Fonts stylesheet for typography, nothing else external.
- Fully responsive: mobile-first, fluid type with clamp(), flexbox/grid, works cleanly from 360px to a wide desktop.
- Semantic HTML, a real heading hierarchy, strong color contrast, visible focus states, alt text on any inline SVG that carries meaning.
- Modern and fresh, current SaaS/consumer-product aesthetic: confident type scale, generous whitespace, a restrained palette (2-3 colors plus neutrals) driven by the described brand feel, subtle motion via CSS transitions/hover states — never gimmicky, never a dated stock-photo-hero cliché.
- Never invent specific fake testimonials, named customers, press logos, or fabricated metrics ("10,000 users", "as seen in TechCrunch") — this is a pre-launch idea with no real traction yet. If the page includes a trust-building section, frame it honestly: the problem being solved and for whom, a founder's-note style credibility line, or an early-access/waitlist framing — never a fabricated quote or number.
- The primary call to action must match how the business actually makes money — a free trial reads differently than a waitlist, a one-time purchase, a booked call, or a marketplace listing. Read the monetization description and choose the CTA verb and framing that actually fits it.
- Any form on the page is presentational only — no real backend, no real network request. A friendly inline confirmation shown via the small vanilla-JS script on submit is enough.
- Write real, specific copy about the described business — no lorem ipsum, no generic "Your Company Name Here" placeholders.

Return the complete document in html, a short browser-tab-appropriate title in pageTitle, which named patterns you actually drew from and why in patternsUsed, and a short judgment-call rationale for the structural choices in rationale.`;

const ideationResultSchema = z.object({
  pageTitle: z.string().describe("Browser tab title for the generated landing page."),
  html: z.string().describe("A complete, valid, self-contained HTML5 document — from <!DOCTYPE html> through </html>."),
  patternsUsed: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Which patterns from the reference library shaped this page's structure, e.g. \"P·06 — Five-second hero\"."),
  rationale: z.string().describe("2-4 sentences: the structural/behavioral reasoning behind this page's layout and flow — a judgment call, not a fact."),
});

export type IdeationResult = z.infer<typeof ideationResultSchema>;

export async function generateLandingPage(input: {
  businessName: string;
  description: string;
  monetization: string;
  targetAudience: string;
  brandFeel: string;
}): Promise<IdeationResult> {
  const prompt = `Business idea: ${input.businessName}

Description: ${input.description}

How it makes money: ${input.monetization}

Target audience: ${input.targetAudience}

Brand feel: ${input.brandFeel}

Design and write the full one-page landing site now.`;

  return judge({ system: IDEATION_SYSTEM, prompt, schema: ideationResultSchema, maxTokens: 16000 });
}
