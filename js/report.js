/* ============================================================
   FitCalc — PDF report builder
   Collects every calculator's results from the shared profile
   and hands the blocks to FitCalcPdf.generate().
   ============================================================ */

(function () {
  "use strict";

  var KCAL_PER_KG = 7700;
  var ML_PER_KG = 33, ML_PER_MIN = 12, GLASS_ML = 250, BOTTLE_ML = 500;
  var STRIDE_FACTOR = 0.414, WALK_KMH = 4.8, WALK_MET = 3.5;
  var MACRO_GOALS = {
    cut:      { proteinGPerKg: 2.2, fatPct: 0.25 },
    maintain: { proteinGPerKg: 1.8, fatPct: 0.275 },
    bulk:     { proteinGPerKg: 1.6, fatPct: 0.25 },
  };
  var STEP_TARGETS = {
    health:     { under60: 10000, over60: 8000 },
    weightloss: { under60: 12000, over60: 10000 },
  };

  function $(id) { return document.getElementById(id); }

  function fmt0(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmt1(n) { return n.toFixed(1); }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obese (Class I)";
    if (bmi < 40) return "Obese (Class II)";
    return "Obese (Class III)";
  }

  function rateLabel(deltaKcal) {
    if (Math.abs(deltaKcal) < 25) return "maintain";
    var kgWk = (Math.abs(deltaKcal) * 7) / KCAL_PER_KG;
    return (deltaKcal < 0 ? "\u2212" : "+") + kgWk.toFixed(2) + " kg/wk";
  }

  function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* Build the full report as layout blocks */
  function collectBlocks() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) return null;

    var b = [];
    var now = new Date();

    b.push({ style: "title", text: p.name ? "FitCalc — Fitness Report for " + p.name : "FitCalc — Personal Fitness Report" });
    b.push({
      style: "subtitle",
      text: "Generated " + fmtDate(now) + " at " +
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
        "   ·   Developed by Tausif Rasool",
    });
    b.push({ rule: true });

    /* ---- Profile ---- */
    b.push({ style: "section", text: "Profile" });
    if (p.name) b.push({ style: "kv", text: "Name", value: p.name });
    b.push({ style: "kv", text: "Sex", value: p.sex === "male" ? "Male" : "Female" });
    b.push({ style: "kv", text: "Age", value: p.age + " years" });
    b.push({ style: "kv", text: "Weight", value: p.weightKg + " kg" });
    b.push({ style: "kv", text: "Height", value: p.heightIn + " in (" + fmt0(FitCalc.calc.heightCm(p)) + " cm)" });
    b.push({ style: "kv", text: "Activity level", value: FitCalc.labels.activity[String(p.activity)] || "—" });
    b.push({ style: "kv", text: "Goal", value: FitCalc.labels.goal[p.goal] });
    b.push({ style: "kv", text: "Target weight", value: p.goalWeightKg != null ? p.goalWeightKg + " kg" : "not set" });
    b.push({ style: "kv", text: "Climate", value: FitCalc.labels.climate[String(p.climate)] || "Temperate" });

    /* ---- BMI ---- */
    var m = FitCalc.calc.heightM(p);
    var bmi = p.weightKg / (m * m);
    var lowKg = 18.5 * m * m, highKg = 24.9 * m * m;
    b.push({ style: "section", text: "BMI" });
    b.push({ style: "kv", text: "Body Mass Index", value: fmt1(bmi) + " kg/m² — " + bmiCategory(bmi) });
    b.push({ style: "kv", text: "Healthy weight for height", value: fmt1(lowKg) + " – " + fmt1(highKg) + " kg" });
    var distance = bmi < 18.5 ? "Gain " + fmt1(lowKg - p.weightKg) + " kg to reach BMI 18.5"
      : bmi > 24.9 ? "Lose " + fmt1(p.weightKg - highKg) + " kg to reach BMI 24.9"
      : "In range — no change needed";
    b.push({ style: "kv", text: "Distance to healthy range", value: distance });

    /* ---- BMR & TDEE ---- */
    var bmr = FitCalc.calc.bmr(p);
    var tdee = FitCalc.calc.tdee(p);
    b.push({ style: "section", text: "BMR & TDEE (Mifflin-St Jeor)" });
    b.push({ style: "kv", text: "BMR — burn at complete rest", value: fmt0(bmr) + " kcal/day" });
    b.push({ style: "kv", text: "Maintenance calories (TDEE)", value: fmt0(tdee) + " kcal/day" });
    b.push({ style: "kv", text: "Activity burn (TDEE − BMR)", value: fmt0(tdee - bmr) + " kcal/day" });

    var targets = [
      { key: "cut", name: "Aggressive cut (−20%)", kcal: tdee * 0.8, delta: tdee * 0.8 - tdee },
      { key: "cut", name: "Moderate cut (−500 kcal)", kcal: tdee - 500, delta: -500, primary: true },
      { key: "maintain", name: "Maintenance (TDEE)", kcal: tdee, delta: 0, primary: true },
      { key: "bulk", name: "Lean bulk (+250 kcal)", kcal: tdee + 250, delta: 250, primary: true },
      { key: "bulk", name: "Bulk (+500 kcal)", kcal: tdee + 500, delta: 500 },
    ];
    targets.forEach(function (t) {
      var isPlan = t.primary && t.key === p.goal;
      b.push({
        style: "kv",
        text: t.name + (isPlan ? " — your plan" : ""),
        value: fmt0(t.kcal) + " kcal  (" + rateLabel(t.delta) + ")",
      });
    });

    /* ---- Macros ---- */
    var mg = MACRO_GOALS[p.goal] || MACRO_GOALS.maintain;
    var cal = FitCalc.calc.targetKcal(p);
    var proteinG = Math.min(p.weightKg * mg.proteinGPerKg, (cal * 0.35) / 4);
    var proteinKcal = proteinG * 4;
    var fatKcal = cal * mg.fatPct, fatG = fatKcal / 9;
    var carbKcal = Math.max(0, cal - proteinKcal - fatKcal), carbG = carbKcal / 4;
    b.push({ style: "section", text: "Macro Split (" + FitCalc.labels.goal[p.goal] + " — " + fmt0(cal) + " kcal/day)" });
    b.push({ style: "kv", text: "Protein (" + mg.proteinGPerKg + " g/kg)", value: fmt0(proteinG) + " g · " + fmt0(proteinKcal) + " kcal · " + Math.round((proteinKcal / cal) * 100) + "%" });
    b.push({ style: "kv", text: "Carbs (remainder)", value: fmt0(carbG) + " g · " + fmt0(carbKcal) + " kcal · " + Math.round((carbKcal / cal) * 100) + "%" });
    b.push({ style: "kv", text: "Fat (" + Math.round(mg.fatPct * 1000) / 10 + "% of kcal)", value: fmt0(fatG) + " g · " + fmt0(fatKcal) + " kcal · " + Math.round((fatKcal / cal) * 100) + "%" });

    /* ---- Water ---- */
    var trainMin = FitCalc.calc.trainingMin(p);
    var waterMl = p.weightKg * ML_PER_KG + trainMin * ML_PER_MIN + (p.climate || 0);
    b.push({ style: "section", text: "Water Intake" });
    b.push({ style: "kv", text: "Daily target", value: fmt1(waterMl / 1000) + " L (" + fmt0(waterMl) + " ml)" });
    b.push({ style: "kv", text: "Base (33 ml/kg)", value: fmt0(p.weightKg * ML_PER_KG) + " ml" });
    b.push({ style: "kv", text: "Training (" + trainMin + " min/day)", value: "+" + fmt0(trainMin * ML_PER_MIN) + " ml" });
    b.push({ style: "kv", text: "Climate adder", value: p.climate ? "+" + p.climate + " ml" : "none" });
    b.push({ style: "kv", text: "Equivalents", value: "~" + fmt1(waterMl / GLASS_ML) + " glasses (250 ml) · ~" + fmt1(waterMl / BOTTLE_ML) + " bottles (500 ml)" });

    /* ---- Steps ---- */
    var mode = FitCalc.calc.stepsGoal(p);
    var steps = STEP_TARGETS[mode][p.age >= 60 ? "over60" : "under60"];
    var strideM = (FitCalc.calc.heightCm(p) * STRIDE_FACTOR) / 100;
    var distKm = (steps * strideM) / 1000;
    var stepsKcal = WALK_MET * p.weightKg * (distKm / WALK_KMH);
    b.push({ style: "section", text: "Daily Steps (" + (mode === "weightloss" ? "weight-loss mode" : "general health") + ")" });
    b.push({ style: "kv", text: "Step target", value: fmt0(steps) + " steps/day" });
    b.push({ style: "kv", text: "Distance", value: "≈ " + fmt1(distKm) + " km/day · ≈ " + fmt1(distKm * 7) + " km/week" });
    b.push({ style: "kv", text: "Stride (from height)", value: "≈ " + fmt0(strideM * 100) + " cm" });
    b.push({ style: "kv", text: "Calories burned walking", value: "≈ " + fmt0(stepsKcal) + " kcal/day" });

    /* ---- Timeline ---- */
    b.push({ style: "section", text: "Goal Weight Timeline" });
    if (p.goalWeightKg == null) {
      b.push({ style: "text", text: "No target weight set in the profile — add one to generate a timeline." });
    } else {
      var deltaKg = p.goalWeightKg - p.weightKg;
      var dailyDelta = cal - tdee;
      var cutting = deltaKg < 0;
      if (Math.abs(deltaKg) < 0.05) {
        b.push({ style: "text", text: "Already at target weight (" + fmt1(p.weightKg) + " kg)." });
      } else if (Math.abs(dailyDelta) < 10) {
        b.push({ style: "text", text: "Goal is Maintain — weight stays at " + fmt1(p.weightKg) + " kg. Switch to Cut or Lean bulk for a timeline." });
      } else if ((cutting && dailyDelta > 0) || (!cutting && dailyDelta < 0)) {
        b.push({ style: "text", text: "Target weight and calorie goal point in opposite directions — adjust the profile." });
      } else {
        var weeklyRate = (Math.abs(dailyDelta) * 7) / KCAL_PER_KG;
        var weeks = Math.abs(deltaKg) / weeklyRate;
        var totalDays = weeks * 7;
        b.push({ style: "kv", text: "Total change", value: (cutting ? "−" : "+") + fmt1(Math.abs(deltaKg)) + " kg (" + fmt1(p.weightKg) + " → " + fmt1(p.goalWeightKg) + " kg)" });
        b.push({ style: "kv", text: "Duration", value: (weeks >= 10 ? fmt0(weeks) : fmt1(weeks)) + " weeks (≈ " + fmt1(weeks / 4.348) + " months)" });
        b.push({ style: "kv", text: "Target date", value: fmtDate(new Date(Date.now() + totalDays * 86400000)) });
        b.push({ style: "kv", text: "Weekly rate", value: (cutting ? "−" : "+") + weeklyRate.toFixed(2) + " kg/week (" + fmt0(Math.abs(dailyDelta)) + " kcal/day " + (cutting ? "deficit" : "surplus") + ")" });
        [0.25, 0.5, 0.75, 1].forEach(function (f) {
          b.push({
            style: "kv",
            text: "Milestone " + Math.round(f * 100) + "%" + (f === 1 ? " — goal reached" : ""),
            value: fmt1(p.weightKg + deltaKg * f) + " kg by " + fmtDate(new Date(Date.now() + totalDays * f * 86400000)),
          });
        });
      }
    }

    /* ---- Footer ---- */
    b.push({ rule: true });
    b.push({ style: "small", text: "FitCalc is an educational tool, not medical advice. Estimates assume 1 kg of body tissue ≈ 7,700 kcal;" });
    b.push({ style: "small", text: "individual results vary. Formulas: Mifflin-St Jeor (BMR), Tanaka-free stride model (0.414 × height), MET 3.5 walking." });

    return b;
  }

  /* ---- button wiring ---- */

  function flashNote(msg, ok) {
    var el = $("report-msg");
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? "var(--ok)" : "var(--warn)";
    setTimeout(function () {
      el.textContent = "All six calculators in one PDF — generated from your profile.";
      el.style.color = "";
    }, 4000);
  }

  function onDownload() {
    var blocks = collectBlocks();
    if (!blocks) {
      flashNote("Save your profile first.", false);
      return;
    }
    var fname = "fitcalc-report-" + new Date().toISOString().slice(0, 10) + ".pdf";
    try {
      window.FitCalcPdf.generate(blocks, fname);
      flashNote("✔ Downloaded " + fname, true);
    } catch (e) {
      flashNote("Download failed here — open the app in a regular browser tab and retry.", false);
    }
  }

  function toggleBar() {
    var bar = $("report-bar");
    if (bar) bar.hidden = !(window.FitCalc && FitCalc.profile.get());
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("report-download").addEventListener("click", onDownload);
    FitCalc.profile.onChange(toggleBar);
    toggleBar();
  });

  window.FitCalcReport = { collectBlocks: collectBlocks };
})();
