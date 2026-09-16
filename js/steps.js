/* ============================================================
   FitCalc — Daily Steps (renders from the shared profile, translated)
   Targets: health 10k (<60) / 8k (60+); weight loss +2k.
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

  function t(key, params) {
    return FitCalc.i18n.t(key, params);
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
    var tg = TARGETS[mode][p.age >= 60 ? "over60" : "under60"];

    var heightCm = FitCalc.calc.heightCm(p);
    var strideM = (heightCm * STRIDE_FACTOR) / 100;
    var distKm = (tg.target * strideM) / 1000;
    var hours = distKm / WALK_KMH;
    var kcal = WALK_MET * p.weightKg * hours;

    FitCalc.ui.summary("steps-summary", [
      [t("row.age"), t("val.ageYears", { n: p.age })],
      [t("row.weight"), p.weightKg + " kg"],
      [t("row.height"), p.heightIn + " in"],
      [t("row.mode"), t(mode === "weightloss" ? "steps.modeWL" : "steps.modeHealth")],
    ]);

    $("steps-empty").hidden = true;
    $("steps-output").hidden = false;

    FitCalc.fx.count($("steps-target"), tg.target, fmtInt);
    $("steps-target-label").textContent =
      t(mode === "weightloss" ? "steps.labelWL" : "steps.labelHealth") +
      (p.age >= 60 ? t("steps.age60") : "");

    $("steps-range").textContent = t("steps.rangeVal", { a: fmtInt(tg.lo), b: fmtInt(tg.hi) });
    $("steps-distance").textContent = t("steps.distVal", { x: distKm.toFixed(1) });
    $("steps-stride").textContent = t("steps.strideVal", { x: fmtInt(strideM * 100) });
    $("steps-kcal").textContent = t("steps.kcalVal", { x: fmtInt(kcal) });
    $("steps-week").textContent = t("steps.weekVal", { x: (distKm * 7).toFixed(1) });

    var pct = Math.min(100, (tg.target / GAUGE_MAX) * 100);
    $("steps-marker").style.left = pct + "%";
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    FitCalc.i18n.onChange(render);
    render();
  });
})();
