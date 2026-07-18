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
        label: "Assumption Interviews",
        description: "Pricing tolerance and segment validity — a research process, not a dashboard.",
        href: "/dashboard/pre-build",
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
        label: "SEO Analysis",
        description: "Meta tags, structured data, indexability — pick a connected page.",
        href: "/dashboard",
      },
      {
        label: "AEO / GEO Analysis",
        description: "Extractability for answer and generative engines — pick a connected page.",
        href: "/dashboard",
      },
      {
        label: "Page Vitals",
        description: "Lab-based LCP, INP, CLS — pick a connected page.",
        href: "/dashboard",
      },
    ],
  },
  {
    id: 2,
    slug: "behavioral",
    label: "Behavioral",
    subTools: [
      { label: "Heatmaps & Session Replay", description: "Click density, scroll depth, rage-clicks.", href: "/dashboard" },
      { label: "Funnel Analytics", description: "Stage-to-stage drop-off, segmented by device and source.", href: "/dashboard" },
      { label: "Form Field Analytics", description: "Field-level abandonment, time-per-field, validation errors.", href: "/dashboard" },
      { label: "A/B Testing", description: "Conversion rate per variant with real significance testing.", href: "/dashboard" },
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
    ],
  },
];
