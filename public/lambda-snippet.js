(function () {
  "use strict";
  var script = document.currentScript;
  var trackingId = script && script.getAttribute("data-tracking-id");
  if (!trackingId) return;
  var endpoint = (script.getAttribute("data-endpoint") || "") + "/api/collect";

  var SESSION_KEY = "lp_sid_" + trackingId;
  var isNewSession = !sessionStorage.getItem(SESSION_KEY);
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // ---- return-visit detection (30-day window), Lambda Analytics ----
  var RETURN_WINDOW_DAYS = 30;
  var returning = false;
  if (isNewSession) {
    try {
      var firstSeenKey = "lp_first_" + trackingId;
      var firstSeenRaw = localStorage.getItem(firstSeenKey);
      if (firstSeenRaw) {
        var daysSince = (Date.now() - parseInt(firstSeenRaw, 10)) / 86400000;
        returning = daysSince <= RETURN_WINDOW_DAYS;
      } else {
        localStorage.setItem(firstSeenKey, String(Date.now()));
      }
    } catch {
      // localStorage blocked (private browsing, etc.) — return-visit detection just no-ops.
    }
  }

  function device() {
    var w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }

  function source() {
    var params = new URLSearchParams(location.search);
    var utm = params.get("utm_source");
    if (utm) return utm;
    if (!document.referrer) return "direct";
    try {
      var host = new URL(document.referrer).hostname;
      return host.replace(/^www\./, "");
    } catch {
      return "unknown";
    }
  }

  var queue = [];
  function send(type, payload) {
    queue.push({
      type: type,
      payload: payload || {},
      device: device(),
      source: source(),
      path: location.pathname,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
    });
  }

  function flush(useBeacon) {
    if (queue.length === 0) return;
    var body = JSON.stringify({ trackingId: trackingId, sessionId: sessionId, events: queue });
    queue = [];
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function () {});
    }
  }
  setInterval(function () { flush(false); }, 4000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", function () { flush(true); });

  // ---- campaign/source fields, Lambda Analytics ----
  var urlParams = new URLSearchParams(location.search);
  send("pageview", {
    utm_source: urlParams.get("utm_source") || null,
    utm_medium: urlParams.get("utm_medium") || null,
    utm_campaign: urlParams.get("utm_campaign") || null,
    utm_content: urlParams.get("utm_content") || null,
    utm_term: urlParams.get("utm_term") || null,
    referrer: document.referrer || null,
    returning: returning,
  });

  // ---- click density + rage-click detection ----
  var recentClicks = [];
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target;
      // pageX/pageY are already document-absolute (they include scroll
      // offset), so dividing directly by the document's full scroll
      // width/height gives the normalized position — no viewport-rect
      // correction needed. Subtracting getBoundingClientRect() here used to
      // double-count the scroll offset (that rect is viewport-relative, so
      // its top/left are already ~ -scrollY/-scrollX), inflating y past 1.0
      // for any click below the fold on a scrolled page.
      var xPct = e.pageX / document.documentElement.scrollWidth;
      var yPct = e.pageY / document.documentElement.scrollHeight;
      var selector = el.tagName ? el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") : "unknown";
      send("click", { x: xPct, y: yPct, selector: selector });

      var ctaEl = el.closest && el.closest("button,a[href]");
      if (ctaEl) {
        var ctaSelector = ctaEl.tagName.toLowerCase() + (ctaEl.id ? "#" + ctaEl.id : "");
        var ctaLabel = (ctaEl.textContent || "").trim().slice(0, 60);
        send("funnel_stage", { stage: "cta_click", selector: ctaSelector, label: ctaLabel });

        // ---- outbound link click, Lambda Analytics ----
        var href = ctaEl.getAttribute && ctaEl.getAttribute("href");
        if (href) {
          try {
            var linkHost = new URL(href, location.href).hostname;
            if (linkHost && linkHost !== location.hostname) {
              send("outbound_click", { href: href, selector: ctaSelector });
            }
          } catch {
            // Unparseable href (mailto:, javascript:, etc.) — not an outbound link.
          }
        }
      }

      var now = Date.now();
      recentClicks = recentClicks.filter(function (c) { return now - c.t < 1200; });
      recentClicks.push({ t: now, x: e.clientX, y: e.clientY });
      var nearby = recentClicks.filter(function (c) {
        return Math.abs(c.x - e.clientX) < 40 && Math.abs(c.y - e.clientY) < 40;
      });
      if (nearby.length >= 3) {
        send("rage_click", { x: xPct, y: yPct, selector: selector });
        recentClicks = [];
      }
    },
    true,
  );

  // ---- scroll depth ----
  var firedDepths = {};
  window.addEventListener(
    "scroll",
    function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = ((window.scrollY / scrollable) * 100) | 0;
      [25, 50, 75, 100].forEach(function (mark) {
        if (pct >= mark && !firedDepths[mark]) {
          firedDepths[mark] = true;
          send("scroll_depth", { depth: mark });
        }
      });
    },
    { passive: true },
  );

  // ---- form field analytics (selectors only, never values) ----
  function fieldName(el) {
    return el.name || el.id || el.tagName.toLowerCase();
  }
  document.addEventListener("focusin", function (e) {
    var el = e.target;
    if (el.matches && el.matches("input,select,textarea")) send("form_focus", { field: fieldName(el) });
  });
  document.addEventListener("focusout", function (e) {
    var el = e.target;
    if (el.matches && el.matches("input,select,textarea")) send("form_blur", { field: fieldName(el) });
  });
  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el.matches && el.matches("input,select,textarea")) send("form_change", { field: fieldName(el) });
  });
  document.addEventListener(
    "invalid",
    function (e) {
      var el = e.target;
      send("form_error", { field: fieldName(el) });
    },
    true,
  );

  // ---- real-user vitals ----
  try {
    var lcpValue = 0;
    new PerformanceObserver(function (list) {
      var entries = list.getEntries();
      lcpValue = entries[entries.length - 1].startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    var clsValue = 0;
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      });
    }).observe({ type: "layout-shift", buffered: true });

    var maxInteraction = 0;
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.duration > maxInteraction) maxInteraction = entry.duration;
      });
    }).observe({ type: "event", buffered: true, durationThreshold: 16 });

    window.addEventListener("pagehide", function () {
      send("vital", { lcp: lcpValue, cls: clsValue, inp: maxInteraction });
    });
  } catch {
    // PerformanceObserver entry types not supported in this browser
  }

  document.addEventListener("submit", function () { send("funnel_stage", { stage: "form_submit" }); }, true);

  // ---- funnel stage API ----
  window.lambdaPage = window.lambdaPage || {};
  window.lambdaPage.track = function (stage) {
    send("funnel_stage", { stage: stage });
  };

  // ---- A/B testing: cookie/session-consistent variant assignment ----
  window.lambdaPage.abAssign = function (testId, callback) {
    var cacheKey = "lp_ab_" + testId;
    var cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      callback(JSON.parse(cached));
      return;
    }
    fetch(endpoint.replace("/api/collect", "/api/ab/" + testId + "/assign"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        callback(data);
      })
      .catch(function () {});
  };
  window.lambdaPage.abConvert = function (testId) {
    fetch(endpoint.replace("/api/collect", "/api/ab/" + testId + "/convert"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId }),
      keepalive: true,
    }).catch(function () {});
  };
})();
