/**
 * Static reference guide — general SEO/AEO/GEO hygiene, not this page's own
 * findings. Shown first on the SEO page so there's a "what good and bad
 * actually look like" reference to read the findings below against. Sourced
 * from Google Search Central guidance and Wix's AI-search visibility
 * research where noted; a few categories (marked unsourced) are this
 * product's own framing rather than a cited claim.
 */

export type HygieneLine = { label: string; text: string };
export type HygieneSource = "google" | "wix";

export type HygieneCategory = {
  id: string;
  title: string;
  lines: HygieneLine[];
  sources: HygieneSource[];
};

export type HygieneGroup = {
  title: string;
  categories: HygieneCategory[];
};

export const SEO_HYGIENE_GROUPS: HygieneGroup[] = [
  {
    title: "Crawlability & trust",
    categories: [
      {
        id: "crawl-index",
        title: "Crawl and index access",
        lines: [
          { label: "Good", text: "robots.txt allows the page, the page returns a 200 status, and the content is in HTML that can be read by crawlers." },
          { label: "Bad", text: "The page is blocked by robots.txt, requires login, or returns a broken/error page." },
        ],
        sources: ["google"],
      },
      {
        id: "https",
        title: "HTTPS and basic trust signals",
        lines: [
          { label: "Good", text: "The page loads over HTTPS with a valid certificate and no mixed-content warnings." },
          { label: "Bad", text: "The page is served over plain HTTP, or an HTTPS page still loads some resources insecurely." },
          { label: "Why it helps", text: "Google has confirmed HTTPS as a (lightweight) ranking signal, and browsers actively flag HTTP pages as “Not secure.”" },
        ],
        sources: ["google"],
      },
      {
        id: "sitemap",
        title: "XML sitemap and discoverability",
        lines: [
          { label: "Good", text: "An accurate, up-to-date sitemap.xml lists the page, so crawlers can find it even if internal links to it are thin." },
          { label: "Bad", text: "No sitemap, or a stale one that still lists removed pages and is missing new ones." },
        ],
        sources: ["google"],
      },
      {
        id: "canonical",
        title: "Canonical tags and duplicate content",
        lines: [
          { label: "Good", text: "One canonical URL per piece of content; parameter or tracking-tag variants (?utm=..., ?ref=...) point back to it." },
          { label: "Bad", text: "The same content is reachable at multiple URLs with no canonical tag, splitting ranking signals across copies." },
        ],
        sources: ["google"],
      },
    ],
  },
  {
    title: "Content & structure",
    categories: [
      {
        id: "titles-descriptions",
        title: "Titles and descriptions",
        lines: [
          { label: "Good title", text: "“Beginner’s Guide to UX Research Testing Methods.”" },
          { label: "Good meta description", text: "“Learn five practical UX research methods, when to use them, and how to interpret results.”" },
          { label: "Why it helps", text: "Wix found stronger AI visibility on sites with longer titles and meta descriptions, and Google recommends making pages easy to understand and useful to searchers." },
        ],
        sources: ["wix", "google"],
      },
      {
        id: "url-structure",
        title: "URL structure",
        lines: [
          { label: "Good", text: "/usability-testing/card-sorting — short, readable, and describes the topic in plain words." },
          { label: "Bad", text: "/p?id=48213&cat=7&ref=xyz — cryptic and parameter-heavy; tells a crawler or a person nothing about the page." },
        ],
        sources: ["google"],
      },
      {
        id: "headings-structure",
        title: "Headings and structure",
        lines: [
          { label: "Good", text: "One clear H1, then H2s like “When to Use Moderated Testing,” “Recruiting Participants,” and “Reporting Findings.”" },
          { label: "Good formatting", text: "Short paragraphs, bullet lists, and sections that break the page into chunks AI can extract." },
          { label: "Bad", text: "A giant wall of text with no headings or clear sections." },
        ],
        sources: ["wix", "google"],
      },
      {
        id: "answer-first",
        title: "Answer-first formatting for AI search",
        lines: [
          { label: "Good", text: "The direct answer to the likely question sits in the first sentence or two, with supporting detail and nuance after it." },
          { label: "Bad", text: "The actual answer is buried several paragraphs down, after a long introduction an AI engine has to read through — or discard — to extract anything." },
        ],
        sources: [],
      },
      {
        id: "internal-linking",
        title: "Internal linking",
        lines: [
          { label: "Good", text: "A guide on usability testing links to related pages on card sorting, tree testing, and research recruitment." },
          { label: "Why it helps", text: "Wix’s research found high-performing AI sites had stronger internal linking." },
          { label: "Bad", text: "Important pages exist only in isolation, with no links from other relevant pages." },
        ],
        sources: ["wix"],
      },
      {
        id: "originality",
        title: "Content originality",
        lines: [
          { label: "Good", text: "A page that explains your team’s actual testing framework, includes examples, and answers common edge cases." },
          { label: "Bad", text: "A rewritten generic article that repeats what every competitor already says." },
          { label: "Why it helps", text: "Google explicitly says to focus on unique, non-commodity content that is helpful and satisfying." },
        ],
        sources: ["google"],
      },
    ],
  },
  {
    title: "Experience & media",
    categories: [
      {
        id: "page-experience",
        title: "Page experience",
        lines: [
          { label: "Good", text: "Fast load, mobile-friendly layout, readable typography, and the main content is immediately visible." },
          { label: "Bad", text: "Slow page, intrusive pop-ups, cluttered layout, or confusing navigation." },
          { label: "Why it helps", text: "Google says page experience matters even for AI search results." },
        ],
        sources: ["google"],
      },
      {
        id: "structured-data",
        title: "Structured data",
        lines: [
          { label: "Good", text: "A recipe page marks up ingredients, cook time, and servings that are also visible on the page." },
          { label: "Good", text: "A product page uses product schema that matches the displayed price and availability." },
          { label: "Bad", text: "Marking up hidden content, or using schema that says something the page does not actually show." },
        ],
        sources: ["google"],
      },
      {
        id: "alt-text",
        title: "Alt text and images",
        lines: [
          { label: "Good alt text", text: "“Screenshot of moderated usability testing notes showing task completion time and pain points.”" },
          { label: "Good usage", text: "Relevant images that support the topic, with descriptive alt text." },
          { label: "Bad", text: "“image1,” or stuffing keywords into every image description." },
        ],
        sources: ["wix", "google"],
      },
    ],
  },
  {
    title: "Ongoing signals",
    categories: [
      {
        id: "freshness",
        title: "Freshness and publishing rhythm",
        lines: [
          { label: "Good", text: "Updating cornerstone pages quarterly and publishing new supporting content regularly." },
          { label: "Why it helps", text: "Wix found sites with more frequent publishing and more blog posts per month were more likely to surface in AI search." },
          { label: "Bad", text: "Launching a page once and never revisiting it." },
        ],
        sources: ["wix"],
      },
      {
        id: "authority",
        title: "Authority and credibility",
        lines: [
          { label: "Good", text: "The site is cited by others, has expert authorship, and is clearly niche-focused." },
          { label: "Why it helps", text: "Wix found niche sites with domain expertise could outperform larger generalist sites in AI visibility." },
          { label: "Bad", text: "Thin site with no identifiable expertise, no external mentions, and no evidence of trust." },
        ],
        sources: ["wix"],
      },
    ],
  },
];

export const SEO_HYGIENE_EXAMPLE = {
  title: "Practical page example",
  intro: "A strong AI-search-friendly page for a UX research topic might have:",
  points: [
    "Title: “How to Run a Card Sort Test.”",
    "H1: “Card Sorting for Information Architecture.”",
    "Sections: “When to Use It,” “Remote vs In-Person,” “Sample Tasks,” and “How to Analyze Results.”",
    "Internal links to related research methods.",
    "One diagram with descriptive alt text.",
    "Schema that matches visible FAQ content.",
    "A fast, clean mobile layout.",
  ],
  sources: ["google", "wix"] as HygieneSource[],
};
