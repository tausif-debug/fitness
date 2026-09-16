/* ============================================================
   FitCalc — Macro Split (renders from the shared profile)
   Calories = TDEE adjusted by the profile goal:
     cut −500 · maintain = TDEE · lean bulk +250
   Protein 1.6–2.2 g/kg by goal · fat 25–27.5% · carbs remainder
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

  var PROTEIN_CAP_PCT = 0.35;
  var LOW_CARB_PCT = 0.1;

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

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      $("macro-empty").hidden = false;
      $("macro-output").hidden = true;
      return;
    }

    var g = GOALS[p.goal] || GOALS.maintain;
    var calories = FitCalc.calc.targetKcal(p);
    var warnings = [];

    var proteinG = p.weightKg * g.proteinGPerKg;
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

    var fatKcal = calories * g.fatPct;
    var fatG = fatKcal / KCAL_PER_G.fat;

    var carbKcal = Math.max(0, calories - proteinKcal - fatKcal);
    var carbG = carbKcal / KCAL_PER_G.carbs;
    if (carbKcal / calories < LOW_CARB_PCT) {
      warnings.push(
        "Carbs come out very low (< 10% of calories). If you train hard, consider a smaller deficit."
      );
    }

    FitCalc.ui.summary("macros-summary", [
      ["Goal", FitCalc.labels.goal[p.goal]],
      ["Daily calories", fmt0(calories) + " kcal (from your TDEE)"],
      ["Weight", p.weightKg + " kg"],
    ]);

    $("macro-empty").hidden = true;
    $("macro-output").hidden = false;

    setMacro("macro-protein", proteinG, proteinKcal, calories);
    setMacro("macro-carbs", carbG, carbKcal, calories);
    setMacro("macro-fat", fatG, fatKcal, calories);

    $("macro-bar-protein").style.width = (proteinKcal / calories) * 100 + "%";
    $("macro-bar-carbs").style.width = (carbKcal / calories) * 100 + "%";
    $("macro-bar-fat").style.width = (fatKcal / calories) * 100 + "%";

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

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    render();
  });
})();
