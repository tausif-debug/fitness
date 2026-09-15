/* ============================================================
   FitCalc — BMI Calculator (Step 2)
   Units: weight in kg, height in inches (fixed, per spec).
   BMI = kg / (m^2), where m = inches × 0.0254
   ============================================================ */

(function () {
  "use strict";

  var IN_TO_M = 0.0254;

  // Gauge scale: BMI 15 → 40+
  var GAUGE_MIN = 15;
  var GAUGE_MAX = 40;

  // Validation bounds
  var WEIGHT_MIN = 20, WEIGHT_MAX = 400;   // kg
  var HEIGHT_MIN = 36, HEIGHT_MAX = 96;    // inches (3 ft → 8 ft)

  function $(id) {
    return document.getElementById(id);
  }

  function fmt(n, digits) {
    return n.toFixed(digits === undefined ? 1 : digits);
  }

  /* WHO categories (with obesity classes) */
  function categoryFor(bmi) {
    if (bmi < 18.5) return { label: "Underweight", cls: "cat-under" };
    if (bmi < 25)   return { label: "Normal",      cls: "cat-normal" };
    if (bmi < 30)   return { label: "Overweight",  cls: "cat-over" };
    if (bmi < 35)   return { label: "Obese · Class I",  cls: "cat-obese" };
    if (bmi < 40)   return { label: "Obese · Class II", cls: "cat-obese" };
    return { label: "Obese · Class III", cls: "cat-obese" };
  }

  function gaugePosition(bmi) {
    var pct = ((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  function showError(msg) {
    var err = $("bmi-error");
    err.textContent = msg;
    err.hidden = false;
    $("bmi-output").hidden = true;
    $("bmi-empty").hidden = false;
  }

  function clearError() {
    $("bmi-error").hidden = true;
  }

  function calculate(weightKg, heightIn) {
    var meters = heightIn * IN_TO_M;
    var bmi = weightKg / (meters * meters);

    var cat = categoryFor(bmi);

    // Healthy weight range for this height (BMI 18.5 – 24.9)
    var lowKg = 18.5 * meters * meters;
    var highKg = 24.9 * meters * meters;

    // Distance to healthy range
    var distance;
    if (bmi < 18.5) {
      distance = "Gain " + fmt(lowKg - weightKg) + " kg to reach BMI 18.5";
    } else if (bmi > 24.9) {
      distance = "Lose " + fmt(weightKg - highKg) + " kg to reach BMI 24.9";
    } else {
      distance = "In range — no change needed 💪";
    }

    // Render
    $("bmi-empty").hidden = true;
    $("bmi-output").hidden = false;

    $("bmi-value").textContent = fmt(bmi);

    var catEl = $("bmi-category");
    catEl.textContent = cat.label;
    catEl.className = cat.cls;

    $("bmi-marker").style.left = gaugePosition(bmi) + "%";
    $("bmi-healthy-range").textContent = fmt(lowKg) + " – " + fmt(highKg) + " kg";
    $("bmi-distance").textContent = distance;
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();

    var weight = parseFloat($("bmi-weight").value);
    var height = parseFloat($("bmi-height").value);

    if (isNaN(weight) || isNaN(height)) {
      showError("Please enter both weight (kg) and height (inches).");
      return;
    }
    if (weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      showError("Weight must be between " + WEIGHT_MIN + " and " + WEIGHT_MAX + " kg.");
      return;
    }
    if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
      showError("Height must be between " + HEIGHT_MIN + " and " + HEIGHT_MAX + " inches (3–8 ft).");
      return;
    }

    calculate(weight, height);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("bmi-form").addEventListener("submit", onSubmit);

    // Recalculate live as the user tweaks numbers (only if a result is showing)
    ["bmi-weight", "bmi-height"].forEach(function (id) {
      $(id).addEventListener("input", function () {
        if (!$("bmi-output").hidden) {
          var w = parseFloat($("bmi-weight").value);
          var h = parseFloat($("bmi-height").value);
          if (!isNaN(w) && !isNaN(h) &&
              w >= WEIGHT_MIN && w <= WEIGHT_MAX &&
              h >= HEIGHT_MIN && h <= HEIGHT_MAX) {
            clearError();
            calculate(w, h);
          }
        }
      });
    });
  });
})();
