/* ============================================================
   FitCalc — Goal Weight Timeline
   Units: weight in kg, energy in kcal (fixed, per spec).

   weeklyRate (kg/wk) = |intake − maintenance| × 7 ÷ 7,700
   weeks              = |goal − current| ÷ weeklyRate
   Safe pace: cut ≤ 1% of bodyweight/week · bulk ≤ 0.5%/week
   ============================================================ */

(function () {
  "use strict";

  var KCAL_PER_KG = 7700;
  var WEEKS_PER_MONTH = 4.348;
  var SAFE_CUT_PCT = 0.01;   // 1% of current bodyweight per week
  var SAFE_BULK_PCT = 0.005; // 0.5% per week

  var WEIGHT_MIN = 20, WEIGHT_MAX = 400;
  var CAL_MIN = 500, CAL_MAX = 12000;

  var MILESTONES = [0.25, 0.5, 0.75, 1];

  function $(id) {
    return document.getElementById(id);
  }

  function fmt1(n) {
    return n.toFixed(1);
  }

  function fmtKg(n) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function addDays(days) {
    return new Date(Date.now() + days * 86400000);
  }

  function showError(msg) {
    var err = $("tl-error");
    err.textContent = msg;
    err.hidden = false;
    $("tl-output").hidden = true;
    $("tl-empty").hidden = false;
  }

  function clearError() {
    $("tl-error").hidden = true;
  }

  function renderMilestones(currentKg, deltaKg, totalDays) {
    var tbody = $("tl-milestones");
    tbody.innerHTML = "";

    MILESTONES.forEach(function (p) {
      var tr = document.createElement("tr");
      if (p === 1) tr.className = "is-maint";

      var tdP = document.createElement("td");
      tdP.innerHTML = '<span class="goal-name">' + Math.round(p * 100) + "%</span>" +
        (p === 1 ? '<span class="goal-note">goal reached 🎉</span>' : "");

      var tdW = document.createElement("td");
      tdW.className = "num kcal";
      tdW.textContent = fmtKg(currentKg + deltaKg * p);

      var tdD = document.createElement("td");
      tdD.className = "num rate";
      tdD.textContent = fmtDate(addDays(totalDays * p));

      tr.appendChild(tdP);
      tr.appendChild(tdW);
      tr.appendChild(tdD);
      tbody.appendChild(tr);
    });
  }

  function render(currentKg, goalKg, maintKcal, intakeKcal) {
    var deltaKg = goalKg - currentKg;

    // Already at goal
    if (Math.abs(deltaKg) < 0.05) {
      $("tl-empty").hidden = true;
      $("tl-output").hidden = false;
      $("tl-weeks").textContent = "0";
      $("tl-date-label").textContent = "you're already at your goal 🎉";
      $("tl-start-label").textContent = fmtKg(currentKg) + " kg now";
      $("tl-end-label").textContent = fmtKg(goalKg) + " kg goal";
      $("tl-total").textContent = "0.0 kg";
      $("tl-rate").textContent = "—";
      $("tl-balance").textContent = "—";
      $("tl-milestones").innerHTML = "";
      $("tl-warn").hidden = true;
      return;
    }

    var dailyDelta = intakeKcal - maintKcal; // negative = deficit
    var cutting = deltaKg < 0;

    // Direction checks
    if (Math.abs(dailyDelta) < 10) {
      showError(
        "Intake equals maintenance — your weight will stay at " + fmtKg(currentKg) +
        " kg. Eat below maintenance to lose, or above it to gain."
      );
      return;
    }
    if (cutting && dailyDelta > 0) {
      showError(
        "At " + Math.round(intakeKcal) + " kcal/day you would GAIN weight, but your goal (" +
        fmtKg(goalKg) + " kg) is below your current " + fmtKg(currentKg) +
        " kg. Pick an intake below your maintenance (" + Math.round(maintKcal) + " kcal)."
      );
      return;
    }
    if (!cutting && dailyDelta < 0) {
      showError(
        "At " + Math.round(intakeKcal) + " kcal/day you would LOSE weight, but your goal (" +
        fmtKg(goalKg) + " kg) is above your current " + fmtKg(currentKg) +
        " kg. Pick an intake above your maintenance (" + Math.round(maintKcal) + " kcal)."
      );
      return;
    }

    var weeklyRate = (Math.abs(dailyDelta) * 7) / KCAL_PER_KG; // kg/week toward goal
    var weeks = Math.abs(deltaKg) / weeklyRate;
    var totalDays = weeks * 7;
    var months = weeks / WEEKS_PER_MONTH;

    $("tl-empty").hidden = true;
    $("tl-output").hidden = false;

    $("tl-weeks").textContent = weeks >= 10 ? Math.round(weeks) : fmt1(weeks);
    $("tl-date-label").textContent =
      "target date ≈ " + fmtDate(addDays(totalDays)) + " · ≈ " + fmt1(months) + " months";

    $("tl-start-label").textContent = fmtKg(currentKg) + " kg now";
    $("tl-end-label").textContent = fmtKg(goalKg) + " kg goal";

    var sign = cutting ? "\u2212" : "+";
    $("tl-total").textContent = sign + fmtKg(Math.abs(deltaKg)) + " kg (" + (cutting ? "lose" : "gain") + ")";
    $("tl-rate").textContent = sign + weeklyRate.toFixed(2) + " kg/week";
    $("tl-balance").textContent =
      Math.round(Math.abs(dailyDelta)).toLocaleString("en-US") + " kcal/day " +
      (cutting ? "deficit" : "surplus");

    renderMilestones(currentKg, deltaKg, totalDays);

    // Safe-pace check
    var warn = $("tl-warn");
    var safePct = cutting ? SAFE_CUT_PCT : SAFE_BULK_PCT;
    var maxSafeRate = currentKg * safePct;
    var warnings = [];

    if (weeklyRate > maxSafeRate) {
      var safeWeeks = Math.abs(deltaKg) / maxSafeRate;
      var suggestedKcal = cutting
        ? maintKcal - (maxSafeRate * KCAL_PER_KG) / 7
        : maintKcal + (maxSafeRate * KCAL_PER_KG) / 7;
      warnings.push(
        "This pace (" + weeklyRate.toFixed(2) + " kg/wk) exceeds the recommended max of ~" +
        maxSafeRate.toFixed(2) + " kg/wk (" + (safePct * 100) + "% of bodyweight). Safer plan: ~" +
        Math.round(suggestedKcal) + " kcal/day → about " +
        (safeWeeks >= 10 ? Math.round(safeWeeks) : fmt1(safeWeeks)) + " weeks."
      );
    }
    if (weeks > 260) {
      warnings.push("That's over 5 years at this pace — consider a larger daily change or a nearer interim goal.");
    }

    if (warnings.length) {
      warn.textContent = warnings.join(" ");
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }
  }

  function readForm() {
    var current = parseFloat($("tl-current").value);
    var goal = parseFloat($("tl-goal").value);
    var maint = parseFloat($("tl-maint").value);
    var intake = parseFloat($("tl-intake").value);

    if (isNaN(current) || isNaN(goal) || isNaN(maint) || isNaN(intake)) {
      return { error: "Please fill in all four fields (weights in kg, calories in kcal)." };
    }
    if (current < WEIGHT_MIN || current > WEIGHT_MAX || goal < WEIGHT_MIN || goal > WEIGHT_MAX) {
      return { error: "Weights must be between " + WEIGHT_MIN + " and " + WEIGHT_MAX + " kg." };
    }
    if (maint < CAL_MIN || maint > CAL_MAX || intake < CAL_MIN || intake > CAL_MAX) {
      return { error: "Calorie values must be between " + CAL_MIN + " and " + CAL_MAX + " kcal." };
    }
    return { current: current, goal: goal, maint: maint, intake: intake };
  }

  function apply() {
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    clearError();
    render(v.current, v.goal, v.maint, v.intake);
  }

  function onSubmit(e) {
    e.preventDefault();
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("tl-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing
    function liveUpdate() {
      if ($("tl-output").hidden) return;
      apply();
    }

    $("tl-form").addEventListener("input", liveUpdate);
    $("tl-form").addEventListener("change", liveUpdate);
  });
})();
