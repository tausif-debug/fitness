/* ============================================================
   FitCalc — fx: tiny animation helpers (zero deps)
   Count-up numbers; disabled with ?nofx=1 or when the user
   prefers reduced motion (the e2e tests use ?nofx=1).
   ============================================================ */

(function () {
  "use strict";

  var disabled = /[?&]nofx/.test(window.location.search) ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function count(el, to, fmt) {
    if (!el) return;
    if (disabled) { el.textContent = fmt(to); return; }
    var raw = (el.textContent || "").replace(/[^0-9.\-]/g, "");
    var from = parseFloat(raw);
    if (isNaN(from)) from = 0;
    var t0 = null;
    var dur = 650;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  window.FitCalc = window.FitCalc || {};
  FitCalc.fx = {
    count: count,
    disabled: function () { return disabled; },
  };
})();
