(function () {
  "use strict";
  var script = document.currentScript;
  var testId = script && script.getAttribute("data-test-id");
  if (!testId) return;
  var endpoint = (script.getAttribute("data-endpoint") || "") + "/api/usability/" + testId + "/events";

  // Only ever record for a tagged participant — never silently instrument
  // every visitor. The code arrives once via ?lp_uid on the link the
  // researcher hands out, then persists (this browser only) for the rest of
  // the study so it survives navigation to pages that don't have the param.
  var CODE_KEY = "lp_uid_" + testId;
  var params = new URLSearchParams(location.search);
  var code = params.get("lp_uid") || localStorage.getItem(CODE_KEY);
  if (!code) return;
  localStorage.setItem(CODE_KEY, code);

  var queue = [];
  function send(type, payload) {
    var evt = { type: type, url: location.href };
    for (var k in payload) evt[k] = payload[k];
    queue.push(evt);
  }

  function flush(useBeacon) {
    if (queue.length === 0) return;
    var body = JSON.stringify({ code: code, events: queue });
    queue = [];
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function () {});
    }
  }
  setInterval(function () { flush(false); }, 3000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", function () { flush(true); });

  send("pageview", {});

  function elementLabel(el) {
    var text = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
    return text.slice(0, 60);
  }
  function elementSelector(el) {
    if (!el.tagName) return "unknown";
    var sel = el.tagName.toLowerCase();
    if (el.id) sel += "#" + el.id;
    else if (el.className && typeof el.className === "string") sel += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    return sel;
  }

  var recentClicks = [];
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target;
      var rect = document.documentElement.getBoundingClientRect();
      var xPct = (e.pageX - rect.left) / document.documentElement.scrollWidth;
      var yPct = (e.pageY - rect.top) / document.documentElement.scrollHeight;
      send("click", { selector: elementSelector(el), label: elementLabel(el), x: xPct, y: yPct });

      var now = Date.now();
      recentClicks = recentClicks.filter(function (c) { return now - c.t < 1200; });
      recentClicks.push({ t: now, x: e.clientX, y: e.clientY });
      var nearby = recentClicks.filter(function (c) {
        return Math.abs(c.x - e.clientX) < 40 && Math.abs(c.y - e.clientY) < 40;
      });
      if (nearby.length >= 3) {
        send("rage_click", { selector: elementSelector(el), label: elementLabel(el), x: xPct, y: yPct });
        recentClicks = [];
      }
    },
    true,
  );

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
          send("scroll_depth", { label: String(mark) });
        }
      });
    },
    { passive: true },
  );

  // Single-page apps swap the URL without a full navigation — catch pushState/
  // replaceState and back/forward so page-to-page navigation still logs as a
  // pageview (and can still trip the goal-URL match) without reloading the tag.
  ["pushState", "replaceState"].forEach(function (fn) {
    var orig = history[fn];
    history[fn] = function () {
      var ret = orig.apply(this, arguments);
      send("pageview", {});
      return ret;
    };
  });
  window.addEventListener("popstate", function () { send("pageview", {}); });
})();
