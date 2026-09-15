/* ============================================================
   FitCalc — Water Intake Calculator
   Units: weight in kg, output in litres/ml (fixed, per spec).
   Base:     33 ml per kg body weight
   Training: +12 ml per minute of exercise (~350 ml / 30 min)
   Climate:  +0 / +500 / +750 ml (temperate / hot-humid / hot-dry)
   ============================================================ */

(function () {
  "use strict";

  var ML_PER_KG = 33;
  var ML_PER_MIN = 12;
  var GLASS_ML = 250;
  var BOTTLE_ML = 500;

  var WEIGHT_MIN = 20, WEIGHT_MAX = 400;   // kg
  var WORKOUT_MAX = 300;                    // minutes/day

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

  function render(weightKg, workoutMin, climateMl) {
    var baseMl = weightKg * ML_PER_KG;
    var workoutMl = workoutMin * ML_PER_MIN;
    var totalMl = baseMl + workoutMl + climateMl;

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

  function showError(msg) {
    var err = $("water-error");
    err.textContent = msg;
    err.hidden = false;
    $("water-output").hidden = true;
    $("water-empty").hidden = false;
  }

  function clearError() {
    $("water-error").hidden = true;
  }

  function readForm() {
    var weight = parseFloat($("water-weight").value);
    var workoutRaw = $("water-workout").value.trim();
    var workout = workoutRaw === "" ? 0 : parseFloat(workoutRaw);
    var climate = parseFloat($("water-climate").value) || 0;

    if (isNaN(weight)) {
      return { error: "Please enter your weight (kg)." };
    }
    if (weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      return { error: "Weight must be between " + WEIGHT_MIN + " and " + WEIGHT_MAX + " kg." };
    }
    if (isNaN(workout) || workout < 0 || workout > WORKOUT_MAX) {
      return { error: "Training minutes must be between 0 and " + WORKOUT_MAX + "." };
    }
    return { weight: weight, workout: workout, climate: climate };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.weight, v.workout, v.climate);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("water-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing
    function liveUpdate() {
      if ($("water-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.weight, v.workout, v.climate);
      }
    }

    $("water-form").addEventListener("input", liveUpdate);
    $("water-form").addEventListener("change", liveUpdate);
  });
})();
