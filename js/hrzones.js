/* ============================================================
   FitCalc — Heart Rate Zones (Step 5)
   Max HR (Tanaka): 208 − 0.68 × age   (or user override)
   Methods:
     %maxHR:   target = maxHR × pct
     Karvonen: target = restingHR + (maxHR − restingHR) × pct
   ============================================================ */

(function () {
  "use strict";

  var ZONES = [
    {
      id: 1, lo: 50, hi: 60,
      name: "Very light — recovery",
      desc: "Warm-up, cool-down and active recovery. Effortless breathing, full conversation possible.",
    },
    {
      id: 2, lo: 60, hi: 70,
      name: "Light — aerobic base",
      desc: "Long steady sessions. Builds the aerobic base and fat oxidation. Conversational pace.",
    },
    {
      id: 3, lo: 70, hi: 80,
      name: "Moderate — endurance",
      desc: "Tempo work. Improves aerobic capacity and efficiency. Breathing deeper, short sentences only.",
    },
    {
      id: 4, lo: 80, hi: 90,
      name: "Hard — threshold",
      desc: "Lactate threshold work. Raises the pace you can sustain. Uncomfortable, a few words at a time.",
    },
    {
      id: 5, lo: 90, hi: 100,
      name: "Maximum — VO2 / power",
      desc: "Short intervals and all-out efforts. Builds peak power and VO2 max. Seconds to a few minutes.",
    },
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function tanaka(age) {
    return 208 - 0.68 * age;
  }

  /* Target bpm at a given intensity % */
  function targetBpm(method, maxHR, restHR, pct) {
    var fraction = pct / 100;
    if (method === "karvonen") {
      return restHR + (maxHR - restHR) * fraction;
    }
    return maxHR * fraction;
  }

  function renderZones(method, maxHR, restHR) {
    var list = $("hr-zones");
    list.innerHTML = "";

    ZONES.forEach(function (z) {
      var loBpm = Math.round(targetBpm(method, maxHR, restHR, z.lo));
      var hiBpm = Math.round(targetBpm(method, maxHR, restHR, z.hi));

      var div = document.createElement("div");
      div.className = "zone z" + z.id;

      div.innerHTML =
        '<div class="zone-head">' +
          '<span class="zone-chip">Z' + z.id + "</span>" +
          '<span class="zone-name">' + z.name + "</span>" +
          '<span class="zone-bpm">' + loBpm + "–" + hiBpm + " bpm</span>" +
        "</div>" +
        '<div class="zone-desc">' + z.desc + "</div>" +
        '<div class="zone-pct">' + z.lo + "–" + z.hi + "% of " +
          (method === "karvonen" ? "heart rate reserve" : "max HR") +
        "</div>";

      list.appendChild(div);
    });
  }

  function render(method, age, restHR, maxOverride) {
    var maxHR, isEstimated;

    if (maxOverride !== null) {
      maxHR = maxOverride;
      isEstimated = false;
    } else {
      maxHR = tanaka(age);
      isEstimated = true;
    }

    $("hr-empty").hidden = true;
    $("hr-output").hidden = false;

    $("hr-max-out").textContent = Math.round(maxHR);
    $("hr-max-label").textContent = isEstimated
      ? "Max heart rate — estimated (Tanaka, age " + age + ")"
      : "Max heart rate — your input";

    $("hr-method-out").textContent =
      method === "karvonen" ? "Karvonen — heart rate reserve" : "% of max HR";

    if (method === "karvonen") {
      $("hr-hrr-row").hidden = false;
      $("hr-hrr").textContent = Math.round(maxHR - restHR);
    } else {
      $("hr-hrr-row").hidden = true;
    }

    renderZones(method, maxHR, restHR);
  }

  function showError(msg) {
    var err = $("hr-error");
    err.textContent = msg;
    err.hidden = false;
    $("hr-output").hidden = true;
    $("hr-empty").hidden = false;
  }

  function clearError() {
    $("hr-error").hidden = true;
  }

  /* Read + validate the form. Returns values object or { error }. */
  function readForm() {
    var methodEl = document.querySelector('input[name="hr-method"]:checked');
    var method = methodEl ? methodEl.value : "max";

    var age = parseFloat($("hr-age").value);
    var resting = parseFloat($("hr-resting").value);
    var maxRaw = $("hr-max").value.trim();
    var maxOverride = maxRaw === "" ? null : parseFloat(maxRaw);

    if (!isNaN(maxOverride)) {
      if (maxOverride < 100 || maxOverride > 220) {
        return { error: "Max HR override must be between 100 and 220 bpm." };
      }
    }

    // Age is required unless a max HR override is given
    if (maxOverride === null) {
      if (isNaN(age)) {
        return { error: "Enter your age — or provide a max HR override." };
      }
      if (age < 10 || age > 100) {
        return { error: "Age must be between 10 and 100 years." };
      }
    }

    var restHR = null;
    if (method === "karvonen") {
      if (isNaN(resting)) {
        return { error: "The Karvonen method needs your resting HR (bpm)." };
      }
      if (resting < 30 || resting > 120) {
        return { error: "Resting HR must be between 30 and 120 bpm." };
      }
      var effectiveMax = maxOverride !== null ? maxOverride : tanaka(age);
      if (resting >= effectiveMax) {
        return { error: "Resting HR must be lower than max HR." };
      }
      restHR = resting;
    }

    return { method: method, age: age, restHR: restHR, maxOverride: maxOverride };
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();
    var v = readForm();
    if (v.error) {
      showError(v.error);
      return;
    }
    render(v.method, v.age, v.restHR, v.maxOverride);
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("hr-form").addEventListener("submit", onSubmit);

    // Live recalculation once a result is showing (inputs + method toggle)
    function liveUpdate() {
      if ($("hr-output").hidden) return;
      var v = readForm();
      if (!v.error) {
        clearError();
        render(v.method, v.age, v.restHR, v.maxOverride);
      }
    }

    $("hr-form").addEventListener("input", liveUpdate);
    $("hr-form").addEventListener("change", liveUpdate);
  });
})();
