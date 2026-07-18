import type { PillarId } from "@/components/icons/PillarIcon";

export type PillarNavItem = {
  id: PillarId;
  slug: string;
  label: string;
  comingSoon?: boolean;
  subTools: { label: string; description: string }[];
};

export const PILLARS_NAV: PillarNavItem[] = [
  {
    id: 0,
    slug: "pre-build",
    label: "Pre-Build",
    subTools: [
      { label: "Message & Concept Testing", description: "Comprehension, recall, and confidence per headline variant." },
      { label: "Competitive Scan", description: "Hero framing, pricing visibility, and trust signals — automated." },
      { label: "Wireframe Testing", description: "Same scrutiny as a finished page, run on a prototype." },
      { label: "Assumption Interviews", description: "Pricing tolerance and segment validity — a research process, not a dashboard." },
    ],
  },
  {
    id: 1,
    slug: "structural",
    label: "Structural",
    subTools: [
      { label: "Design & Content Audit", description: "Heading hierarchy, contrast, readability, brand consistency." },
      { label: "SEO Analysis", description: "Meta tags, structured data, indexability." },
      { label: "AEO / GEO Analysis", description: "Extractability for answer and generative engines." },
      { label: "Page Vitals", description: "Lab-based LCP, INP, CLS — no live traffic needed." },
    ],
  },
  {
    id: 2,
    slug: "behavioral",
    label: "Behavioral",
    subTools: [
      { label: "Heatmaps & Session Replay", description: "Click density, scroll depth, rage-clicks." },
      { label: "Funnel Analytics", description: "Stage-to-stage drop-off, segmented by device and source." },
      { label: "Form Field Analytics", description: "Field-level abandonment, time-per-field, validation errors." },
      { label: "A/B Testing", description: "Conversion rate per variant with real significance testing." },
    ],
  },
  {
    id: 3,
    slug: "user-testing",
    label: "User Testing",
    comingSoon: true,
    subTools: [
      { label: "Eye Tracking", description: "Fixation points and attention sequence." },
      { label: "5-Second Test", description: "Recall accuracy and confidence rating." },
      { label: "Usability Testing", description: "Task completion, time-on-task, think-aloud friction." },
      { label: "Card Sorting & Tree Testing", description: "Category groupings and findability." },
    ],
  },
];
