/**
 * Eye Tracking — Embeddable Script
 * Usage:
 *   <script src="https://yourapp.com/eye-tracker.js"
 *           data-api-key="SITE_API_KEY"
 *           data-page-key="PAGE_KEY"
 *           data-eye-tracking="true"
 *           async></script>
 *
 * Mouse/click/scroll/touch tracking is always on for a registered page —
 * same "silent is fine for aggregate behavior" rule Pillar 2's snippet runs
 * on. Webcam gaze capture (eye_gaze) is the one signal that needs a person's
 * consent, so it's gated behind an on-page banner and only offered at all
 * when data-eye-tracking="true".
 */
(function () {
  "use strict";

  var script =
    document.currentScript ||
    document.querySelector("script[data-api-key]") ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var API_KEY = script.getAttribute("data-api-key");
  var PAGE_KEY = script.getAttribute("data-page-key");
  var EYE_TRACKING = script.getAttribute("data-eye-tracking") === "true";
  var BASE_URL = new URL(script.src).origin;

  if (!API_KEY || !PAGE_KEY) {
    console.warn("[EyeTracker] Missing data-api-key or data-page-key");
    return;
  }

  var sessionId = null;
  var eventQueue = [];
  var lastMouseTime = 0;
  var THROTTLE_MS = 50;

  // ── Load html2canvas immediately ───────────────────────────────────────
  var h2cLoaded = false;
  var screenshotSent = false;
  (function () {
    var s = document.createElement("script");
    s.src = BASE_URL + "/vendor/html2canvas-1.4.1.min.js";
    s.async = true;
    s.onload = function () {
      h2cLoaded = true;
    };
    s.onerror = function () {
      console.error("[EyeTracker] Failed to load html2canvas — screenshot will not be captured");
    };
    (document.head || document.documentElement).appendChild(s);
  })();

  // ── Event queue ───────────────────────────────────────────────────────
  function push(type, x, y) {
    var pageHeight = document.documentElement.scrollHeight;
    var normX = Math.max(0, Math.min(1, x / window.innerWidth));
    var normY = Math.max(0, Math.min(1, (y + window.scrollY) / pageHeight));
    eventQueue.push({ type: type, x: normX, y: normY });
  }

  function flush(opts) {
    var payload = {
      apiKey: API_KEY,
      pageKey: PAGE_KEY,
      sessionId: sessionId,
      pageUrl: window.location.href,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pageScrollHeight: document.documentElement.scrollHeight,
      events: eventQueue.slice(),
    };
    if (opts && opts.ended) payload.endedAt = new Date().toISOString();

    eventQueue = [];
    if (!opts || !opts.init) {
      if (!payload.events.length && !payload.endedAt) return;
    }

    fetch(BASE_URL + "/api/eye-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!sessionId && data.sessionId) sessionId = data.sessionId;
      })
      .catch(function (err) { console.warn("[EyeTracker] Flush error:", err); });
  }

  // ── Mouse & touch tracking ────────────────────────────────────────────
  document.addEventListener("mousemove", function (e) {
    var now = Date.now();
    if (now - lastMouseTime < THROTTLE_MS) return;
    lastMouseTime = now;
    push("mouse_move", e.clientX, e.clientY);
  });

  document.addEventListener("click", function (e) {
    push("click", e.clientX, e.clientY);
  });

  var lastTouchTime = 0;
  document.addEventListener(
    "touchmove",
    function (e) {
      var now = Date.now();
      if (now - lastTouchTime < THROTTLE_MS) return;
      lastTouchTime = now;
      var t = e.touches[0];
      if (t) push("mouse_move", t.clientX, t.clientY);
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function (e) {
      var t = e.changedTouches[0];
      if (t) push("click", t.clientX, t.clientY);
    },
    { passive: true },
  );

  // ── Long press ────────────────────────────────────────────────────────
  var longPressTimer = null;
  var longPressX = 0;
  var longPressY = 0;
  var longPressMoved = false;
  var LONG_PRESS_MS = 500;
  var LONG_PRESS_MOVE_THRESHOLD = 10;

  document.addEventListener(
    "touchstart",
    function (e) {
      var t = e.touches[0];
      if (!t) return;
      longPressX = t.clientX;
      longPressY = t.clientY;
      longPressMoved = false;
      longPressTimer = setTimeout(function () {
        if (!longPressMoved) push("long_press", longPressX, longPressY);
      }, LONG_PRESS_MS);
    },
    { passive: true },
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      var t = e.touches[0];
      if (!t) return;
      var dx = t.clientX - longPressX;
      var dy = t.clientY - longPressY;
      if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_MOVE_THRESHOLD) {
        longPressMoved = true;
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function () {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    },
    { passive: true },
  );

  // ── Double tap ────────────────────────────────────────────────────────
  var lastTapTime = 0;
  var lastTapX = 0;
  var lastTapY = 0;
  var DOUBLE_TAP_MS = 300;
  var DOUBLE_TAP_RADIUS = 30;

  document.addEventListener(
    "touchend",
    function (e) {
      var t = e.changedTouches[0];
      if (!t) return;
      var now = Date.now();
      var dx = t.clientX - lastTapX;
      var dy = t.clientY - lastTapY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (now - lastTapTime < DOUBLE_TAP_MS && dist < DOUBLE_TAP_RADIUS) {
        push("double_tap", t.clientX, t.clientY);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapX = t.clientX;
        lastTapY = t.clientY;
      }
    },
    { passive: true },
  );

  // ── Pinch ─────────────────────────────────────────────────────────────
  var pinchStartDist = 0;
  var PINCH_MIN_DELTA = 20;

  document.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 2) {
        var t0 = e.touches[0];
        var t1 = e.touches[1];
        var dx = t1.clientX - t0.clientX;
        var dy = t1.clientY - t0.clientY;
        pinchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function (e) {
      if (pinchStartDist > 0 && e.changedTouches.length >= 1) {
        var allTouches = e.touches.length > 0 ? e.touches : e.changedTouches;
        if (allTouches.length >= 2) {
          var cx = (allTouches[0].clientX + allTouches[1].clientX) / 2;
          var cy = (allTouches[0].clientY + allTouches[1].clientY) / 2;
          push("pinch", cx, cy);
        } else if (e.changedTouches.length >= 2) {
          var ct0 = e.changedTouches[0];
          var ct1 = e.changedTouches[1];
          var dx2 = ct1.clientX - ct0.clientX;
          var dy2 = ct1.clientY - ct0.clientY;
          var endDist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (Math.abs(endDist - pinchStartDist) > PINCH_MIN_DELTA) {
            push("pinch", (ct0.clientX + ct1.clientX) / 2, (ct0.clientY + ct1.clientY) / 2);
          }
        }
        pinchStartDist = 0;
      }
    },
    { passive: true },
  );

  // ── Scroll ────────────────────────────────────────────────────────────
  var lastScrollTime = 0;
  document.addEventListener(
    "scroll",
    function () {
      var now = Date.now();
      if (now - lastScrollTime < 200) return;
      lastScrollTime = now;
      var pageHeight = document.documentElement.scrollHeight;
      if (pageHeight <= window.innerHeight) return;
      var frac = Math.max(0, Math.min(1, (window.scrollY + window.innerHeight / 2) / pageHeight));
      eventQueue.push({ type: "scroll", x: 0.5, y: frac });
    },
    { passive: true },
  );

  setInterval(flush, 2000);

  // ── Screenshot capture ────────────────────────────────────────────────
  function doScreenshot() {
    if (screenshotSent) return;
    if (!h2cLoaded) return;
    screenshotSent = true;
    var captureWidth = window.innerWidth;
    var captureHeight = document.documentElement.scrollHeight;
    window
      .html2canvas(document.documentElement, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 1.0,
        windowWidth: captureWidth,
        windowHeight: window.innerHeight,
      })
      .then(function (canvas) {
        canvas.toBlob(
          function (blob) {
            if (!blob) { screenshotSent = false; return; }
            var fd = new FormData();
            fd.append("apiKey", API_KEY);
            fd.append("pageKey", PAGE_KEY);
            fd.append("viewportWidth", String(captureWidth));
            fd.append("pageScrollHeight", String(captureHeight));
            fd.append("image", blob, "screenshot.jpg");
            fetch(BASE_URL + "/api/eye-screenshot", { method: "POST", body: fd }).catch(function (err) {
              console.warn("[EyeTracker] Screenshot upload error:", err);
            });
          },
          "image/jpeg",
          0.75,
        );
      })
      .catch(function (err) {
        screenshotSent = false;
        console.warn("[EyeTracker] Screenshot capture error:", err);
      });
  }

  function scheduleScreenshot() {
    if (h2cLoaded) { doScreenshot(); return; }
    var waited = 0;
    var iv = setInterval(function () {
      waited += 300;
      if (h2cLoaded) { clearInterval(iv); doScreenshot(); return; }
      if (waited >= 15000) clearInterval(iv);
    }, 300);
  }

  // ── Eye tracking (consent-gated webcam gaze capture) ─────────────────
  function loadWebGazer() {
    var s = document.createElement("script");
    s.src = BASE_URL + "/vendor/webgazer-2.1.0.js";
    s.onerror = function () { console.warn("[EyeTracker] Failed to load WebGazer"); };
    s.onload = function () {
      if (!window.webgazer) return;
      window.webgazer
        .setGazeListener(function (data) {
          if (!data) return;
          push("eye_gaze", data.x, data.y);
        })
        .begin();
      setTimeout(function () {
        ["webgazerVideoFeed", "webgazerFaceOverlay", "webgazerGazeDot"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
      }, 2000);
    };
    document.head.appendChild(s);
  }

  function showConsentBanner() {
    var banner = document.createElement("div");
    banner.id = "__eyetracker_consent";
    banner.style.cssText = [
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%)",
      "background:#fbf6ea;border:2px solid #332a22",
      "box-shadow:6px 6px 0 rgba(51,42,34,0.18)",
      "padding:14px 18px;z-index:999999",
      "display:flex;align-items:center;gap:12px",
      "font-family:Georgia,serif;font-size:13.5px;color:#332a22",
      "max-width:520px;width:calc(100% - 40px)",
    ].join(";");
    banner.innerHTML = [
      '<span style="flex:1">This site uses <strong>eye tracking</strong> for UX research. Allow webcam access?</span>',
      '<button id="__eyetracker_allow" style="background:#d9a441;color:#332a22;border:2px solid #332a22;padding:7px 14px;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:inherit">Allow</button>',
      '<button id="__eyetracker_decline" style="background:#fbf6ea;color:#5c4f41;border:2px solid #332a22;padding:7px 12px;font-size:12.5px;cursor:pointer;white-space:nowrap;font-family:inherit">Decline</button>',
    ].join("");
    document.body.appendChild(banner);
    document.getElementById("__eyetracker_allow").addEventListener("click", function () { banner.remove(); loadWebGazer(); });
    document.getElementById("__eyetracker_decline").addEventListener("click", function () { banner.remove(); });
  }

  // ── Visibility / unload ───────────────────────────────────────────────
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      flush({ ended: true });
      doScreenshot();
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    flush({ init: true });
    if (EYE_TRACKING) setTimeout(showConsentBanner, 1500);
    var screenshotScheduled = false;
    function triggerScreenshot() {
      if (screenshotScheduled) return;
      screenshotScheduled = true;
      setTimeout(scheduleScreenshot, 1500);
    }
    if (document.readyState === "complete") {
      triggerScreenshot();
    } else {
      window.addEventListener("load", triggerScreenshot);
      setTimeout(triggerScreenshot, 5000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
