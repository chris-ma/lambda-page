/** Long-form copy for the /pillars page — kept separate from lib/pillars.ts so nav (short) and the education page (long) can evolve independently without one cramping the other. */
export const PILLAR_COPY: Record<
  number,
  { tagline: string; why: string; what: string }
> = {
  0: {
    tagline: "Test the concept before it costs anything to be wrong",
    why: "Every hour spent designing and building a page is an hour spent betting that the message, the positioning, and the layout are right. That bet almost never gets checked first — teams find out a headline didn't land, a competitor already owns the framing, or a wireframe confuses people only after the page is live and the spend is sunk. A wrong assumption caught in a Google Doc costs an edit. The same assumption caught after launch costs a rebuild.",
    what: "Pre-Build Validation applies the same rigor Pillar 01 applies to a shipped page, but to a concept — before a single line of production code exists. Copy gets judged against a real audience, competitors get scanned and synthesized into a positioning read, and prototypes get the same scrutiny a finished page would get.",
  },
  1: {
    tagline: "Catch what's objectively broken before a visitor ever sees it",
    why: "A contrast ratio either passes WCAG AA or it doesn't. A page either has a single H1 or it doesn't. These aren't opinions and they don't need traffic to check — they need someone to actually run the math, which most teams never do past a single design review and a skim for typos. Structural defects sit on a live page silently costing conversions for weeks before anyone notices, because nothing was measuring for them.",
    what: "Structural Analysis runs directly against the rendered page — no live traffic required. It covers design and content quality, SEO, AEO/GEO extractability for answer and generative engines, and lab-based Core Web Vitals, scored separately so a strong SEO score never masks a failing AEO one. This is the pillar that can run on every deploy and block a launch before it ever reaches a real visitor.",
  },
  2: {
    tagline: "Find out what real visitors do, not what you assumed they'd do",
    why: "Structural checks catch what's broken in theory. They can't tell you that a hero section nobody scrolls past is where the real message lives, or which channel actually sends visitors who convert. That only shows up once the page is live and instrumented — and only if what you're measuring reaches statistical significance instead of a hunch dressed up as data.",
    what: "Behavioral Analysis turns real visitor activity into hard numbers once a page is live: click density and rage-clicks, stage-to-stage funnel drop-off segmented by device and source, and campaign/channel quality — either built in via Lambda Analytics or read from a connected Google Analytics 4 property.",
  },
  3: {
    tagline: "Behavioral data shows where; this shows why",
    why: "A funnel chart can tell you that 40% of visitors drop off at step three. It can't tell you whether that's because the copy confused them, the layout hid the next step, or the price surprised them. Answering \"why\" requires watching or asking real people directly — attention data, task-based sessions, structured comprehension tests — which is a fundamentally different (and slower, more expensive) kind of measurement than an analytics pipeline.",
    what: "User Testing is the qualitative counterpart to Pillar 02: eye tracking for attention sequence, five-second comprehension tests for first-impression recall, task-based usability testing with a real per-participant activity log, card sorting plus tree testing for how people categorize your content, pricing strategy — Van Westendorp price sensitivity and Gabor-Granger demand curves from a real respondent panel — and A/B tests with a proper two-proportion significance check, not just \"which number is bigger.\"",
  },
};
