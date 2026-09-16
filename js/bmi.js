/* ============================================================
   FitCalc — BMI (renders from the shared profile)
   BMI = kg / (m^2), m = inches × 0.0254
   ============================================================ */

(function () {
  "use strict";

  var GAUGE_MIN = 15;
  var GAUGE_MAX = 40;

  function $(id) {
    return document.getElementById(id);
  }

  function categoryFor(bmi) {
    if (bmi < 18.5) return { label: "Underweight", cls: "cat-under" };
    if (bmi < 25)   return { label: "Normal",      cls: "cat-normal" };
    if (bmi < 30)   return { label: "Overweight",  cls: "cat-over" };
    if (bmi < 35)   return { label: "Obese · Class I",  cls: "cat-obese" };
    if (bmi < 40)   return { label: "Obese · Class II", cls: "cat-obese" };
    return { label: "Obese · Class III", cls: "cat-obese" };
  }

  function showEmpty() {
    $("bmi-empty").hidden = false;
    $("bmi-output").hidden = true;
  }

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      showEmpty();
      return;
    }

    var m = FitCalc.calc.heightM(p);
    var bmi = p.weightKg / (m * m);
    var cat = categoryFor(bmi);
    var lowKg = 18.5 * m * m;
    var highKg = 24.9 * m * m;

    var distance;
    if (bmi < 18.5) {
      distance = "Gain " + (lowKg - p.weightKg).toFixed(1) + " kg to reach BMI 18.5";
    } else if (bmi > 24.9) {
      distance = "Lose " + (p.weightKg - highKg).toFixed(1) + " kg to reach BMI 24.9";
    } else {
      distance = "In range — no change needed 💪";
    }

    FitCalc.ui.summary("bmi-summary", [
      ["Weight", p.weightKg + " kg"],
      ["Height", p.heightIn + " in"],
    ]);

    $("bmi-empty").hidden = true;
    $("bmi-output").hidden = false;

    $("bmi-value").textContent = bmi.toFixed(1);
    var catEl = $("bmi-category");
    catEl.textContent = cat.label;
    catEl.className = cat.cls;

    var pct = ((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
    $("bmi-marker").style.left = Math.max(0, Math.min(100, pct)) + "%";
    $("bmi-healthy-range").textContent = lowKg.toFixed(1) + " – " + highKg.toFixed(1) + " kg";
    $("bmi-distance").textContent = distance;
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    render();
  });
})();
