/* ============================================================
   FitCalc — Macro Split (Step 6)
   Units: weight in kg, energy in kcal.
   Defaults by goal:
     protein: cut 2.2 g/kg · maintain 1.8 g/kg · lean bulk 1.6 g/kg
     fat:     cut 25% of kcal · maintain 27.5% · lean bulk 25%
     carbs:   remaining kcal
   Atwater factors: protein 4 kcal/g · carbs 4 kcal/g · fat 9 kcal/g
   ============================================================ */

(function () {
  "use strict";

  var KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

  var GOALS = {
    cut: {
      proteinGPerKg: 2.2,
      fatPct: 0.25,
      proteinNote: "2.2 g/kg — higher protein preserves muscle in a deficit",
      fatNote: "25% of calories",
    },
    maintain: {
      proteinGPerKg: 1.8,
      fatPct: 0.275,
      proteinNote: "1.8 g/kg — plenty for maintenance and training",
      fatNote: "27.5% of calories",
    },
    bulk: {
      proteinGPerKg: 1.6,
      fatPct: 0.25,
      proteinNote: "1.6 g/kg — surplus calories spare protein for growth",
      fatNote: "25% of calories",
    },
  };

  var PROTEIN_CAP_PCT = 0.35; // never let protein exceed 35% of calories
  var LOW_CARB_PCT = 0.1;     // warn below 10% of calories from carbs

  // Wide bounds so a target sent from BMR & TDEE is never rejected
  var CAL_MIN = 500, CAL_MAX = 12000;
  var WEIGHT_MIN = 20, WEIGHT_MAX = 400;

  function $(id) {
    return document.getElementById(id);
  }

  function fmt0(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function setMacro(prefix, grams, kcal, totalKcal) {
    $(prefix + "-g").textContent = fmt0(grams);
    $(prefix + "-kcal").textContent = fmt0(kcal);
    $(prefix + "-pct").textContent = Math.round((kcal / totalKcal) * 100);
  }

  function render(goal, calories, weightKg) {
    var g = GOALS[goal];
    var warnings = [];

    // Protein (g/kg), capped at 35% of calories
    var proteinG = weightKg * g.proteinGPerKg;
    var proteinKcal = proteinG * KCAL_PER_G.protein;
    var capKcal = calories * PROTEIN_CAP_PCT;
    if (proteinKcal > capKcal) {
      proteinKcal = capKcal;
      proteinG = proteinKcal / KCAL_PER_G.protein;
      warnings.push(
        "Protein capped at 35% of calories (" + fmt0(proteinG) +
        " g) — your calorie target is low for your body weight."
      );
    }

    // Fat (% of calories)
    var fatKcal = calories * g.fatPct;
    var fatG = fatKcal / KCAL_PER_G.fat;

    // Carbs (remainder)
    var carbKcal = calories - proteinKcal - fatKcal;
    if (carbKcal < 0) carbKcal = 0;
    var carbG = carbKcal / KCAL_PER_G.carbs;
    if (carbKcal / calories < LOW_CARB_PCT) {
      warnings.push(
        "Carbs come out very low (< 10% of calories). If you train hard, consider raising calories or trimming fat."
      );
    }

    // Show
    $("macro-empty").hidden = true;
    $("macro-output").hidden = false;

    setMacro("macro-protein", proteinG, proteinKcal, calories);
    setMacro("macro-carbs", carbG, carbKcal, calories);
    setMacro("macro-fat", fatG, fatKcal, calories);

    // Stacked split bar (by kcal share)
    $("macro-bar-protein").style.width = (proteinKcal / calories) * 100 + "%";
    $("macro-bar-carbs").style.width = (carbKcal / calories) * 100 + "%";
    $("macro-bar-fat").style.width = (fatKcal / calories) * 100 + "%";

    // Rule notes
    $("macro-protein-note").textContent = g.proteinNote;
    $("macro-fat-note").textContent = g.fatNote;
    $("macro-carb-note").textContent = "Remaining calories after protein & fat";

    var warn = $("macro-warn");
    if (warnings.length) {
      warn.textContent = warnings.join(" ");
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }
  }

  function showError(msg) {
    var err = $("macro-error");
    err.textContent = msg;
    err.hidden = false;
    $("macro-output").hidden = true;
    $("macro-empty").hidden = false;
  }

  function clearError() {
    $("macro-error").hidden = true;
  }

  function readForm() {
    var goalEl = document.querySelector('input[name="macro-goal"]:checked');
    var goal = goalEl ? goalEl.value : "maintain";

    var calories = parseFloat($("macro-calories").value);
    var weight = parseFloat($("macro-weight").value);

    if (isNaN(calories) || isNaN(weight)) {
      return { error: "Please enter both daily calories (kcal) and weight (kg)." };
    }
    if (calories < CAL_MIN || calories > CAL_MAX) {
      return { error: "Daily calories must be between " + CAL_MIN + " and " + CAL_MAX + " kcal." };
    }
    if (weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      return { error: "Weight must be between " + WEIGHT_MIN + " and " + WEIGHT_MAX + " kg." };
    }
    return { goal: goal, calories: calories, weight: weight };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.goal, v.calories, v.weight);
  }

  /* ---- Cross-calculator flow (Step 7) ----
     Called by BMR & TDEE "send" buttons:
     window.FitCalc.macrosPrefill(kcal, goal, weightKg?)
     Fills the form, selects the goal, calculates, and flashes the fields. */

  window.FitCalc = window.FitCalc || {};
  window.FitCalc.macrosPrefill = function (kcal, goal, weightKg) {
    var radio = document.querySelector('input[name="macro-goal"][value="' + goal + '"]');
    if (radio) radio.checked = true;

    $("macro-calories").value = Math.round(kcal);
    if (weightKg != null) $("macro-weight").value = weightKg;

    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.goal, v.calories, v.weight);
    flashPrefilled(weightKg != null);
  };

  function flashPrefilled(includeWeight) {
    var ids = includeWeight ? ["macro-calories", "macro-weight"] : ["macro-calories"];
    ids.forEach(function (id) {
      var field = $(id).closest(".field");
      if (!field) return;
      field.classList.remove("field-flash");
      void field.offsetWidth; // force reflow so the animation restarts
      field.classList.add("field-flash");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("macro-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing (inputs + goal toggle)
    function liveUpdate() {
      if ($("macro-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.goal, v.calories, v.weight);
      }
    }

    $("macro-form").addEventListener("input", liveUpdate);
    $("macro-form").addEventListener("change", liveUpdate);
  });
})();
