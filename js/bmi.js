/* ============================================================
   FitCalc — BMI (renders from the shared profile, translated)
   BMI = kg / (m^2), m = inches × 0.0254
   ============================================================ */

(function () {
  "use strict";

  var GAUGE_MIN = 15;
  var GAUGE_MAX = 40;

  function $(id) {
    return document.getElementById(id);
  }

  function t(key, params) {
    return FitCalc.i18n.t(key, params);
  }

  function categoryFor(bmi) {
    if (bmi < 18.5) return { key: "bmi.cat.under", cls: "cat-under" };
    if (bmi < 25)   return { key: "bmi.cat.normal", cls: "cat-normal" };
    if (bmi < 30)   return { key: "bmi.cat.over", cls: "cat-over" };
    if (bmi < 35)   return { key: "bmi.cat.obese1", cls: "cat-obese" };
    if (bmi < 40)   return { key: "bmi.cat.obese2", cls: "cat-obese" };
    return { key: "bmi.cat.obese3", cls: "cat-obese" };
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
      distance = t("bmi.gain", { x: (lowKg - p.weightKg).toFixed(1) });
    } else if (bmi > 24.9) {
      distance = t("bmi.lose", { x: (p.weightKg - highKg).toFixed(1) });
    } else {
      distance = t("bmi.inRange");
    }

    FitCalc.ui.summary("bmi-summary", [
      [t("row.weight"), p.weightKg + " kg"],
      [t("row.height"), p.heightIn + " in"],
    ]);

    $("bmi-empty").hidden = true;
    $("bmi-output").hidden = false;

    $("bmi-value").textContent = bmi.toFixed(1);
    var catEl = $("bmi-category");
    catEl.textContent = t(cat.key);
    catEl.className = cat.cls;

    var pct = ((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
    $("bmi-marker").style.left = Math.max(0, Math.min(100, pct)) + "%";
    $("bmi-healthy-range").textContent = lowKg.toFixed(1) + " – " + highKg.toFixed(1) + " kg";
    $("bmi-distance").textContent = distance;
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    FitCalc.i18n.onChange(render);
    render();
  });
})();
