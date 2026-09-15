/* ============================================================
   FitCalc — 1-Rep Max Estimator (Step 4)
   Units: weight in kg (fixed, per spec).
   Epley:   1RM = w × (1 + r/30)
   Brzycki: 1RM = w × 36/(37 − r)   (valid for r < 37)
   Loading table: % of 1RM → weight (0.5 kg steps) + est. reps
   ============================================================ */

(function () {
  "use strict";

  var WEIGHT_MIN = 1, WEIGHT_MAX = 500; // kg
  var REPS_MIN = 1, REPS_MAX = 30;

  // Loading table percentages, heaviest first
  var PCTS = [100, 95, 90, 85, 80, 75, 70, 65, 60];

  function $(id) {
    return document.getElementById(id);
  }

  function epley(w, r) {
    return w * (1 + r / 30);
  }

  function brzycki(w, r) {
    return w * (36 / (37 - r));
  }

  function roundHalf(n) {
    return Math.round(n * 2) / 2;
  }

  function fmtKg(n) {
    return roundHalf(n).toFixed(1);
  }

  /* Inverse Epley: reps you can expect at a given % of 1RM */
  function estReps(pct) {
    var r = 30 * (1 / (pct / 100) - 1);
    return Math.max(1, Math.round(r));
  }

  function renderTable(oneRm) {
    var tbody = $("orm-table");
    tbody.innerHTML = "";

    PCTS.forEach(function (p) {
      var tr = document.createElement("tr");
      if (p === 100) tr.className = "is-highlight";

      var tdPct = document.createElement("td");
      tdPct.innerHTML =
        '<span class="goal-name">' + p + "%</span>" +
        (p === 100 ? '<span class="goal-note">true max</span>' : "");

      var tdWeight = document.createElement("td");
      tdWeight.className = "num kcal";
      tdWeight.textContent = fmtKg((oneRm * p) / 100);

      var tdReps = document.createElement("td");
      tdReps.className = "num rate";
      tdReps.textContent = estReps(p);

      tr.appendChild(tdPct);
      tr.appendChild(tdWeight);
      tr.appendChild(tdReps);
      tbody.appendChild(tr);
    });
  }

  function render(weightKg, reps) {
    var e = epley(weightKg, reps);
    var b = brzycki(weightKg, reps);

    // A true single is a true max — no estimation needed
    if (reps === 1) {
      e = weightKg;
      b = weightKg;
    }

    var lo = Math.min(e, b);
    var hi = Math.max(e, b);

    $("orm-empty").hidden = true;
    $("orm-output").hidden = false;

    $("orm-epley").textContent = fmtKg(e);
    $("orm-brzycki").textContent = fmtKg(b);
    $("orm-range").textContent =
      reps === 1
        ? fmtKg(weightKg) + " kg — that IS your 1RM 💪"
        : fmtKg(lo) + " – " + fmtKg(hi) + " kg";

    renderTable(e); // table based on Epley estimate

    // Accuracy warning for high-rep sets
    var warn = $("orm-warn");
    if (reps > 10) {
      warn.textContent =
        "At " + reps + " reps the formulas disagree (" + fmtKg(lo) + "–" + fmtKg(hi) +
        " kg). For a sharper estimate, retest with a heavier weight for 3–5 reps.";
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }
  }

  function showError(msg) {
    var err = $("orm-error");
    err.textContent = msg;
    err.hidden = false;
    $("orm-output").hidden = true;
    $("orm-empty").hidden = false;
  }

  function clearError() {
    $("orm-error").hidden = true;
  }

  function readForm() {
    var weight = parseFloat($("orm-weight").value);
    var reps = parseInt($("orm-reps").value, 10);

    if (isNaN(weight) || isNaN(reps)) {
      return { error: "Please enter both the weight (kg) and the reps." };
    }
    if (weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
      return { error: "Weight must be between " + WEIGHT_MIN + " and " + WEIGHT_MAX + " kg." };
    }
    if (reps < REPS_MIN || reps > REPS_MAX) {
      return { error: "Reps must be between " + REPS_MIN + " and " + REPS_MAX + "." };
    }
    return { weight: weight, reps: reps };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.weight, v.reps);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("orm-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing
    $("orm-form").addEventListener("input", function () {
      if ($("orm-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.weight, v.reps);
      }
    });
  });
})();
