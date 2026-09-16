/* ============================================================
   FitCalc — Profile store (single source of truth)
   The user enters their stats ONCE (Profile tab); every
   calculator renders from this shared state.
   Persisted in localStorage — never leaves the browser.
   ============================================================ */

(function () {
  "use strict";

  var STORE_KEY = "fitcalc-profile-v1";

  var ACTIVITY_LABELS = {
    "1.2": "Sedentary",
    "1.375": "Light (1–3 d/wk)",
    "1.55": "Moderate (3–5 d/wk)",
    "1.725": "Very active (6–7 d/wk)",
    "1.9": "Athlete (2×/day)",
  };

  // Training minutes per day derived from activity level (used by Water)
  var TRAIN_MIN = { "1.2": 0, "1.375": 30, "1.55": 45, "1.725": 60, "1.9": 90 };

  var CLIMATE_LABELS = { 0: "Temperate", 500: "Hot / humid", 750: "Hot & dry / altitude" };
  var GOAL_LABELS = { cut: "Cut", maintain: "Maintain", bulk: "Lean bulk" };

  window.FitCalc = window.FitCalc || {};

  var state = null;
  var listeners = [];

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      state = null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* private mode etc. — app still works in-memory */ }
  }

  function emit() {
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  /* ---- public API ---- */

  FitCalc.profile = {
    get: function () {
      return state;
    },
    save: function (p) {
      state = p;
      persist();
      emit();
    },
    onChange: function (fn) {
      listeners.push(fn);
    },
  };

  FitCalc.calc = {
    heightCm: function (p) { return p.heightIn * 2.54; },
    heightM: function (p) { return p.heightIn * 0.0254; },
    bmi: function (p) {
      var m = FitCalc.calc.heightM(p);
      return p.weightKg / (m * m);
    },
    bmr: function (p) {
      var base = 10 * p.weightKg + 6.25 * FitCalc.calc.heightCm(p) - 5 * p.age;
      return p.sex === "male" ? base + 5 : base - 161;
    },
    tdee: function (p) {
      return FitCalc.calc.bmr(p) * p.activity;
    },
    /* Calorie target for the profile goal (same numbers the BMR tab shows) */
    targetKcal: function (p) {
      var t = FitCalc.calc.tdee(p);
      if (p.goal === "cut") return t - 500;
      if (p.goal === "bulk") return t + 250;
      return t;
    },
    trainingMin: function (p) {
      return TRAIN_MIN[String(p.activity)] || 0;
    },
    stepsGoal: function (p) {
      return p.goal === "cut" ? "weightloss" : "health";
    },
  };

  FitCalc.labels = {
    activity: ACTIVITY_LABELS,
    climate: CLIMATE_LABELS,
    goal: GOAL_LABELS,
  };

  /* Shared UI helper: fill a summary container with k/v rows */
  FitCalc.ui = {
    summary: function (containerId, rows) {
      var el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = "";
      rows.forEach(function (r) {
        var div = document.createElement("div");
        div.className = "result-row";
        var k = document.createElement("span");
        k.className = "k";
        k.textContent = r[0];
        var v = document.createElement("span");
        v.className = "v";
        v.textContent = r[1];
        div.appendChild(k);
        div.appendChild(v);
        el.appendChild(div);
      });
    },
  };

  load(); // read stored profile immediately so calculators can render on DOMContentLoaded

  /* ---- Profile tab form ---- */

  function $(id) {
    return document.getElementById(id);
  }

  function fillForm(p) {
    if (!p) return;
    $("pf-name").value = p.name || "";
    var sexEl = document.querySelector('input[name="pf-sex"][value="' + p.sex + '"]');
    if (sexEl) sexEl.checked = true;
    $("pf-age").value = p.age;
    $("pf-weight").value = p.weightKg;
    $("pf-height").value = p.heightIn;
    $("pf-activity").value = String(p.activity);
    var goalEl = document.querySelector('input[name="pf-goal"][value="' + p.goal + '"]');
    if (goalEl) goalEl.checked = true;
    $("pf-goal-weight").value = p.goalWeightKg == null ? "" : p.goalWeightKg;
    $("pf-climate").value = String(p.climate);
  }

  function readForm() {
    var sexEl = document.querySelector('input[name="pf-sex"]:checked');
    var goalEl = document.querySelector('input[name="pf-goal"]:checked');
    var age = parseFloat($("pf-age").value);
    var weight = parseFloat($("pf-weight").value);
    var height = parseFloat($("pf-height").value);
    var activity = parseFloat($("pf-activity").value);
    var climate = parseFloat($("pf-climate").value) || 0;
    var gwRaw = $("pf-goal-weight").value.trim();
    var goalWeight = gwRaw === "" ? null : parseFloat(gwRaw);
    // name: optional, single-spaced, angle brackets stripped (banner uses innerHTML), capped at 40
    var name = $("pf-name").value
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);

    if (!sexEl || !goalEl) return { error: "Please choose sex and goal." };
    if (isNaN(age) || age < 15 || age > 100) return { error: "Age must be between 15 and 100 years." };
    if (isNaN(weight) || weight < 20 || weight > 400) return { error: "Weight must be between 20 and 400 kg." };
    if (isNaN(height) || height < 36 || height > 96) return { error: "Height must be between 36 and 96 inches (3–8 ft)." };
    if (goalWeight !== null && (isNaN(goalWeight) || goalWeight < 20 || goalWeight > 400)) {
      return { error: "Target weight must be between 20 and 400 kg (or left blank)." };
    }

    return {
      name: name || null,
      sex: sexEl.value,
      age: age,
      weightKg: weight,
      heightIn: height,
      activity: activity,
      goal: goalEl.value,
      goalWeightKg: goalWeight,
      climate: climate,
    };
  }

  function updateBanner() {
    var el = $("profile-status");
    if (!el) return;

    if (!state) {
      el.className = "profile-status is-empty";
      el.innerHTML =
        "<span>👋 <strong>Start here:</strong> enter your stats once — every calculator fills itself in automatically.</span>" +
        '<a class="btn-mini" href="#/profile">Set up profile</a>';
      return;
    }

    var p = state;
    var parts = [
      (p.sex === "male" ? "Male" : "Female") + ", " + p.age + "y",
      p.weightKg + " kg",
      p.heightIn + " in",
      ACTIVITY_LABELS[String(p.activity)] || "—",
      "Goal: " + GOAL_LABELS[p.goal] + (p.goalWeightKg ? " → " + p.goalWeightKg + " kg" : ""),
    ];
    el.className = "profile-status is-saved";
    el.innerHTML =
      "<span>✔ <strong>" + (p.name ? p.name + " — " : "") + parts.join(" · ") + "</strong></span>" +
      '<a class="btn-mini" href="#/profile">Edit</a>';
  }

  function onSubmit(e) {
    e.preventDefault();
    var v = readForm();
    $("pf-note").hidden = true;

    if (v.error) {
      var err = $("pf-error");
      err.textContent = v.error;
      err.hidden = false;
      return;
    }
    $("pf-error").hidden = true;

    FitCalc.profile.save(v);
    var note = $("pf-note");
    note.textContent = "Profile saved — all six calculators updated ✔";
    note.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillForm(state);
    updateBanner();
    $("pf-form").addEventListener("submit", onSubmit);
    FitCalc.profile.onChange(updateBanner);
  });
})();
