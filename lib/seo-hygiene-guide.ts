/**
 * Search hygiene criteria for this specific page. Each criterion maps to one
 * or more real findings already produced by the structural crawl
 * (lib/analysis/structural.ts) — this module doesn't invent a second scoring
 * system, it just organizes the existing findings around the questions a
 * person actually asks ("is this page crawlable," "are the headings right")
 * instead of the internal component names they happen to be grouped under.
 *
 * A couple of criteria (content originality, authority/credibility) can't be
 * determined from a single-page crawl at all — no backlink data, no way to
 * compare against "what everyone else already says." Those are marked
 * `notAutomatable` and always show practical self-check guidance instead of
 * a fabricated pass/fail.
 */

export type FindingMatch = { component: string; attribute: string };

export type HygieneCriterion = {
  id: string;
  title: string;
  group: string;
  /** (component, attribute) pairs whose findings answer this criterion. attribute "*" matches every finding in that component. */
  match: FindingMatch[];
  /** Practical, plain-language guidance — shown for notAutomatable criteria, or as a lead-in even when real findings exist. */
  guidance: string;
  notAutomatable?: boolean;
};

export const SEO_HYGIENE_CRITERIA: HygieneCriterion[] = [
  {
    id: "crawl-index",
    title: "Crawl and index access",
    group: "Crawlability & trust",
    match: [
      { component: "SEO Analysis", attribute: "Indexability" },
      { component: "SEO Analysis", attribute: "robots.txt" },
      { component: "AEO / GEO Analysis", attribute: "llms.txt presence" },
    ],
    guidance: "Search and AI crawlers need to be able to actually fetch and read the page — blocked, gated, or broken pages can't be evaluated at all.",
  },
  {
    id: "https",
    title: "HTTPS and basic trust signals",
    group: "Crawlability & trust",
    match: [{ component: "SEO Analysis", attribute: "HTTPS" }],
    guidance: "HTTPS is a lightweight but confirmed ranking signal, and browsers actively flag HTTP pages as \"Not secure\" — that warning alone costs trust before anyone reads a word.",
  },
  {
    id: "sitemap",
    title: "XML sitemap and discoverability",
    group: "Crawlability & trust",
    match: [{ component: "SEO Analysis", attribute: "sitemap.xml" }],
    guidance: "A sitemap gives crawlers a direct list of pages to check, so discovery doesn't depend entirely on being linked to from somewhere else.",
  },
  {
    id: "canonical",
    title: "Canonical tags and duplicate content",
    group: "Crawlability & trust",
    match: [{ component: "SEO Analysis", attribute: "Canonical tag" }],
    guidance: "If the same content is reachable at more than one URL (tracking parameters, trailing slashes, http vs https), a canonical tag tells crawlers which one actually counts — without it, ranking signal splits across copies.",
  },
  {
    id: "titles-descriptions",
    title: "Titles and descriptions",
    group: "Content & structure",
    match: [
      { component: "SEO Analysis", attribute: "Title tag" },
      { component: "SEO Analysis", attribute: "Meta description" },
    ],
    guidance: "The title and meta description are usually the first thing a person (or an AI summary) sees about the page before ever visiting it.",
  },
  {
    id: "url-structure",
    title: "URL structure",
    group: "Content & structure",
    match: [{ component: "SEO Analysis", attribute: "URL structure" }],
    guidance: "A short, readable URL (/topic/subtopic) tells both people and crawlers what the page is about before they even click; a string of parameters or IDs tells them nothing.",
  },
  {
    id: "page-structure",
    title: "Page structure (headings)",
    group: "Content & structure",
    match: [
      { component: "Content & Accessibility", attribute: "Heading hierarchy — single H1" },
      { component: "Content & Accessibility", attribute: "Heading nesting" },
      { component: "AEO / GEO Analysis", attribute: "Entity clarity (H1 states the subject)" },
    ],
    guidance: "One clear H1 that states the subject, then H2s and H3s that nest in order with no levels skipped — this is what lets both a skimming visitor and an AI crawler map the page's structure at a glance.",
  },
  {
    id: "answer-first",
    title: "Answer-first formatting for AI search",
    group: "Content & structure",
    match: [
      { component: "AEO / GEO Analysis", attribute: "Content chunking (self-contained sections)" },
      { component: "AEO / GEO Analysis", attribute: "Extractable Q&A / FAQ structure" },
    ],
    guidance: "AI answer engines quote and cite whichever passage most directly answers the query — content is more extractable when the answer sits in the first sentence or two of a self-contained section, not buried after a long wind-up.",
  },
  {
    id: "internal-linking",
    title: "Internal linking",
    group: "Content & structure",
    match: [{ component: "SEO Analysis", attribute: "Link structure" }],
    guidance: "Links to related pages on your own site are how crawlers (and AI engines) discover that content and understand how it relates to what they're already reading.",
  },
  {
    id: "originality",
    title: "Content originality",
    group: "Content & structure",
    match: [],
    notAutomatable: true,
    guidance: "Can't be measured by crawling this page alone — there's no way to compare it against everyone else's content from here. Self-check: does this page explain your team's actual approach, with real examples and edge cases, or could it have been written about any competitor with the names swapped? Google explicitly says to prioritize unique, non-commodity content that's genuinely helpful — not a rewritten version of what every competitor already says.",
  },
  {
    id: "page-experience",
    title: "Page experience",
    group: "Experience & media",
    match: [{ component: "Page Vitals", attribute: "*" }],
    guidance: "Fast load, a mobile-friendly layout, and content that's visible immediately — Google has said page experience matters even for AI search results, not just classic rankings.",
  },
  {
    id: "structured-data",
    title: "Structured data",
    group: "Experience & media",
    match: [{ component: "SEO Analysis", attribute: "Structured data (schema.org)" }],
    guidance: "Schema markup (JSON-LD) gives crawlers an explicit, structured version of what's already on the page — it should always match what a visitor actually sees, never describe content that isn't really there.",
  },
  {
    id: "alt-text",
    title: "Alt text and images",
    group: "Experience & media",
    match: [{ component: "Content & Accessibility", attribute: "Image alt text" }],
    guidance: "Descriptive alt text is how crawlers and AI engines understand what an image actually shows — \"image1\" or keyword-stuffed alt text tells them nothing (and stuffing can read as manipulative).",
  },
  {
    id: "freshness",
    title: "Freshness and publishing rhythm",
    group: "Ongoing signals",
    match: [{ component: "SEO Analysis", attribute: "Freshness signal" }],
    guidance: "A visible or structured published/updated date lets visitors and AI crawlers tell how current the content is — sites that revisit cornerstone pages regularly and publish new supporting content tend to surface more often in AI search.",
  },
  {
    id: "authority",
    title: "Authority and credibility",
    group: "Ongoing signals",
    match: [],
    notAutomatable: true,
    guidance: "Can't be measured by crawling this one page — it depends on signals from across the web (who links to you, who cites you) that a single-page crawl has no access to. Self-check: is there a named, credible author on this content? Do other sites reference it? Research on AI-search visibility has found that a focused, niche-expert site can outperform a larger generalist one — depth in a specific area reads as more trustworthy than breadth without it.",
  },
];

export const SEO_HYGIENE_GROUPS = Array.from(new Set(SEO_HYGIENE_CRITERIA.map((c) => c.group)));
