import type { Page } from "playwright";
import { launchBrowser } from "./browser";
import { contrastRatio, parseRgb, blendOverWhite, passesAA } from "./contrast";
import { fleschReadingEase, jargonDensity, readabilityLabel } from "./content";
import type { FindingInput } from "@/lib/db/runs";

type DomSnapshot = {
  headings: { level: number; text: string }[];
  imgs: { hasAlt: boolean; src: string }[];
  tapTargets: { tag: string; w: number; h: number; text: string }[];
  contrastSamples: { tag: string; text: string; color: string; bg: string; fontSize: number; bold: boolean }[];
  title: string;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  jsonLd: string[];
  bodyText: string;
  faqLike: boolean;
  headingCount: number;
  paragraphCount: number;
  internalLinks: number;
  externalLinks: number;
};

async function extractDom(page: Page): Promise<DomSnapshot> {
  return page.evaluate(() => {
    function visible(el: Element): boolean {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
      .filter(visible)
      .map((h) => ({ level: Number(h.tagName[1]), text: (h.textContent || "").trim().slice(0, 120) }));

    const imgs = Array.from(document.querySelectorAll("img")).map((img) => ({
      hasAlt: img.hasAttribute("alt") && img.getAttribute("alt")!.trim().length > 0,
      src: img.getAttribute("src") || "",
    }));

    const tapTargets = Array.from(document.querySelectorAll("a,button,[role=button],input[type=submit]"))
      .filter(visible)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || "").trim().slice(0, 40) };
      });

    const textEls = Array.from(document.querySelectorAll("h1,h2,h3,p,a,button,span,li"))
      .filter((el) => (el.textContent || "").trim().length > 2 && visible(el))
      .slice(0, 400);

    const contrastSamples = textEls.map((el) => {
      const style = window.getComputedStyle(el);
      let bgEl: Element | null = el;
      let bg = "rgba(0,0,0,0)";
      while (bgEl) {
        const s = window.getComputedStyle(bgEl);
        const parsed = s.backgroundColor;
        if (parsed && parsed !== "rgba(0, 0, 0, 0)" && parsed !== "transparent") {
          bg = parsed;
          break;
        }
        bgEl = bgEl.parentElement;
      }
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 60),
        color: style.color,
        bg,
        fontSize: parseFloat(style.fontSize),
        bold: parseInt(style.fontWeight, 10) >= 600,
      };
    });

    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => s.textContent || "",
    );

    const bodyClone = document.body.cloneNode(true) as HTMLElement;
    bodyClone.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
    const bodyText = (bodyClone.textContent || "").replace(/\s+/g, " ").trim();

    const faqLike =
      document.querySelectorAll("dl dt, [itemtype*='FAQPage'], details summary").length > 0 ||
      /\bQ:|\bFAQ\b|frequently asked/i.test(bodyText.slice(0, 5000));

    const linkEls = Array.from(document.querySelectorAll("a[href]"));
    let internalLinks = 0;
    let externalLinks = 0;
    for (const a of linkEls) {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("http") && !href.includes(location.hostname)) externalLinks++;
      else if (href.startsWith("/") || href.includes(location.hostname) || href.startsWith("#")) internalLinks++;
    }

    return {
      headings,
      imgs,
      tapTargets,
      contrastSamples,
      title: document.title || "",
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") || null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || null,
      robotsMeta: document.querySelector('meta[name="robots"]')?.getAttribute("content") || null,
      jsonLd,
      bodyText,
      faqLike,
      headingCount: headings.length,
      paragraphCount: document.querySelectorAll("p").length,
      internalLinks,
      externalLinks,
    };
  });
}

async function fetchText(url: string): Promise<{ ok: boolean; text: string }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return { ok: res.ok, text: res.ok ? await res.text() : "" };
  } catch {
    return { ok: false, text: "" };
  }
}

export async function runStructuralAnalysis(targetUrl: string): Promise<{ findings: FindingInput[]; summary: Record<string, unknown> }> {
  const browser = await launchBrowser();
  const findings: FindingInput[] = [];

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    const dom = await extractDom(page);
    const origin = new URL(targetUrl).origin;
    await page.close();

    // ---- Design & Content Audit: heading hierarchy ----
    const h1Count = dom.headings.filter((h) => h.level === 1).length;
    if (h1Count === 1) {
      findings.push({ component: "Design & Content Audit", attribute: "Heading hierarchy — single H1", status: "PASS", value: "1", detail: `H1: "${dom.headings.find((h) => h.level === 1)?.text}"` });
    } else if (h1Count === 0) {
      findings.push({ component: "Design & Content Audit", attribute: "Heading hierarchy — single H1", status: "FAILING", value: "0", detail: "No H1 found on the page.", fix: "Add exactly one H1 that states the page's primary subject." });
    } else {
      findings.push({ component: "Design & Content Audit", attribute: "Heading hierarchy — single H1", status: "FAILING", value: String(h1Count), detail: `${h1Count} H1 elements found.`, fix: "Reduce to a single H1; demote the others to H2 or lower." });
    }

    let skipped = 0;
    for (let i = 1; i < dom.headings.length; i++) {
      if (dom.headings[i].level - dom.headings[i - 1].level > 1) skipped++;
    }
    findings.push(
      skipped === 0
        ? { component: "Design & Content Audit", attribute: "Heading nesting", status: "PASS", value: "0 skipped levels", detail: "No heading levels are skipped." }
        : { component: "Design & Content Audit", attribute: "Heading nesting", status: "FLAGGED", value: `${skipped} skipped level(s)`, detail: "One or more headings skip a level (e.g. H2 to H4).", fix: "Adjust heading levels so each step down is sequential." },
    );

    // ---- Contrast ----
    let contrastFails = 0;
    let contrastChecked = 0;
    const worstFails: string[] = [];
    for (const s of dom.contrastSamples) {
      const fg = parseRgb(s.color);
      const bgRaw = parseRgb(s.bg);
      if (!fg || !bgRaw) continue;
      const bg = blendOverWhite(bgRaw, 1);
      const ratio = contrastRatio(fg, bg);
      const isLarge = s.fontSize >= 24 || (s.fontSize >= 18.66 && s.bold);
      contrastChecked++;
      if (!passesAA(ratio, isLarge)) {
        contrastFails++;
        if (worstFails.length < 5) worstFails.push(`"${s.text}" — ${ratio.toFixed(2)}:1`);
      }
    }
    if (contrastChecked === 0) {
      findings.push({ component: "Design & Content Audit", attribute: "Color contrast (WCAG AA)", status: "INFO", detail: "No text samples with resolvable colors were found to check." });
    } else if (contrastFails === 0) {
      findings.push({ component: "Design & Content Audit", attribute: "Color contrast (WCAG AA)", status: "PASS", value: `${contrastChecked} elements checked`, detail: "All sampled text passes WCAG AA contrast." });
    } else {
      findings.push({
        component: "Design & Content Audit",
        attribute: "Color contrast (WCAG AA)",
        status: contrastFails / contrastChecked > 0.15 ? "FAILING" : "FLAGGED",
        value: `${contrastFails}/${contrastChecked} fail`,
        detail: `Examples: ${worstFails.join("; ")}`,
        fix: "Darken text or lighten/darken the background so the ratio reaches 4.5:1 (or 3:1 for large/bold text).",
      });
    }

    // ---- Alt text ----
    const missingAlt = dom.imgs.filter((i) => !i.hasAlt);
    findings.push(
      dom.imgs.length === 0
        ? { component: "Design & Content Audit", attribute: "Image alt text", status: "INFO", detail: "No <img> elements found on the page." }
        : missingAlt.length === 0
          ? { component: "Design & Content Audit", attribute: "Image alt text", status: "PASS", value: `${dom.imgs.length}/${dom.imgs.length}`, detail: "Every image has non-empty alt text." }
          : { component: "Design & Content Audit", attribute: "Image alt text", status: "FAILING", value: `${missingAlt.length}/${dom.imgs.length} missing`, detail: `${missingAlt.length} image(s) missing alt text, e.g. ${missingAlt[0]?.src.slice(0, 60)}`, fix: "Add descriptive alt text to every content image; use alt=\"\" only for purely decorative images." },
    );

    // ---- Tap targets (mobile ≥24×24) ----
    const smallTargets = dom.tapTargets.filter((t) => t.w > 0 && t.h > 0 && (t.w < 24 || t.h < 24));
    findings.push(
      dom.tapTargets.length === 0
        ? { component: "Design & Content Audit", attribute: "Mobile tap-target size", status: "INFO", detail: "No interactive elements found to measure." }
        : smallTargets.length === 0
          ? { component: "Design & Content Audit", attribute: "Mobile tap-target size", status: "PASS", value: `${dom.tapTargets.length} checked`, detail: "All interactive elements are at least 24×24px at mobile width." }
          : { component: "Design & Content Audit", attribute: "Mobile tap-target size", status: "FLAGGED", value: `${smallTargets.length}/${dom.tapTargets.length} under 24px`, detail: `Examples: ${smallTargets.slice(0, 3).map((t) => `${t.tag} "${t.text}" (${t.w}×${t.h}px)`).join("; ")}`, fix: "Increase padding so tap targets are at least 24×24px." },
    );

    // ---- Content: readability, word count, jargon ----
    const { score, words } = fleschReadingEase(dom.bodyText);
    findings.push({
      component: "Design & Content Audit",
      attribute: "Readability (Flesch Reading Ease)",
      status: score >= 50 ? "PASS" : score >= 30 ? "FLAGGED" : "FAILING",
      value: `${score} — ${readabilityLabel(score)}`,
      detail: `Computed from ${words} words of visible body text.`,
      fix: score < 50 ? "Shorten sentences and prefer plain words over multi-syllable jargon." : undefined,
    });
    findings.push({ component: "Design & Content Audit", attribute: "Word count", status: "INFO", value: `${words} words`, detail: "Total visible body copy." });

    const { density, hits } = jargonDensity(dom.bodyText);
    findings.push({
      component: "Design & Content Audit",
      attribute: "Jargon density",
      status: density > 0.01 ? "FLAGGED" : "PASS",
      value: `${(density * 100).toFixed(2)}%`,
      detail: hits.length ? `Detected: ${hits.slice(0, 8).join(", ")}` : "No common jargon terms detected.",
      fix: density > 0.01 ? "Replace vague business jargon with concrete, specific language." : undefined,
    });

    // ---- SEO Analysis (separate from AEO/GEO — never blended) ----
    findings.push(
      dom.title.length === 0
        ? { component: "SEO Analysis", attribute: "Title tag", status: "FAILING", detail: "No <title> tag found.", fix: "Add a unique, descriptive <title> (50-60 characters)." }
        : dom.title.length > 60 || dom.title.length < 10
          ? { component: "SEO Analysis", attribute: "Title tag", status: "FLAGGED", value: `${dom.title.length} chars`, detail: `"${dom.title}"`, fix: "Aim for 10-60 characters so the full title shows in search results." }
          : { component: "SEO Analysis", attribute: "Title tag", status: "PASS", value: `${dom.title.length} chars`, detail: `"${dom.title}"` },
    );

    findings.push(
      !dom.metaDescription
        ? { component: "SEO Analysis", attribute: "Meta description", status: "FAILING", detail: "No meta description found.", fix: "Add a meta description (50-160 characters) summarizing the page." }
        : dom.metaDescription.length > 160 || dom.metaDescription.length < 50
          ? { component: "SEO Analysis", attribute: "Meta description", status: "FLAGGED", value: `${dom.metaDescription.length} chars`, fix: "Aim for 50-160 characters." }
          : { component: "SEO Analysis", attribute: "Meta description", status: "PASS", value: `${dom.metaDescription.length} chars` },
    );

    findings.push(
      dom.canonical
        ? { component: "SEO Analysis", attribute: "Canonical tag", status: "PASS", value: dom.canonical }
        : { component: "SEO Analysis", attribute: "Canonical tag", status: "FLAGGED", detail: "No canonical link tag found.", fix: "Add <link rel=\"canonical\"> pointing to the preferred URL." },
    );

    const noindex = dom.robotsMeta?.toLowerCase().includes("noindex") ?? false;
    findings.push(
      noindex
        ? { component: "SEO Analysis", attribute: "Indexability", status: "FAILING", value: dom.robotsMeta ?? undefined, detail: "Page is marked noindex.", fix: "Remove noindex if this page should appear in search results." }
        : { component: "SEO Analysis", attribute: "Indexability", status: "PASS", detail: "No noindex directive found." },
    );

    const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
      fetchText(`${origin}/robots.txt`),
      fetchText(`${origin}/sitemap.xml`),
      fetchText(`${origin}/llms.txt`),
    ]);
    findings.push(robotsRes.ok ? { component: "SEO Analysis", attribute: "robots.txt", status: "PASS", detail: "robots.txt is reachable." } : { component: "SEO Analysis", attribute: "robots.txt", status: "INFO", detail: "No robots.txt found at the site root." });
    findings.push(sitemapRes.ok ? { component: "SEO Analysis", attribute: "sitemap.xml", status: "PASS", detail: "sitemap.xml is reachable." } : { component: "SEO Analysis", attribute: "sitemap.xml", status: "FLAGGED", detail: "No sitemap.xml found at the site root.", fix: "Publish a sitemap.xml to help search engines discover pages." });

    const schemaTypes: string[] = [];
    let schemaValid = 0;
    for (const raw of dom.jsonLd) {
      try {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item["@type"]) {
            schemaValid++;
            schemaTypes.push(item["@type"]);
          }
        }
      } catch {
        // invalid JSON-LD block, skip
      }
    }
    findings.push(
      schemaValid > 0
        ? { component: "SEO Analysis", attribute: "Structured data (schema.org)", status: "PASS", value: schemaTypes.join(", "), detail: `${schemaValid} valid JSON-LD block(s) found.` }
        : { component: "SEO Analysis", attribute: "Structured data (schema.org)", status: "FLAGGED", detail: "No valid JSON-LD structured data found.", fix: "Add JSON-LD structured data (e.g. Organization, Product, FAQPage) matching the page content." },
    );

    findings.push({ component: "SEO Analysis", attribute: "Link structure", status: "INFO", value: `${dom.internalLinks} internal / ${dom.externalLinks} external`, detail: "Counted from visible anchor elements." });

    // ---- AEO / GEO Analysis (scored separately from SEO) ----
    findings.push(
      llmsRes.ok
        ? { component: "AEO / GEO Analysis", attribute: "llms.txt presence", status: "PASS", detail: "llms.txt is reachable." }
        : { component: "AEO / GEO Analysis", attribute: "llms.txt presence", status: "INFO", detail: "No llms.txt found. This is a newer, less standardized convention — treat as directional.", fix: "Consider publishing an llms.txt summarizing the site for language-model consumers." },
    );
    findings.push(
      dom.faqLike
        ? { component: "AEO / GEO Analysis", attribute: "Extractable Q&A / FAQ structure", status: "PASS", detail: "Detected FAQ-like markup or Q&A phrasing." }
        : { component: "AEO / GEO Analysis", attribute: "Extractable Q&A / FAQ structure", status: "FLAGGED", detail: "No FAQ/Q&A block detected.", fix: "Add a direct Q&A or definition block a model can extract in isolation." },
    );
    const h1Text = dom.headings.find((h) => h.level === 1)?.text ?? "";
    findings.push(
      h1Text.length >= 8
        ? { component: "AEO / GEO Analysis", attribute: "Entity clarity (H1 states the subject)", status: "PASS", value: `"${h1Text}"` }
        : { component: "AEO / GEO Analysis", attribute: "Entity clarity (H1 states the subject)", status: "FLAGGED", detail: "H1 is missing or too short to unambiguously state the page's subject.", fix: "Make the H1 explicitly name the product/subject of the page." },
    );
    const chunkRatio = dom.paragraphCount > 0 ? dom.headingCount / dom.paragraphCount : 0;
    findings.push({
      component: "AEO / GEO Analysis",
      attribute: "Content chunking (self-contained sections)",
      status: chunkRatio >= 0.15 ? "PASS" : "INFO",
      value: `${dom.headingCount} headings / ${dom.paragraphCount} paragraphs`,
      detail: chunkRatio >= 0.15 ? "Content is broken into distinct, headed sections." : "Sparse heading structure relative to paragraph count — directional signal, not authoritative.",
    });

    return {
      findings,
      summary: {
        h1Count,
        contrastChecked,
        contrastFails,
        imgCount: dom.imgs.length,
        missingAlt: missingAlt.length,
        readability: score,
        wordCount: words,
      },
    };
  } finally {
    await browser.close();
  }
}
