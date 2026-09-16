/* ============================================================
   FitCalc — Daily Steps Calculator
   Units: weight in kg, height in inches (fixed, per spec).

   Step targets (cohort meta-analyses, e.g. Paluch et al. 2021):
     health:     <60y → 10,000 (range 8,000–10,000)
                 60+y →  8,000 (range 6,000–8,000)
     weightloss: health target + 2,000
   Stride (m)   = height(cm) × 0.414 / 100
   Distance     = steps × stride
   Calories     = MET 3.5 × kg × hours, at ~4.8 km/h moderate pace
   ============================================================ */

(function () {
  "use strict";

  var IN_TO_CM = 2.54;
  var STRIDE_FACTOR = 0.414; // stride length ≈ 0.414 × height
  var WALK_KMH = 4.8;        // moderate walking pace
  var WALK_MET = 3.5;        // MET value for moderate walking

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

  var LIMITS = {
    age:    { min: 10, max: 100 },
    weight: { min: 20, max: 400 },
    height: { min: 36, max: 96 },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmtInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function render(goal, age, weightKg, heightIn) {
    var t = TARGETS[goal][age >= 60 ? "over60" : "under60"];

    var heightCm = heightIn * IN_TO_CM;
    var strideM = (heightCm * STRIDE_FACTOR) / 100;
    var distKm = (t.target * strideM) / 1000;
    var hours = distKm / WALK_KMH;
    var kcal = WALK_MET * weightKg * hours;

    $("steps-empty").hidden = true;
    $("steps-output").hidden = false;

    $("steps-target").textContent = fmtInt(t.target);
    $("steps-target-label").textContent =
      (goal === "weightloss" ? "Daily step target — weight loss" : "Daily step target — general health") +
      (age >= 60 ? " (age 60+)" : "");

    $("steps-range").textContent = fmtInt(t.lo) + " – " + fmtInt(t.hi) + " steps/day";
    $("steps-distance").textContent = "≈ " + distKm.toFixed(1) + " km/day";
    $("steps-stride").textContent = "≈ " + fmtInt(strideM * 100) + " cm";
    $("steps-kcal").textContent = "≈ " + fmtInt(kcal) + " kcal/day";
    $("steps-week").textContent = "≈ " + (distKm * 7).toFixed(1) + " km/week";

    var pct = Math.min(100, (t.target / GAUGE_MAX) * 100);
    $("steps-marker").style.left = pct + "%";
  }

  function showError(msg) {
    var err = $("steps-error");
    err.textContent = msg;
    err.hidden = false;
    $("steps-output").hidden = true;
    $("steps-empty").hidden = false;
  }

  function clearError() {
    $("steps-error").hidden = true;
  }

  function readForm() {
    var goalEl = document.querySelector('input[name="steps-goal"]:checked');
    var goal = goalEl ? goalEl.value : "health";

    var age = parseFloat($("steps-age").value);
    var weight = parseFloat($("steps-weight").value);
    var height = parseFloat($("steps-height").value);

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
      return { error: "Please fill in age, weight (kg) and height (inches)." };
    }
    if (age < LIMITS.age.min || age > LIMITS.age.max) {
      return { error: "Age must be between " + LIMITS.age.min + " and " + LIMITS.age.max + " years." };
    }
    if (weight < LIMITS.weight.min || weight > LIMITS.weight.max) {
      return { error: "Weight must be between " + LIMITS.weight.min + " and " + LIMITS.weight.max + " kg." };
    }
    if (height < LIMITS.height.min || height > LIMITS.height.max) {
      return { error: "Height must be between " + LIMITS.height.min + " and " + LIMITS.height.max + " inches (3–8 ft)." };
    }
    return { goal: goal, age: age, weight: weight, height: height };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.goal, v.age, v.weight, v.height);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("steps-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing
    function liveUpdate() {
      if ($("steps-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.goal, v.age, v.weight, v.height);
      }
    }

    $("steps-form").addEventListener("input", liveUpdate);
    $("steps-form").addEventListener("change", liveUpdate);
  });
})();
