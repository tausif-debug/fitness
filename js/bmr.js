/* ============================================================
   FitCalc — BMR & TDEE (renders from the shared profile)
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

  function fmt0(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function rateLabel(deltaKcal) {
    if (Math.abs(deltaKcal) < 25) return "maintain";
    var kgPerWeek = (Math.abs(deltaKcal) * 7) / KCAL_PER_KG;
    var sign = deltaKcal < 0 ? "\u2212" : "+";
    return sign + kgPerWeek.toFixed(2) + " kg/wk";
  }

  function goalRows(tdee) {
    return [
      { key: "cut",      name: "Aggressive cut", kcal: tdee * 0.8, delta: tdee * 0.8 - tdee, note: "−20%" },
      { key: "cut",      name: "Moderate cut",   kcal: tdee - 500, delta: -500, note: "−500 kcal", primary: true },
      { key: "maintain", name: "Maintenance",    kcal: tdee,       delta: 0,    note: "TDEE",      primary: true },
      { key: "bulk",     name: "Lean bulk",      kcal: tdee + 250, delta: 250,  note: "+250 kcal", primary: true },
      { key: "bulk",     name: "Bulk",           kcal: tdee + 500, delta: 500,  note: "+500 kcal" },
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
        '<span class="goal-name">' + g.name + "</span>" +
        '<span class="goal-note">' + g.note + (isPlan ? " · your plan" : "") + "</span>";

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
      ["Sex", p.sex === "male" ? "Male" : "Female"],
      ["Age", p.age + " years"],
      ["Weight", p.weightKg + " kg"],
      ["Height", p.heightIn + " in"],
      ["Activity", FitCalc.labels.activity[String(p.activity)] || "—"],
    ]);

    $("bmr-empty").hidden = true;
    $("bmr-output").hidden = false;

    $("bmr-tdee").textContent = fmt0(tdee);
    $("bmr-bmr").textContent = fmt0(bmr);
    $("bmr-activity-burn").textContent = fmt0(tdee - bmr);

    renderGoals(tdee, p.goal);

    var floor = p.sex === "male" ? FLOOR_MALE : FLOOR_FEMALE;
    var warn = $("bmr-warn");
    if (tdee * 0.8 < floor) {
      warn.textContent =
        "Heads up: an aggressive cut would put you below " + fmt0(floor) +
        " kcal/day — a commonly used minimum. Consider the moderate cut instead.";
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
