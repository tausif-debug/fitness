/* ============================================================
   FitCalc — Goal Weight Timeline (renders from the profile, translated)
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

  function t(key, params) {
    return FitCalc.i18n.t(key, params);
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
    $("tl-empty").innerHTML = "<p>" + t("tl.empty") + "</p>";
    $("tl-empty").hidden = false;
    $("tl-output").hidden = true;
  }

  function renderMilestones(currentKg, deltaKg, totalDays) {
    var tbody = $("tl-milestones");
    tbody.innerHTML = "";

    MILESTONES.forEach(function (f) {
      var tr = document.createElement("tr");
      if (f === 1) tr.className = "is-maint";

      var tdP = document.createElement("td");
      tdP.innerHTML =
        '<span class="goal-name">' + Math.round(f * 100) + "%</span>" +
        (f === 1 ? '<span class="goal-note">' + t("tl.goalReached") + "</span>" : "");

      var tdW = document.createElement("td");
      tdW.className = "num kcal";
      tdW.textContent = fmtKg(currentKg + deltaKg * f);

      var tdD = document.createElement("td");
      tdD.className = "num rate";
      tdD.textContent = fmtDate(addDays(totalDays * f));

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
      showMessage(t("tl.emptyTarget"));
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
        [t("row.currentWeight"), fmtKg(currentKg) + " kg"],
        [t("row.targetWeight"), fmtKg(goalKg) + " kg"],
      ]);
      $("tl-empty").hidden = true;
      $("tl-output").hidden = false;
      $("tl-weeks").textContent = "0";
      $("tl-date-label").textContent = t("tl.atGoal");
      $("tl-start-label").textContent = t("tl.now", { w: fmtKg(currentKg) });
      $("tl-end-label").textContent = t("tl.goalW", { w: fmtKg(goalKg) });
      $("tl-total").textContent = "0.0 kg";
      $("tl-rate").textContent = "—";
      $("tl-balance").textContent = "—";
      $("tl-milestones").innerHTML = "";
      $("tl-warn").hidden = true;
      return;
    }

    // Goal direction vs calorie plan
    var goalLabel = t("goal." + p.goal);
    if (Math.abs(dailyDelta) < 10) {
      showMessage(t("tl.emptyMaintain", { w: fmtKg(currentKg) }));
      return;
    }
    if (cutting && dailyDelta > 0) {
      showMessage(t("tl.emptyAbove", { g: goalLabel, t: fmtKg(goalKg), c: fmtKg(currentKg) }));
      return;
    }
    if (!cutting && dailyDelta < 0) {
      showMessage(t("tl.emptyBelow", { g: goalLabel, t: fmtKg(goalKg), c: fmtKg(currentKg) }));
      return;
    }

    var weeklyRate = (Math.abs(dailyDelta) * 7) / KCAL_PER_KG;
    var weeks = Math.abs(deltaKg) / weeklyRate;
    var totalDays = weeks * 7;
    var months = weeks / WEEKS_PER_MONTH;

    FitCalc.ui.summary("tl-summary", [
      [t("row.currentWeight"), fmtKg(currentKg) + " kg"],
      [t("row.targetWeight"), fmtKg(goalKg) + " kg"],
      [t("row.maintTdee"), fmt0(maint) + " kcal"],
      [t("row.plannedIntake"), t("tl.intakeVal", { c: fmt0(intake), g: goalLabel })],
    ]);

    $("tl-empty").hidden = true;
    $("tl-output").hidden = false;

    $("tl-weeks").textContent = weeks >= 10 ? Math.round(weeks) : fmt1(weeks);
    $("tl-date-label").textContent =
      t("tl.dateLabel", { d: fmtDate(addDays(totalDays)), m: fmt1(months) });

    $("tl-start-label").textContent = t("tl.now", { w: fmtKg(currentKg) });
    $("tl-end-label").textContent = t("tl.goalW", { w: fmtKg(goalKg) });

    var sign = cutting ? "\u2212" : "+";
    $("tl-total").textContent = sign + fmtKg(Math.abs(deltaKg)) + " kg (" + t(cutting ? "tl.lose" : "tl.gain") + ")";
    $("tl-rate").textContent = t("tl.rateVal", { s: sign, r: weeklyRate.toFixed(2) });
    $("tl-balance").textContent =
      t("tl.balanceVal", { k: fmt0(Math.abs(dailyDelta)), d: t(cutting ? "tl.deficit" : "tl.surplus") });

    renderMilestones(currentKg, deltaKg, totalDays);

    // Safe-pace check
    var warn = $("tl-warn");
    var safePct = cutting ? SAFE_CUT_PCT : SAFE_BULK_PCT;
    var maxSafeRate = currentKg * safePct;
    var warnings = [];

    if (weeklyRate > maxSafeRate) {
      var safeWeeks = Math.abs(deltaKg) / maxSafeRate;
      warnings.push(t("tl.warnPace", {
        r: weeklyRate.toFixed(2),
        max: maxSafeRate.toFixed(2),
        pct: safePct * 100,
        dir: t(cutting ? "tl.deficit" : "tl.surplus"),
        w: safeWeeks >= 10 ? Math.round(safeWeeks) : fmt1(safeWeeks),
      }));
    }
    if (weeks > 260) {
      warnings.push(t("tl.warnYears"));
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
    FitCalc.i18n.onChange(render);
    render();
  });
})();
