import type { Status } from "@/lib/status";

type VitalCopy = { measures: string; pass: string; flagged: string; failing: string; advice: string };

const VITALS_COPY: { match: string; copy: VitalCopy }[] = [
  {
    match: "Largest Contentful Paint",
    copy: {
      measures:
        "This measures how long it takes for the biggest thing on the page — usually a hero image or headline — to actually appear on screen.",
      pass: "Visitors see the main content quickly.",
      flagged: "Visitors wait a beat before the main content shows up — long enough that some will wonder if the page is working.",
      failing: "The website is too slow to show visitors anything meaningful — many will leave before they ever see what's being offered.",
      advice: "Compress the largest image, make sure the server responds quickly, and avoid loading scripts before the main content shows up.",
    },
  },
  {
    match: "Cumulative Layout Shift",
    copy: {
      measures:
        "This measures how much the page's content unexpectedly jumps around while it's loading — like a button shifting right as someone's about to tap it.",
      pass: "The page loads in a stable, predictable way.",
      flagged: "Some content shifts around while loading, which can be mildly annoying or cause a stray click.",
      failing: "The page jumps around a lot while loading — visitors can click the wrong thing, or the page can feel broken and untrustworthy.",
      advice: "Reserve space for images and embeds before they load, and avoid inserting new content above what people are already looking at.",
    },
  },
  {
    match: "Total Blocking Time",
    copy: {
      measures:
        "This measures how responsive the page feels right after it loads — whether a click or tap gets acknowledged immediately or the page briefly \"freezes.\"",
      pass: "The page responds quickly to clicks and taps.",
      flagged: "The page can feel a little sluggish to interact with right after it loads.",
      failing: "The page can feel frozen right when it loads — a visitor tapping a button might think it's broken and give up.",
      advice: "Reduce how much JavaScript runs when the page first loads, and defer anything that isn't needed immediately.",
    },
  },
  {
    match: "Lighthouse performance score",
    copy: {
      measures: "A single 0-100 score combining load speed, responsiveness, and visual stability into one overall grade.",
      pass: "Overall, the page performs well.",
      flagged: "Overall performance is middling — there's real room to improve before it starts costing conversions.",
      failing: "Overall performance is poor enough that it's likely already costing visitors and conversions.",
      advice: "Start with whichever metric here is flagged worst — fixing the biggest offender usually moves this score the most.",
    },
  },
  {
    match: "Resource count / weight",
    copy: {
      measures: "How many separate files — images, scripts, fonts, and so on — the page has to download, and how much data that adds up to.",
      pass: "A reasonably lean page — nothing bloated weighing it down.",
      flagged: "The page is downloading more than it likely needs to, which slows things down especially on mobile connections.",
      failing: "The page is downloading a lot more than it needs to, which meaningfully slows it down, especially on mobile connections.",
      advice: "Lazy-load anything below the fold, compress images, and drop third-party scripts that aren't earning their keep.",
    },
  },
];

/** Plain-language "what this number means for you" copy for a lab vitals finding — the raw ms/score values mean nothing to most people on their own. */
export function explainVital(attribute: string, status: Status): string {
  const entry = VITALS_COPY.find((v) => attribute.includes(v.match));
  if (!entry) return "";
  const statusText = status === "PASS" ? entry.copy.pass : status === "FLAGGED" ? entry.copy.flagged : entry.copy.failing;
  const advice = status === "PASS" ? "" : ` ${entry.copy.advice}`;
  return `${entry.copy.measures} ${statusText}${advice}`;
}
