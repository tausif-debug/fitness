/* ============================================================
   FitCalc — 7-Day Diet Plan (Pakistani home-style, bilingual)
   Builds a week of meals sized to the profile's calorie target.
   Deterministic: same profile → same plan.
   `name`/`label` fields stay ENGLISH (the PDF report uses them);
   the UI renders Urdu via FOODS[key].nu and i18n keys.
   ============================================================ */

(function () {
  "use strict";

  /* ---- food database: kcal / protein / carbs / fat per unit; n = English, nu = Urdu ---- */
  var FOODS = {
    roti:       { n: "Roti / chapati",            nu: "روٹی / چپاتی",       u: "1 medium",   k: 120, p: 4,   c: 22,  f: 2 },
    paratha:    { n: "Paratha",                   nu: "پراٹھا",             u: "1",          k: 250, p: 5,   c: 30,  f: 12 },
    alooParatha:{ n: "Aloo paratha",              nu: "آلو پراٹھا",         u: "1",          k: 300, p: 6,   c: 38,  f: 14 },
    rice:       { n: "White rice (cooked)",       nu: "سفید چاول (پکے ہوئے)", u: "100 g",    g: 100, k: 130, p: 2.7, c: 28, f: 0.3 },
    eggBoiled:  { n: "Boiled egg",                nu: "ابلا ہوا انڈا",      u: "1",          k: 78,  p: 6.3, c: 0.6, f: 5.3 },
    omelette:   { n: "Omelette (2 eggs)",         nu: "املیٹ (2 انڈے)",     u: "1 plate",    k: 200, p: 12,  c: 2,   f: 16 },
    shami:      { n: "Shami kabab",               nu: "شامی کباب",          u: "1 piece",    k: 140, p: 10,  c: 8,   f: 8 },
    seekh:      { n: "Seekh kabab (beef)",        nu: "سیخ کباب (بیف)",     u: "1 piece",    k: 190, p: 14,  c: 4,   f: 13 },
    dalia:      { n: "Doodh dalia (porridge)",    nu: "دودھ دلیہ",          u: "1 bowl",     k: 250, p: 12,  c: 38,  f: 5 },
    chickenTikka:{ n: "Chicken tikka (grilled)",  nu: "چکن تکہ (گرل)",      u: "100 g",      g: 100, k: 165, p: 31, c: 1, f: 4 },
    karahi:     { n: "Chicken karahi",            nu: "چکن کڑاہی",          u: "1 bowl",     k: 320, p: 28,  c: 8,   f: 20 },
    biryani:    { n: "Chicken biryani",           nu: "چکن بریانی",         u: "1 plate",    k: 450, p: 22,  c: 55,  f: 15 },
    pulao:      { n: "Chicken pulao",             nu: "چکن پلاؤ",           u: "1 plate",    k: 420, p: 20,  c: 50,  f: 14 },
    alooGosht:  { n: "Aloo gosht (mutton)",       nu: "آلو گوشت (مٹن)",     u: "1 bowl",     k: 330, p: 22,  c: 20,  f: 18 },
    keema:      { n: "Beef keema",                nu: "بیف قیمہ",           u: "1 bowl",     k: 250, p: 24,  c: 6,   f: 15 },
    fish:       { n: "Grilled fish",              nu: "گرل مچھلی",          u: "120 g",      k: 160, p: 28,  c: 0,   f: 5 },
    haleem:     { n: "Haleem",                    nu: "حلیم",               u: "1 bowl",     k: 300, p: 18,  c: 30,  f: 12 },
    daalChana:  { n: "Daal chana",                nu: "چنے کی دال",         u: "1 cup",      k: 230, p: 13,  c: 38,  f: 3 },
    daalMix:    { n: "Mix daal (masoor/moong)",   nu: "مکس دال (مسور/مونگ)", u: "1 cup",     k: 200, p: 12,  c: 35,  f: 1.5 },
    sabzi:      { n: "Seasonal sabzi (bhindi/gobi)", nu: "موسمی سبزی (بھنڈی/گوبھی)", u: "1 cup", k: 150, p: 3, c: 18, f: 8 },
    palakPaneer:{ n: "Palak paneer",              nu: "پالک پنیر",          u: "1 cup",      k: 220, p: 12,  c: 8,   f: 16 },
    dahi:       { n: "Dahi (yogurt)",             nu: "دہی",                u: "1 cup",      k: 100, p: 8,   c: 10,  f: 2.5 },
    raita:      { n: "Raita",                     nu: "رائتہ",              u: "1 bowl",     k: 60,  p: 3,   c: 6,   f: 2.5 },
    salad:      { n: "Salad (kachumber)",         nu: "سلاد (کچومبر)",      u: "1 plate",    k: 40,  p: 1.5, c: 7,   f: 0.5 },
    fruit:      { n: "Seasonal fruit (apple/guava)", nu: "موسمی پھل (سیب/امرود)", u: "1 medium", k: 80, p: 1, c: 20, f: 0.3 },
    banana:     { n: "Banana",                    nu: "کیلا",               u: "1",          k: 105, p: 1.3, c: 27,  f: 0.4 },
    nuts:       { n: "Nuts (almonds/walnuts)",    nu: "خشک میوہ (بادام/اخروٹ)", u: "25 g",    k: 150, p: 5,   c: 6,   f: 13 },
    chanaRoast: { n: "Roasted chana",             nu: "بھنے ہوئے چنے",      u: "25 g",       k: 90,  p: 5,   c: 15,  f: 1.5 },
    chaas:      { n: "Chaas (salted lassi)",      nu: "چھاچھ",              u: "1 glass",    k: 60,  p: 4,   c: 6,   f: 2 },
    lassi:      { n: "Sweet lassi",               nu: "میٹھی لسی",          u: "1 glass",    k: 180, p: 6,   c: 28,  f: 5 },
    chai:       { n: "Chai (1 tsp sugar)",        nu: "چائے (1 چمچ چینی)",  u: "1 cup",      k: 60,  p: 2,   c: 8,   f: 2 },
    chaat:      { n: "Chana chaat",               nu: "چنا چاٹ",            u: "1 plate",    k: 180, p: 9,   c: 28,  f: 4 },
  };

  /* ---- meal templates (quantities are "maintain" baseline) ---- */
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

  function t(key, params) {
    return FitCalc.i18n ? FitCalc.i18n.t(key, params) : key;
  }

  function isUr() {
    return FitCalc.i18n && FitCalc.i18n.lang() === "ur";
  }

  function foodName(key) {
    var fd = FOODS[key];
    return (isUr() && fd.nu) ? fd.nu : fd.n;
  }

  function roundStaple(key, q) {
    if (key === "roti" || key === "paratha" || key === "alooParatha") {
      return Math.max(0.5, Math.round(q * 2) / 2);
    }
    if (key === "rice") return Math.max(0.25, Math.round(q * 4) / 4);
    return Math.round(q * 10) / 10;
  }

  function qtyText(key, q) {
    var fd = FOODS[key];
    if (fd.g) return isUr() ? t("diet.qtyGrams", { g: Math.round(q * fd.g) }) : Math.round(q * fd.g) + " g";
    if (q === 1) return isUr() ? "" : fd.u;
    return t("diet.qtyTimes", { q: Math.round(q * 10) / 10 });
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

  /* ---- week builder (pure — also used by the PDF report; labels stay English) ---- */

  function buildWeek(p) {
    var target = FitCalc.calc.targetKcal(p);
    var pTarget = Math.min(p.weightKg * (GOAL_PROTEIN[p.goal] || 1.8), (target * 0.35) / 4);
    var sf = STAPLE_FACTOR[p.goal] || 1;

    function expand(tpl) {
      return tpl.map(function (x) {
        var q = x.staple ? roundStaple(x.f, x.q * sf) : x.q;
        return itemMacros(x.f, q);
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
        var tt = sum(meals.breakfast.concat(meals.lunch, meals.dinner, meals.snacks));
        var lowKcal = tt.k < target * 0.96;
        var lowProtein = tt.p < pTarget * 0.8;
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
      var totals = dayMeals.reduce(function (a, m2) {
        return { k: a.k + m2.totals.k, p: a.p + m2.totals.p, c: a.c + m2.totals.c, f: a.f + m2.totals.f };
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
      [t("row.goal"), t("goal." + p.goal)],
      [t("row.dailyCalTarget"), fmt0(FitCalc.calc.targetKcal(p)) + " kcal"],
      [t("row.weight"), p.weightKg + " kg"],
      [t("diet.planStyle"), t("diet.styleVal")],
    ]);
  }

  var SLOT_EMOJI = { breakfast: "🍳", lunch: "🍛", dinner: "🌙", snacks: "🥜" };

  function mealCardHTML(m) {
    var rows = m.items.map(function (it) {
      var qt = it.qtyText ? ' <span class="fq">' + it.qtyText + "</span>" : "";
      return '<div class="food-line"><span>' + foodName(it.key) + qt +
        '</span><span class="fk">' + fmt0(it.k) + " kcal</span></div>";
    }).join("");
    return '<div class="meal-card"><div class="meal-head"><span><span class="meal-emoji">' +
      (SLOT_EMOJI[m.slot] || "") + "</span>" + t("slot." + m.slot) +
      '</span><span class="mk">' + fmt0(m.totals.k) + " kcal</span></div>" + rows + "</div>";
  }

  function renderDay() {
    var day = currentPlan.days[selectedDay];
    var host = $("diet-day");
    var tot = day.totals, target = currentPlan.target;
    var matchPct = Math.round((tot.k / target) * 100);
    var barPct = Math.min(100, (tot.k / (target * 1.15)) * 100);

    var R = 26, CIRC = 2 * Math.PI * R;
    var clamped = Math.max(0, Math.min(1, tot.k / target));
    var ringHtml =
      '<div class="day-ring">' +
        '<svg class="ring" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">' +
          '<circle cx="32" cy="32" r="' + R + '" fill="none" stroke="var(--surface-2)" stroke-width="7"></circle>' +
          '<circle class="ring-val" cx="32" cy="32" r="' + R + '" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + CIRC.toFixed(1) + '" stroke-dashoffset="' + CIRC.toFixed(1) + '"></circle>' +
        "</svg>" +
        '<div><b>' + matchPct + "%</b><br><span>" + t("diet.ringLabel") + "</span></div>" +
      "</div>";

    host.innerHTML =
      day.meals.map(mealCardHTML).join("") +
      '<div class="diet-totals">' +
        ringHtml +
        '<div class="match-bar" title="' + matchPct + '%"><span style="width:' + barPct.toFixed(1) + '%"></span></div>' +
        '<div class="result-row"><span class="k">' + t("diet.dayTotal", { t: fmt0(target) }) + "</span>" +
          '<span class="v">' + fmt0(tot.k) + " kcal · " + matchPct + "%</span></div>" +
        '<div class="result-row"><span class="k">' + t("diet.proteinRow", { t: fmt0(currentPlan.proteinTarget) }) + '</span><span class="v">' + fmt0(tot.p) + " g</span></div>" +
        '<div class="result-row"><span class="k">' + t("row.carbs") + '</span><span class="v">' + fmt0(tot.c) + " g</span></div>" +
        '<div class="result-row"><span class="k">' + t("row.fat") + '</span><span class="v">' + fmt0(tot.f) + " g</span></div>" +
      "</div>";

    // animate the ring to the day's match percentage
    var rv = host.querySelector(".ring-val");
    if (rv) {
      var off = (CIRC * (1 - clamped)).toFixed(1);
      if (FitCalc.fx.disabled()) {
        rv.style.strokeDashoffset = off;
      } else {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { rv.style.strokeDashoffset = off; });
        });
      }
    }
  }

  function renderChips() {
    var host = $("diet-days");
    host.innerHTML = currentPlan.days.map(function (d, i) {
      var label = t("diet.day" + (i + 1));
      return '<button type="button" class="day-chip' + (i === selectedDay ? " is-active" : "") +
        '" data-day="' + i + '">' + label.replace(/ \(/, "<br>(") + "</button>";
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
      '<div class="result-row"><span class="k">' + t("diet.weekAvg") + '</span><span class="v">' + t("diet.weekAvgVal", { k: fmt0(avgK), p: fmt0(avgP) }) + "</span></div>" +
      '<div class="result-row"><span class="k">' + t("diet.inRange") + '</span><span class="v">' + t("diet.inRangeVal", { n: inRange }) + "</span></div>" +
      '<div class="result-row"><span class="k">' + t("diet.variety") + '</span><span class="v">' + t("diet.varietyVal") + "</span></div>";
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
    if (FitCalc.i18n) FitCalc.i18n.onChange(render);
    render();
  });

  window.FitCalc = window.FitCalc || {};
  FitCalc.diet = { buildWeek: buildWeek, FOODS: FOODS, SLOTS: SLOTS };
})();
