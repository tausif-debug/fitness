/* ============================================================
   FitCalc — BMR & TDEE Calculator (Step 3)
   Mifflin-St Jeor:
     male:   BMR = 10·kg + 6.25·cm − 5·age + 5
     female: BMR = 10·kg + 6.25·cm − 5·age − 161
   Inputs: weight in kg, height in inches (→ cm internally).
   TDEE = BMR × activity multiplier.
   ============================================================ */

(function () {
  "use strict";

  var IN_TO_CM = 2.54;
  var KCAL_PER_KG = 7700; // approx. energy content of 1 kg body tissue

  // Commonly used minimum-intake floors
  var FLOOR_MALE = 1500;
  var FLOOR_FEMALE = 1200;

  var LIMITS = {
    age:    { min: 15, max: 100, label: "Age",              unit: "years (15–100)" },
    weight: { min: 20, max: 400, label: "Weight",           unit: "kg (20–400)" },
    height: { min: 36, max: 96,  label: "Height",           unit: "inches (36–96)" },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function fmt0(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function bmrMifflin(sex, weightKg, heightCm, age) {
    var base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === "male" ? base + 5 : base - 161;
  }

  /* Estimated weekly weight change from a daily kcal delta */
  function rateLabel(deltaKcal) {
    if (Math.abs(deltaKcal) < 25) return "maintain";
    var kgPerWeek = (Math.abs(deltaKcal) * 7) / KCAL_PER_KG;
    var sign = deltaKcal < 0 ? "\u2212" : "+"; // − / +
    return sign + kgPerWeek.toFixed(2) + " kg/wk";
  }

  function goalRows(tdee) {
    return [
      { name: "Aggressive cut", kcal: tdee * 0.8,   delta: tdee * 0.8 - tdee, note: "−20%",      macroGoal: "cut" },
      { name: "Moderate cut",   kcal: tdee - 500,   delta: -500,              note: "−500 kcal", macroGoal: "cut" },
      { name: "Maintenance",    kcal: tdee,         delta: 0,                 note: "TDEE", isMaint: true, macroGoal: "maintain" },
      { name: "Lean bulk",      kcal: tdee + 250,   delta: 250,               note: "+250 kcal", macroGoal: "bulk" },
      { name: "Bulk",           kcal: tdee + 500,   delta: 500,               note: "+500 kcal", macroGoal: "bulk" },
    ];
  }

  function renderGoals(tdee) {
    var tbody = $("bmr-goals");
    tbody.innerHTML = "";

    goalRows(tdee).forEach(function (g) {
      var tr = document.createElement("tr");
      if (g.isMaint) tr.className = "is-maint";

      var tdName = document.createElement("td");
      tdName.innerHTML =
        '<span class="goal-name">' + g.name + '</span>' +
        '<span class="goal-note">' + g.note + "</span>";

      var tdKcal = document.createElement("td");
      tdKcal.className = "num kcal";
      tdKcal.textContent = fmt0(g.kcal);

      var tdRate = document.createElement("td");
      tdRate.className = "num rate rate-col";
      tdRate.textContent = rateLabel(g.delta);

      // Cross-calculator flow: send this target to Macro Split
      var tdSend = document.createElement("td");
      tdSend.className = "num";
      var sendBtn = document.createElement("button");
      sendBtn.type = "button";
      sendBtn.className = "send-btn";
      sendBtn.textContent = "→";
      sendBtn.title = "Send " + g.name + " target to Macro Split";
      sendBtn.setAttribute("aria-label", "Send " + g.name + " target to Macro Split");
      sendBtn.addEventListener("click", function () {
        sendToMacros(g);
      });
      tdSend.appendChild(sendBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdKcal);
      tr.appendChild(tdRate);
      tr.appendChild(tdSend);
      tbody.appendChild(tr);
    });
  }

  /* Hand a calorie target (and the user's weight) to the Macros calculator */
  function sendToMacros(g) {
    var weight = parseFloat($("bmr-weight").value);
    var validWeight = !isNaN(weight) && weight >= 20 && weight <= 400 ? weight : null;

    if (window.FitCalc && typeof window.FitCalc.macrosPrefill === "function") {
      window.FitCalc.macrosPrefill(Math.round(g.kcal), g.macroGoal, validWeight);
    }
    window.location.hash = "#/macros";
  }

  function render(sex, weightKg, heightIn, age, mult) {
    var heightCm = heightIn * IN_TO_CM;
    var bmr = bmrMifflin(sex, weightKg, heightCm, age);
    var tdee = bmr * mult;

    $("bmr-empty").hidden = true;
    $("bmr-output").hidden = false;

    $("bmr-tdee").textContent = fmt0(tdee);
    $("bmr-bmr").textContent = fmt0(bmr);
    $("bmr-activity-burn").textContent = fmt0(tdee - bmr);

    renderGoals(tdee);

    // Safety note if the aggressive cut drops below the floor
    var floor = sex === "male" ? FLOOR_MALE : FLOOR_FEMALE;
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

  function showError(msg) {
    var err = $("bmr-error");
    err.textContent = msg;
    err.hidden = false;
    $("bmr-output").hidden = true;
    $("bmr-empty").hidden = false;
  }

  function clearError() {
    $("bmr-error").hidden = true;
  }

  /* Read + validate the form. Returns values or an error string. */
  function readForm() {
    var age = parseFloat($("bmr-age").value);
    var weight = parseFloat($("bmr-weight").value);
    var height = parseFloat($("bmr-height").value);
    var mult = parseFloat($("bmr-activity").value);
    var sexEl = document.querySelector('input[name="bmr-sex"]:checked');

    if (isNaN(age) || isNaN(weight) || isNaN(height) || !sexEl) {
      return { error: "Please fill in sex, age, weight (kg) and height (inches)." };
    }
    if (age < LIMITS.age.min || age > LIMITS.age.max) {
      return { error: "Age must be between " + LIMITS.age.min + " and " + LIMITS.age.max + " years." };
    }
    if (weight < LIMITS.weight.min || weight > LIMITS.weight.max) {
      return { error: "Weight must be between " + LIMITS.weight.min + " and " + LIMITS.weight.max + " kg." };
    }
    if (height < LIMITS.height.min || height > LIMITS.height.max) {
      return { error: "Height must be between " + LIMITS.height.min + " and " + LIMITS.height.max + " inches (3–8 ft)." };
    }
    return { sex: sexEl.value, age: age, weight: weight, height: height, mult: mult };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.sex, v.weight, v.height, v.age, v.mult);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("bmr-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing
    function liveUpdate() {
      if ($("bmr-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.sex, v.weight, v.height, v.age, v.mult);
      }
    }

    $("bmr-form").addEventListener("input", liveUpdate);
    $("bmr-form").addEventListener("change", liveUpdate);
  });
})();
