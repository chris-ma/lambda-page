import type { PillarId } from "@/components/icons/PillarIcon";

export type PillarNavItem = {
  id: PillarId;
  slug: string;
  label: string;
  comingSoon?: boolean;
  subTools: { label: string; description: string; href?: string }[];
};

export const PILLARS_NAV: PillarNavItem[] = [
  {
    id: 0,
    slug: "pre-build",
    label: "Pre-Build",
    subTools: [
      {
        label: "Message & Concept Testing",
        description: "Claude judges your copy against an audience you describe.",
        href: "/dashboard/pre-build/content-fit/new",
      },
      {
        label: "Competitive Scan",
        description: "Scan multiple competitor URLs — findings plus an AI synthesis.",
        href: "/dashboard/pre-build/competitive/new",
      },
      {
        label: "Wireframe Testing",
        description: "Upload a prototype screenshot for pinned AI critique.",
        href: "/dashboard/pre-build/wireframe/new",
      },
      {
        label: "Ideation",
        description: "Describe a business idea — Claude builds a promotional MVP landing page for it.",
        href: "/dashboard/pre-build/ideation/new",
      },
    ],
  },
  {
    id: 1,
    slug: "structural",
    label: "Structural",
    subTools: [
      {
        label: "Design & Content Audit",
        description: "Screenshot + pinned AI critique on hierarchy, clarity, and polish.",
        href: "/dashboard/structural/design-audit/new",
      },
      {
        label: "SEO & AI Search Analysis",
        description: "Meta tags, structured data, and indexability alongside extractability for answer and generative engines, plus lab-based Core Web Vitals with plain-language explanations — one combined read, pick a connected page.",
        href: "/dashboard/structural/seo",
      },
    ],
  },
  {
    id: 2,
    slug: "behavioral",
    label: "Behavioral",
    subTools: [
      { label: "Heatmaps & Session Replay", description: "Click density, scroll depth, rage-clicks.", href: "/dashboard/behavioral?tab=heatmap" },
      { label: "Funnel Analytics", description: "Stage-to-stage drop-off, segmented by device and source.", href: "/dashboard/behavioral?tab=funnel" },
      { label: "Form Field Analytics", description: "Field-level abandonment, time-per-field, validation errors.", href: "/dashboard/behavioral?tab=forms" },
      { label: "Analytics", description: "Campaign/channel quality and conversion, from the built-in Lambda Analytics or a connected Google Analytics 4 property.", href: "/dashboard/behavioral?tab=analytics" },
    ],
  },
  {
    id: 3,
    slug: "user-testing",
    label: "User Testing",
    subTools: [
      { label: "Eye Tracking", description: "Fixation points and attention sequence.", href: "/dashboard/eye-tracking" },
      { label: "5-Second Test", description: "First-impression recall — screenshot in, questions in, five seconds, then answers.", href: "/dashboard/five-second" },
      { label: "Usability Testing", description: "A task, a unique participant link, and a real activity log of what they did.", href: "/dashboard/usability-testing" },
      { label: "Card Sorting & Tree Testing", description: "How people group your content, and whether they can find it in your nav.", href: "/dashboard/card-sorting" },
      { label: "Pricing Strategy", description: "Van Westendorp price sensitivity, Gabor-Granger demand curves, and pricing assumptions — a real interview link, real panel.", href: "/dashboard/pricing-strategy" },
      { label: "A/B Testing", description: "Conversion rate per variant with real significance testing.", href: "/dashboard/ab-testing" },
    ],
  },
];
