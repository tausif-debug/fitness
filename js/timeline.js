/* ============================================================
   FitCalc — Goal Weight Timeline (renders from the shared profile)
   current/target weight from profile; maintenance = TDEE;
   intake = the profile goal's calorie target.
   weeklyRate = |intake − maintenance| × 7 ÷ 7,700
   ============================================================ */

(function () {
  "use strict";

  var KCAL_PER_KG = 7700;
  var WEEKS_PER_MONTH = 4.348;
  var SAFE_CUT_PCT = 0.01;
  var SAFE_BULK_PCT = 0.005;

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

  function fmt0(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function addDays(days) {
    return new Date(Date.now() + days * 86400000);
  }

  /* Show a message in the empty-state panel instead of results */
  function showMessage(html) {
    var empty = $("tl-empty");
    empty.innerHTML = "<p>" + html + "</p>";
    empty.hidden = false;
    $("tl-output").hidden = true;
  }

  function showDefaultEmpty() {
    $("tl-empty").innerHTML =
      '<p>Set up your <a href="#/profile">profile</a> once — your timeline appears here automatically.</p>';
    $("tl-empty").hidden = false;
    $("tl-output").hidden = true;
  }

  function renderMilestones(currentKg, deltaKg, totalDays) {
    var tbody = $("tl-milestones");
    tbody.innerHTML = "";

    MILESTONES.forEach(function (p) {
      var tr = document.createElement("tr");
      if (p === 1) tr.className = "is-maint";

      var tdP = document.createElement("td");
      tdP.innerHTML =
        '<span class="goal-name">' + Math.round(p * 100) + "%</span>" +
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

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      showDefaultEmpty();
      return;
    }

    var maint = FitCalc.calc.tdee(p);
    var intake = FitCalc.calc.targetKcal(p);

    if (p.goalWeightKg == null) {
      showMessage(
        'Add a <strong>target weight</strong> in your <a href="#/profile">profile</a> to see your timeline.'
      );
      return;
    }

    var currentKg = p.weightKg;
    var goalKg = p.goalWeightKg;
    var deltaKg = goalKg - currentKg;
    var dailyDelta = intake - maint; // negative = deficit
    var cutting = deltaKg < 0;

    // Already at goal
    if (Math.abs(deltaKg) < 0.05) {
      FitCalc.ui.summary("tl-summary", [
        ["Current weight", fmtKg(currentKg) + " kg"],
        ["Target weight", fmtKg(goalKg) + " kg"],
      ]);
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

    // Goal direction vs calorie plan
    if (Math.abs(dailyDelta) < 10) {
      showMessage(
        "Your goal is <strong>Maintain</strong> — your weight stays at " + fmtKg(currentKg) +
        ' kg. Switch your profile goal to <strong>Cut</strong> or <strong>Lean bulk</strong> to see a timeline.'
      );
      return;
    }
    if (cutting && dailyDelta > 0) {
      showMessage(
        "Your goal is <strong>" + FitCalc.labels.goal[p.goal] + "</strong> but your target weight (" +
        fmtKg(goalKg) + " kg) is <em>above</em> your current " + fmtKg(currentKg) +
        ' kg. Adjust the goal or target weight in your <a href="#/profile">profile</a>.'
      );
      return;
    }
    if (!cutting && dailyDelta < 0) {
      showMessage(
        "Your goal is <strong>" + FitCalc.labels.goal[p.goal] + "</strong> but your target weight (" +
        fmtKg(goalKg) + " kg) is <em>below</em> your current " + fmtKg(currentKg) +
        ' kg. Adjust the goal or target weight in your <a href="#/profile">profile</a>.'
      );
      return;
    }

    var weeklyRate = (Math.abs(dailyDelta) * 7) / KCAL_PER_KG;
    var weeks = Math.abs(deltaKg) / weeklyRate;
    var totalDays = weeks * 7;
    var months = weeks / WEEKS_PER_MONTH;

    FitCalc.ui.summary("tl-summary", [
      ["Current weight", fmtKg(currentKg) + " kg"],
      ["Target weight", fmtKg(goalKg) + " kg"],
      ["Maintenance (TDEE)", fmt0(maint) + " kcal"],
      ["Planned intake", fmt0(intake) + " kcal (" + FitCalc.labels.goal[p.goal] + ")"],
    ]);

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
      fmt0(Math.abs(dailyDelta)) + " kcal/day " + (cutting ? "deficit" : "surplus");

    renderMilestones(currentKg, deltaKg, totalDays);

    // Safe-pace check
    var warn = $("tl-warn");
    var safePct = cutting ? SAFE_CUT_PCT : SAFE_BULK_PCT;
    var maxSafeRate = currentKg * safePct;
    var warnings = [];

    if (weeklyRate > maxSafeRate) {
      var safeWeeks = Math.abs(deltaKg) / maxSafeRate;
      warnings.push(
        "This pace (" + weeklyRate.toFixed(2) + " kg/wk) exceeds the recommended max of ~" +
        maxSafeRate.toFixed(2) + " kg/wk (" + (safePct * 100) + "% of bodyweight). Consider a smaller daily " +
        (cutting ? "deficit" : "surplus") + " — a safer plan takes about " +
        (safeWeeks >= 10 ? Math.round(safeWeeks) : fmt1(safeWeeks)) + " weeks."
      );
    }
    if (weeks > 260) {
      warnings.push("That's over 5 years at this pace — consider a nearer interim target weight.");
    }

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
