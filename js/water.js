/* ============================================================
   FitCalc — Water Intake (renders from the shared profile)
   Base 33 ml/kg + 12 ml per training minute + climate adder.
   Training minutes are derived from the profile activity level:
     sedentary 0 · light 30 · moderate 45 · very active 60 · athlete 90
   ============================================================ */

(function () {
  "use strict";

  var ML_PER_KG = 33;
  var ML_PER_MIN = 12;
  var GLASS_ML = 250;
  var BOTTLE_ML = 500;
  var MAX_CUPS_SHOWN = 16;

  function $(id) {
    return document.getElementById(id);
  }

  function fmtMl(ml) {
    return Math.round(ml).toLocaleString("en-US") + " ml";
  }

  function renderCups(totalMl) {
    var row = $("water-cups");
    row.innerHTML = "";

    var cupsNeeded = Math.ceil(totalMl / GLASS_ML);
    var shown = Math.min(cupsNeeded, MAX_CUPS_SHOWN);

    for (var i = 0; i < shown; i++) {
      var cup = document.createElement("div");
      cup.className = "cup";
      var fill = document.createElement("div");
      fill.className = "fill";
      var remaining = totalMl - i * GLASS_ML;
      var frac = Math.max(0, Math.min(1, remaining / GLASS_ML));
      fill.style.height = (frac * 100).toFixed(1) + "%";
      cup.appendChild(fill);
      row.appendChild(cup);
    }

    var caption = "≈ " + (totalMl / GLASS_ML).toFixed(1) + " glasses of 250 ml";
    if (cupsNeeded > MAX_CUPS_SHOWN) {
      caption += " — showing first " + MAX_CUPS_SHOWN;
    }
    $("water-cup-caption").textContent = caption;
  }

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      $("water-empty").hidden = false;
      $("water-output").hidden = true;
      return;
    }

    var workoutMin = FitCalc.calc.trainingMin(p);
    var climateMl = p.climate || 0;

    var baseMl = p.weightKg * ML_PER_KG;
    var workoutMl = workoutMin * ML_PER_MIN;
    var totalMl = baseMl + workoutMl + climateMl;

    FitCalc.ui.summary("water-summary", [
      ["Weight", p.weightKg + " kg"],
      ["Training", workoutMin + " min/day (" + (FitCalc.labels.activity[String(p.activity)] || "—") + ")"],
      ["Climate", FitCalc.labels.climate[String(climateMl)] || "Temperate"],
    ]);

    $("water-empty").hidden = true;
    $("water-output").hidden = false;

    $("water-litres").textContent = (totalMl / 1000).toFixed(1);
    $("water-base").textContent = fmtMl(baseMl);
    $("water-workout-add").textContent =
      workoutMin > 0 ? "+" + fmtMl(workoutMl) + " (" + workoutMin + " min)" : "rest day";
    $("water-climate-add").textContent = climateMl > 0 ? "+" + fmtMl(climateMl) : "none";
    $("water-bottles").textContent = "≈ " + (totalMl / BOTTLE_ML).toFixed(1);

    renderCups(totalMl);
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    render();
  });
})();
