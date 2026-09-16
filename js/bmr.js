/* ============================================================
   FitCalc — BMR & TDEE (renders from the shared profile, translated)
   Mifflin-St Jeor; the goal row matching the profile goal is
   highlighted as "your plan".
   ============================================================ */

(function () {
  "use strict";

  var KCAL_PER_KG = 7700;
  var FLOOR_MALE = 1500;
  var FLOOR_FEMALE = 1200;

  function $(id) {
    return document.getElementById(id);
  }

  function t(key, params) {
    return FitCalc.i18n.t(key, params);
  }

  function fmt0(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function rateLabel(deltaKcal) {
    if (Math.abs(deltaKcal) < 25) return t("rate.maintain");
    var kgPerWeek = (Math.abs(deltaKcal) * 7) / KCAL_PER_KG;
    var sign = deltaKcal < 0 ? "\u2212" : "+";
    return t("rate.change", { v: sign + kgPerWeek.toFixed(2) });
  }

  function goalRows(tdee) {
    return [
      { key: "cut",      nameKey: "goalrow.cut20",   kcal: tdee * 0.8, delta: tdee * 0.8 - tdee, note: "−20%" },
      { key: "cut",      nameKey: "goalrow.cut500",  kcal: tdee - 500, delta: -500, note: "−500 kcal", primary: true },
      { key: "maintain", nameKey: "goalrow.maint",   kcal: tdee,       delta: 0,    note: "TDEE",      primary: true },
      { key: "bulk",     nameKey: "goalrow.bulk250", kcal: tdee + 250, delta: 250,  note: "+250 kcal", primary: true },
      { key: "bulk",     nameKey: "goalrow.bulk500", kcal: tdee + 500, delta: 500,  note: "+500 kcal" },
    ];
  }

  function renderGoals(tdee, goal) {
    var tbody = $("bmr-goals");
    tbody.innerHTML = "";

    goalRows(tdee).forEach(function (g) {
      var isPlan = g.primary && g.key === goal;
      var tr = document.createElement("tr");
      if (isPlan) tr.className = "is-maint";

      var tdName = document.createElement("td");
      tdName.innerHTML =
        '<span class="goal-name">' + t(g.nameKey) + "</span>" +
        '<span class="goal-note">' + g.note + (isPlan ? t("plan.you") : "") + "</span>";

      var tdKcal = document.createElement("td");
      tdKcal.className = "num kcal";
      tdKcal.textContent = fmt0(g.kcal);

      var tdRate = document.createElement("td");
      tdRate.className = "num rate rate-col";
      tdRate.textContent = rateLabel(g.delta);

      tr.appendChild(tdName);
      tr.appendChild(tdKcal);
      tr.appendChild(tdRate);
      tbody.appendChild(tr);
    });
  }

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    if (!p) {
      $("bmr-empty").hidden = false;
      $("bmr-output").hidden = true;
      return;
    }

    var bmr = FitCalc.calc.bmr(p);
    var tdee = FitCalc.calc.tdee(p);

    FitCalc.ui.summary("bmr-summary", [
      [t("row.sex"), t(p.sex === "male" ? "form.male" : "form.female")],
      [t("row.age"), t("val.ageYears", { n: p.age })],
      [t("row.weight"), p.weightKg + " kg"],
      [t("row.height"), p.heightIn + " in"],
      [t("row.activity"), t("activityShort." + p.activity)],
    ]);

    $("bmr-empty").hidden = true;
    $("bmr-output").hidden = false;

    FitCalc.fx.count($("bmr-tdee"), tdee, fmt0);
    FitCalc.fx.count($("bmr-bmr"), bmr, fmt0);
    FitCalc.fx.count($("bmr-activity-burn"), tdee - bmr, fmt0);

    renderGoals(tdee, p.goal);

    var floor = p.sex === "male" ? FLOOR_MALE : FLOOR_FEMALE;
    var warn = $("bmr-warn");
    if (tdee * 0.8 < floor) {
      warn.textContent = t("bmr.warn", { f: fmt0(floor) });
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
