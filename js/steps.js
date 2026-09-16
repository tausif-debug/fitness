/* ============================================================
   FitCalc — Daily Steps (renders from the shared profile)
   Targets: health 10k (<60) / 8k (60+); weight loss +2k.
   Profile goal "cut" maps to the weight-loss mode.
   Stride = 0.414 × height · kcal = MET 3.5 × kg × h @ 4.8 km/h
   ============================================================ */

(function () {
  "use strict";

  var STRIDE_FACTOR = 0.414;
  var WALK_KMH = 4.8;
  var WALK_MET = 3.5;

  var TARGETS = {
    health: {
      under60: { target: 10000, lo: 8000, hi: 10000 },
      over60:  { target: 8000,  lo: 6000, hi: 8000 },
    },
    weightloss: {
      under60: { target: 12000, lo: 10000, hi: 12000 },
      over60:  { target: 10000, lo: 8000,  hi: 10000 },
    },
  };

  var GAUGE_MAX = 15000;

  function $(id) {
    return document.getElementById(id);
  }

  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      $("steps-empty").hidden = false;
      $("steps-output").hidden = true;
      return;
    }

    var mode = FitCalc.calc.stepsGoal(p); // "health" | "weightloss"
    var t = TARGETS[mode][p.age >= 60 ? "over60" : "under60"];

    var heightCm = FitCalc.calc.heightCm(p);
    var strideM = (heightCm * STRIDE_FACTOR) / 100;
    var distKm = (t.target * strideM) / 1000;
    var hours = distKm / WALK_KMH;
    var kcal = WALK_MET * p.weightKg * hours;

    FitCalc.ui.summary("steps-summary", [
      ["Age", p.age + " years"],
      ["Weight", p.weightKg + " kg"],
      ["Height", p.heightIn + " in"],
      ["Mode", mode === "weightloss" ? "Weight loss (goal: cut)" : "General health"],
    ]);

    $("steps-empty").hidden = true;
    $("steps-output").hidden = false;

    $("steps-target").textContent = fmtInt(t.target);
    $("steps-target-label").textContent =
      (mode === "weightloss" ? "Daily step target — weight loss" : "Daily step target — general health") +
      (p.age >= 60 ? " (age 60+)" : "");

    $("steps-range").textContent = fmtInt(t.lo) + " – " + fmtInt(t.hi) + " steps/day";
    $("steps-distance").textContent = "≈ " + distKm.toFixed(1) + " km/day";
    $("steps-stride").textContent = "≈ " + fmtInt(strideM * 100) + " cm";
    $("steps-kcal").textContent = "≈ " + fmtInt(kcal) + " kcal/day";
    $("steps-week").textContent = "≈ " + (distKm * 7).toFixed(1) + " km/week";

    var pct = Math.min(100, (t.target / GAUGE_MAX) * 100);
    $("steps-marker").style.left = pct + "%";
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    render();
  });
})();
