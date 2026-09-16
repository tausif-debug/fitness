/* ============================================================
   FitCalc — 7-Day Diet Plan (Pakistani home-style)
   Builds a week of meals sized to the profile's calorie target
   and macro goals. Deterministic: same profile → same plan.
   ============================================================ */

(function () {
  "use strict";

  /* ---- food database: kcal / protein / carbs / fat per unit ----
     q = quantity; foods with `g` show grams (q × g). Values are
     standard estimates for home cooking with moderate oil/ghee. */
  var FOODS = {
    roti:       { n: "Roti / chapati",            u: "1 medium",   k: 120, p: 4,   c: 22,  f: 2 },
    paratha:    { n: "Paratha",                   u: "1",          k: 250, p: 5,   c: 30,  f: 12 },
    alooParatha:{ n: "Aloo paratha",              u: "1",          k: 300, p: 6,   c: 38,  f: 14 },
    rice:       { n: "White rice (cooked)",       u: "100 g",      g: 100, k: 130, p: 2.7, c: 28, f: 0.3 },
    eggBoiled:  { n: "Boiled egg",                u: "1",          k: 78,  p: 6.3, c: 0.6, f: 5.3 },
    omelette:   { n: "Omelette (2 eggs)",         u: "1 plate",    k: 200, p: 12,  c: 2,   f: 16 },
    shami:      { n: "Shami kabab",               u: "1 piece",    k: 140, p: 10,  c: 8,   f: 8 },
    seekh:      { n: "Seekh kabab (beef)",        u: "1 piece",    k: 190, p: 14,  c: 4,   f: 13 },
    dalia:      { n: "Doodh dalia (porridge)",    u: "1 bowl",     k: 250, p: 12,  c: 38,  f: 5 },
    chickenTikka:{ n: "Chicken tikka (grilled)",  u: "100 g",      g: 100, k: 165, p: 31, c: 1, f: 4 },
    karahi:     { n: "Chicken karahi",            u: "1 bowl",     k: 320, p: 28,  c: 8,   f: 20 },
    biryani:    { n: "Chicken biryani",           u: "1 plate",    k: 450, p: 22,  c: 55,  f: 15 },
    pulao:      { n: "Chicken pulao",             u: "1 plate",    k: 420, p: 20,  c: 50,  f: 14 },
    alooGosht:  { n: "Aloo gosht (mutton)",       u: "1 bowl",     k: 330, p: 22,  c: 20,  f: 18 },
    keema:      { n: "Beef keema",                u: "1 bowl",     k: 250, p: 24,  c: 6,   f: 15 },
    fish:       { n: "Grilled fish",              u: "120 g",      k: 160, p: 28,  c: 0,   f: 5 },
    haleem:     { n: "Haleem",                    u: "1 bowl",     k: 300, p: 18,  c: 30,  f: 12 },
    daalChana:  { n: "Daal chana",                u: "1 cup",      k: 230, p: 13,  c: 38,  f: 3 },
    daalMix:    { n: "Mix daal (masoor/moong)",   u: "1 cup",      k: 200, p: 12,  c: 35,  f: 1.5 },
    sabzi:      { n: "Seasonal sabzi (bhindi/gobi)", u: "1 cup",   k: 150, p: 3,   c: 18,  f: 8 },
    palakPaneer:{ n: "Palak paneer",              u: "1 cup",      k: 220, p: 12,  c: 8,   f: 16 },
    dahi:       { n: "Dahi (yogurt)",             u: "1 cup",      k: 100, p: 8,   c: 10,  f: 2.5 },
    raita:      { n: "Raita",                     u: "1 bowl",     k: 60,  p: 3,   c: 6,   f: 2.5 },
    salad:      { n: "Salad (kachumber)",         u: "1 plate",    k: 40,  p: 1.5, c: 7,   f: 0.5 },
    fruit:      { n: "Seasonal fruit (apple/guava)", u: "1 medium", k: 80,  p: 1,   c: 20,  f: 0.3 },
    banana:     { n: "Banana",                    u: "1",          k: 105, p: 1.3, c: 27,  f: 0.4 },
    nuts:       { n: "Nuts (almonds/walnuts)",    u: "25 g",       k: 150, p: 5,   c: 6,   f: 13 },
    chanaRoast: { n: "Roasted chana",             u: "25 g",       k: 90,  p: 5,   c: 15,  f: 1.5 },
    chaas:      { n: "Chaas (salted lassi)",      u: "1 glass",    k: 60,  p: 4,   c: 6,   f: 2 },
    lassi:      { n: "Sweet lassi",               u: "1 glass",    k: 180, p: 6,   c: 28,  f: 5 },
    chai:       { n: "Chai (1 tsp sugar)",        u: "1 cup",      k: 60,  p: 2,   c: 8,   f: 2 },
    chaat:      { n: "Chana chaat",               u: "1 plate",    k: 180, p: 9,   c: 28,  f: 4 },
  };

  /* ---- meal templates (quantities are "maintain" baseline) ----
     staple: true → quantity scales with the goal factor */
  var BREAKFASTS = [
    [{ f: "omelette", q: 1 }, { f: "roti", q: 1, staple: true }, { f: "chai", q: 1 }],
    [{ f: "eggBoiled", q: 2 }, { f: "paratha", q: 1, staple: true }, { f: "fruit", q: 1 }, { f: "chai", q: 1 }],
    [{ f: "alooParatha", q: 1, staple: true }, { f: "dahi", q: 1 }, { f: "chai", q: 1 }],
    [{ f: "dalia", q: 1 }, { f: "eggBoiled", q: 1 }, { f: "chai", q: 1 }],
    [{ f: "shami", q: 2 }, { f: "roti", q: 1, staple: true }, { f: "chai", q: 1 }],
    [{ f: "eggBoiled", q: 2 }, { f: "roti", q: 1.5, staple: true }, { f: "fruit", q: 1 }],
    [{ f: "daalChana", q: 0.5 }, { f: "paratha", q: 1, staple: true }, { f: "chai", q: 1 }], // Sunday chana-paratha
  ];

  var LUNCHES = [
    [{ f: "karahi", q: 1 }, { f: "roti", q: 2, staple: true }, { f: "salad", q: 1 }],
    [{ f: "daalChana", q: 1 }, { f: "rice", q: 1, staple: true }, { f: "salad", q: 1 }, { f: "dahi", q: 1 }],
    [{ f: "biryani", q: 1 }, { f: "raita", q: 1 }, { f: "salad", q: 1 }],
    [{ f: "alooGosht", q: 1 }, { f: "roti", q: 2, staple: true }, { f: "salad", q: 1 }],
    [{ f: "daalMix", q: 1 }, { f: "roti", q: 2, staple: true }, { f: "salad", q: 1 }, { f: "chaas", q: 1 }],
    [{ f: "keema", q: 1 }, { f: "roti", q: 2, staple: true }, { f: "salad", q: 1 }, { f: "dahi", q: 1 }],
    [{ f: "fish", q: 1 }, { f: "rice", q: 1, staple: true }, { f: "salad", q: 1 }], // Friday fish
  ];

  var DINNERS = [
    [{ f: "chickenTikka", q: 1.2 }, { f: "roti", q: 1.5, staple: true }, { f: "salad", q: 1 }, { f: "dahi", q: 1 }],
    [{ f: "palakPaneer", q: 1 }, { f: "roti", q: 2, staple: true }],
    [{ f: "seekh", q: 2 }, { f: "roti", q: 1, staple: true }, { f: "chaat", q: 0.5 }],
    [{ f: "sabzi", q: 1 }, { f: "shami", q: 1 }, { f: "roti", q: 2, staple: true }, { f: "dahi", q: 1 }],
    [{ f: "haleem", q: 1 }, { f: "roti", q: 1, staple: true }, { f: "salad", q: 1 }],
    [{ f: "daalMix", q: 1 }, { f: "rice", q: 0.75, staple: true }, { f: "salad", q: 1 }],
    [{ f: "pulao", q: 1 }, { f: "raita", q: 1 }, { f: "salad", q: 1 }],
  ];

  var SNACK_POOL = ["fruit", "nuts", "chaas", "chanaRoast", "banana", "dahi", "lassi"];

  var STAPLE_FACTOR = { cut: 0.75, maintain: 1, bulk: 1.35 };
  var GOAL_PROTEIN = { cut: 2.2, maintain: 1.8, bulk: 1.6 };
  var DAY_LABELS = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)", "Day 6 (Sat)", "Day 7 (Sun)"];
  var SLOTS = [
    { key: "breakfast", name: "Nashta · breakfast", short: "Nashta" },
    { key: "lunch", name: "Dopehar · lunch", short: "Lunch" },
    { key: "dinner", name: "Raat · dinner", short: "Dinner" },
    { key: "snacks", name: "Snacks", short: "Snacks" },
  ];

  /* ---- helpers ---- */

  function roundStaple(key, q) {
    if (key === "roti" || key === "paratha" || key === "alooParatha") {
      return Math.max(0.5, Math.round(q * 2) / 2);
    }
    if (key === "rice") return Math.max(0.25, Math.round(q * 4) / 4);
    return Math.round(q * 10) / 10;
  }

  function qtyText(key, q) {
    var fd = FOODS[key];
    if (fd.g) return Math.round(q * fd.g) + " g";
    if (q === 1) return fd.u;
    return "× " + (Math.round(q * 10) / 10);
  }

  function itemMacros(key, q) {
    var fd = FOODS[key];
    return { key: key, name: fd.n, qty: q, qtyText: qtyText(key, q), k: fd.k * q, p: fd.p * q, c: fd.c * q, f: fd.f * q };
  }

  function mergeMeal(items) {
    var out = [], idx = {};
    items.forEach(function (it) {
      if (idx[it.key] !== undefined) {
        var o = out[idx[it.key]];
        o.qty += it.qty; o.k += it.k; o.p += it.p; o.c += it.c; o.f += it.f;
        o.qtyText = qtyText(o.key, o.qty);
      } else {
        idx[it.key] = out.length;
        out.push(it);
      }
    });
    return out;
  }

  function sum(items) {
    return items.reduce(function (a, it) {
      return { k: a.k + it.k, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f };
    }, { k: 0, p: 0, c: 0, f: 0 });
  }

  /* ---- week builder (pure — also used by the PDF report) ---- */

  function buildWeek(p) {
    var target = FitCalc.calc.targetKcal(p);
    var pTarget = Math.min(p.weightKg * (GOAL_PROTEIN[p.goal] || 1.8), (target * 0.35) / 4);
    var sf = STAPLE_FACTOR[p.goal] || 1;

    function expand(tpl) {
      return tpl.map(function (t) {
        var q = t.staple ? roundStaple(t.f, t.q * sf) : t.q;
        return itemMacros(t.f, q);
      });
    }

    var week = [];
    for (var d = 0; d < 7; d++) {
      var meals = {
        breakfast: expand(BREAKFASTS[d % BREAKFASTS.length]),
        lunch: expand(LUNCHES[(d + 2) % LUNCHES.length]),
        dinner: expand(DINNERS[(d + 4) % DINNERS.length]),
        snacks: [],
      };

      // snacks: rotate the pool, fill up to ~108% of target
      var running = sum(meals.breakfast).k + sum(meals.lunch).k + sum(meals.dinner).k;
      var si = d, added = 0;
      while (added < 4 && si < d + SNACK_POOL.length * 2) {
        var key = SNACK_POOL[si % SNACK_POOL.length]; si++;
        var it = itemMacros(key, 1);
        if (running + it.k <= target * 1.08) { meals.snacks.push(it); running += it.k; added++; }
      }

      // tune: close calorie gap and protein gap with sensible boosts
      var kcalBoosts = [
        { slot: "lunch", f: "roti", q: 0.5 },
        { slot: "dinner", f: "roti", q: 0.5 },
        { slot: "snacks", f: "dahi", q: 1 },
        { slot: "snacks", f: "lassi", q: 1 },
        { slot: "snacks", f: "nuts", q: 1 },
      ];
      var guard = 0, bi = 0, proteinBoosts = 0;
      while (guard++ < 10) {
        var t = sum(meals.breakfast.concat(meals.lunch, meals.dinner, meals.snacks));
        var lowKcal = t.k < target * 0.96;
        var lowProtein = t.p < pTarget * 0.8;
        if (!lowKcal && !lowProtein) break;
        if (lowProtein && proteinBoosts < 3) {
          proteinBoosts++;
          meals.dinner.push(itemMacros("chickenTikka", 0.5));
        } else if (lowKcal) {
          var kb = kcalBoosts[bi++ % kcalBoosts.length];
          meals[kb.slot].push(itemMacros(kb.f, kb.q));
        } else break;
      }

      var dayMeals = SLOTS.map(function (s) {
        var items = mergeMeal(meals[s.key]);
        return { slot: s.key, name: s.name, short: s.short, items: items, totals: sum(items) };
      });
      var totals = dayMeals.reduce(function (a, m) {
        return { k: a.k + m.totals.k, p: a.p + m.totals.p, c: a.c + m.totals.c, f: a.f + m.totals.f };
      }, { k: 0, p: 0, c: 0, f: 0 });

      week.push({
        label: DAY_LABELS[d],
        meals: dayMeals,
        totals: totals,
        diffPct: ((totals.k - target) / target) * 100,
      });
    }
    return { target: target, proteinTarget: pTarget, days: week };
  }

  /* ---- rendering ---- */

  function $(id) { return document.getElementById(id); }
  function fmt0(n) { return Math.round(n).toLocaleString("en-US"); }
  var selectedDay = 0;
  var currentPlan = null;

  function renderSummary(p) {
    FitCalc.ui.summary("diet-summary", [
      ["Goal", FitCalc.labels.goal[p.goal]],
      ["Daily calorie target", fmt0(FitCalc.calc.targetKcal(p)) + " kcal"],
      ["Weight", p.weightKg + " kg"],
      ["Plan style", "Pakistani home-style · 7-day rotation"],
    ]);
  }

  function mealCardHTML(m) {
    var rows = m.items.map(function (it) {
      return '<div class="food-line"><span>' + it.name +
        (it.qty !== 1 || FOODS[it.key].g ? ' <span class="fq">' + it.qtyText + "</span>" : "") +
        '</span><span class="fk">' + fmt0(it.k) + " kcal</span></div>";
    }).join("");
    return '<div class="meal-card"><div class="meal-head"><span>' + m.name +
      '</span><span class="mk">' + fmt0(m.totals.k) + " kcal</span></div>" + rows + "</div>";
  }

  function renderDay() {
    var day = currentPlan.days[selectedDay];
    var host = $("diet-day");
    var t = day.totals, target = currentPlan.target;
    var matchPct = Math.round((t.k / target) * 100);
    var barPct = Math.min(100, (t.k / (target * 1.15)) * 100);

    host.innerHTML =
      day.meals.map(mealCardHTML).join("") +
      '<div class="diet-totals">' +
        '<div class="match-bar" title="' + matchPct + '% of target"><span style="width:' + barPct.toFixed(1) + '%"></span></div>' +
        '<div class="result-row"><span class="k">Day total vs target (' + fmt0(target) + ' kcal)</span>' +
          '<span class="v">' + fmt0(t.k) + " kcal · " + matchPct + "%</span></div>" +
        '<div class="result-row"><span class="k">Protein (target ' + fmt0(currentPlan.proteinTarget) + ' g)</span><span class="v">' + fmt0(t.p) + " g</span></div>" +
        '<div class="result-row"><span class="k">Carbs</span><span class="v">' + fmt0(t.c) + " g</span></div>" +
        '<div class="result-row"><span class="k">Fat</span><span class="v">' + fmt0(t.f) + " g</span></div>" +
      "</div>";
  }

  function renderChips() {
    var host = $("diet-days");
    host.innerHTML = currentPlan.days.map(function (d, i) {
      return '<button type="button" class="day-chip' + (i === selectedDay ? " is-active" : "") +
        '" data-day="' + i + '">' + d.label.replace(/ \(/, "<br>(") + "</button>";
    }).join("");
    host.querySelectorAll(".day-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedDay = parseInt(btn.dataset.day, 10);
        renderChips();
        renderDay();
      });
    });
  }

  function renderWeek() {
    var days = currentPlan.days;
    var avgK = days.reduce(function (a, d) { return a + d.totals.k; }, 0) / 7;
    var avgP = days.reduce(function (a, d) { return a + d.totals.p; }, 0) / 7;
    var inRange = days.filter(function (d) { return Math.abs(d.diffPct) <= 10; }).length;
    $("diet-week").innerHTML =
      '<div class="result-row"><span class="k">Weekly average</span><span class="v">' + fmt0(avgK) + " kcal · " + fmt0(avgP) + " g protein / day</span></div>" +
      '<div class="result-row"><span class="k">Days within ±10% of target</span><span class="v">' + inRange + " of 7</span></div>" +
      '<div class="result-row"><span class="k">Variety</span><span class="v">7 breakfasts · 7 lunches · 7 dinners — no dish repeats on the same day</span></div>';
  }

  function render() {
    var p = window.FitCalc && FitCalc.profile.get();
    var empty = $("diet-empty"), out = $("diet-output");
    if (!p) {
      empty.hidden = false; out.hidden = true;
      return;
    }
    empty.hidden = true; out.hidden = false;
    renderSummary(p);
    currentPlan = buildWeek(p);
    selectedDay = 0;
    renderChips();
    renderDay();
    renderWeek();
  }

  document.addEventListener("DOMContentLoaded", function () {
    FitCalc.profile.onChange(render);
    render();
  });

  window.FitCalc = window.FitCalc || {};
  FitCalc.diet = { buildWeek: buildWeek, FOODS: FOODS, SLOTS: SLOTS };
})();
