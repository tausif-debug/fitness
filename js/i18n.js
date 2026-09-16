/* ============================================================
   FitCalc — i18n: language gate + English/Urdu translation layer
   Dictionary values are [english, urdu]. English strings are the
   canonical UI text; Urdu renders the whole app RTL.
   NOTE: the PDF report stays English — Urdu script needs font
   embedding + shaping, impossible in the dependency-free engine.
   ============================================================ */

(function () {
  "use strict";

  var LANG_KEY = "fitcalc-lang-v1";

  /* eslint-disable */
  var S = {
    /* ---- document titles ---- */
    "title.overview": ["FitCalc — Gym Fitness Calculators", "FitCalc — جم فٹنس کیلکولیٹرز"],
    "title.profile":  ["My Profile — FitCalc", "میرا پروفائل — FitCalc"],
    "title.bmi":      ["BMI Calculator — FitCalc", "بی ایم آئی کیلکولیٹر — FitCalc"],
    "title.bmr":      ["BMR & TDEE — FitCalc", "بی ایم آر اور ٹی ڈی ای ای — FitCalc"],
    "title.macros":   ["Macro Split — FitCalc", "میکرو تقسیم — FitCalc"],
    "title.water":    ["Water Intake — FitCalc", "پانی کی مقدار — FitCalc"],
    "title.steps":    ["Daily Steps — FitCalc", "روزانہ قدم — FitCalc"],
    "title.timeline": ["Goal Weight Timeline — FitCalc", "ہدفی وزن ٹائم لائن — FitCalc"],
    "title.diet":     ["7-Day Diet Plan — FitCalc", "7 دن کا ڈائٹ پلان — FitCalc"],

    /* ---- gate + header + footer ---- */
    "gate.enSub":  ["Continue in English", "انگریزی میں جاری رکھیں"],
    "gate.urSub":  ["اردو میں جاری رکھیں", "Continue in Urdu"],
    "header.tagline": ["Train smarter. Numbers first.", "سمارٹ ٹریننگ کریں۔ پہلے اعداد۔"],
    "switcher.title": ["Switch language", "زبان بدلیں"],
    "switcher.theme": ["Switch theme", "تھیم بدلیں"],
    "footer.note":  ["FitCalc — educational tool, not medical advice.", "FitCalc — تعلیمی ٹول، طبی مشورہ نہیں۔"],
    "footer.credit": ["Developed by <strong>Tausif Rasool</strong>", "ڈویلپر: <strong>Tausif Rasool</strong>"],

    /* ---- nav ---- */
    "nav.overview": ["Overview", "خلاصہ"],
    "nav.profile":  ["Profile", "پروفائل"],
    "nav.bmi":      ["BMI", "بی ایم آئی"],
    "nav.bmr":      ["BMR &amp; TDEE", "بی ایم آر اور ٹی ڈی ای ای"],
    "nav.macros":   ["Macros", "میکروز"],
    "nav.water":    ["Water", "پانی"],
    "nav.steps":    ["Steps", "قدم"],
    "nav.timeline": ["Timeline", "ٹائم لائن"],
    "nav.diet":     ["Diet Plan", "ڈائٹ پلان"],

    /* ---- overview ---- */
    "overview.title": ["Your Gym Toolkit", "آپ کا جم ٹول کٹ"],
    "overview.credit": ["Developed by <strong>Tausif Rasool</strong>", "ڈویلپر: <strong>Tausif Rasool</strong>"],
    "overview.subtitle": ["One profile, six calculators. Enter your stats <strong>once</strong> — everything below fills in automatically.",
      "ایک پروفائل، چھ کیلکولیٹر۔ اپنی معلومات <strong>ایک بار</strong> درج کریں — نیچے سب کچھ خود بخود بھر جائے گا۔"],
    "report.download": ["Download PDF report", "PDF رپورٹ ڈاؤن لوڈ کریں"],
    "report.note": ["Profile, all six calculators and your 7-day diet plan — one PDF.",
      "پروفائل، تمام چھ کیلکولیٹر اور 7 دن کا ڈائٹ پلان — ایک PDF میں۔ (رپورٹ انگریزی میں تیار ہوتی ہے)"],
    "report.savedFirst": ["Save your profile first.", "پہلے اپنا پروفائل محفوظ کریں۔"],
    "report.done": ["✔ Downloaded {f}", "✔ {f} ڈاؤن لوڈ ہو گئی"],
    "report.fail": ["Download failed here — open the app in a regular browser tab and retry.",
      "ڈاؤن لوڈ ناکام — ایپ کو عام براؤزر ٹیب میں کھول کر دوبارہ کوشش کریں۔"],

    /* ---- overview cards ---- */
    "card.live": ["Live", "لائیو"],
    "card.bmi.t": ["BMI", "بی ایم آئی"],
    "card.bmi.d": ["Body Mass Index from your weight (kg) and height (inches) — with category gauge and healthy weight range.",
      "وزن (کلوگرام) اور قد (انچ) سے باڈی ماس انڈیکس — زمرہ گیج اور صحت مند وزن کی رینج کے ساتھ۔"],
    "card.bmr.t": ["BMR &amp; TDEE", "بی ایم آر اور ٹی ڈی ای ای"],
    "card.bmr.d": ["Mifflin-St Jeor BMR and maintenance calories, with all cut/bulk targets and your plan highlighted.",
      "مفلن-سینٹ جیور BMR اور وزن برقرار رکھنے کیلوریز، تمام کٹ/بلک ٹارگٹس کے ساتھ — آپ کا پلان نمایاں۔"],
    "card.macros.t": ["Macro Split", "میکرو تقسیم"],
    "card.macros.d": ["Protein / carbs / fat grams for your goal's calorie target — computed straight from your TDEE.",
      "آپ کے ہدف کیلوریز کے لیے پروٹین / کاربس / چکنائی کے گرام — براہ راست TDEE سے شمار۔"],
    "card.water.t": ["Water Intake", "پانی کی مقدار"],
    "card.water.d": ["Daily hydration target in litres from your weight, training volume and climate.",
      "وزن، ٹریننگ اور موسم کے مطابق روزانہ پانی کا ہدف — لیٹر میں۔"],
    "card.steps.t": ["Daily Steps", "روزانہ قدم"],
    "card.steps.d": ["Research-based step target for your age and goal — with distance and calories burned.",
      "عمر اور ہدف کے مطابق تحقیق پر مبنی قدموں کا ہدف — فاصلہ اور جلی کیلوریز کے ساتھ۔"],
    "card.timeline.t": ["Goal Timeline", "ہدف ٹائم لائن"],
    "card.timeline.d": ["When you'll hit your target weight on your goal's calorie plan — with milestone dates.",
      "ہدف کیلوری پلان پر آپ کے ہدفی وزن تک پہنچنے کی تاریخ — سنگِ میل کے ساتھ۔"],
    "card.diet.t": ["7-Day Diet Plan", "7 دن کا ڈائٹ پلان"],
    "card.diet.d": ["A full week of Pakistani home-style meals — portioned to your calorie and protein targets.",
      "پاکستانی گھریلو کھانوں کا پورا ہفتہ — آپ کیلوری اور پروٹین ٹارگٹس کے مطابق۔"],

    /* ---- shared bits ---- */
    "common.fromProfile": ["From your profile", "آپ کے پروفائل سے"],
    "common.editProfile": ["Edit profile", "پروفائل ایڈٹ کریں"],
    "row.weight": ["Weight", "وزن"],
    "row.height": ["Height", "قد"],
    "row.sex": ["Sex", "جنس"],
    "row.age": ["Age", "عمر"],
    "row.activity": ["Activity", "سرگرمی"],
    "row.climate": ["Climate", "موسم"],
    "row.training": ["Training", "ٹریننگ"],
    "row.goal": ["Goal", "ہدف"],
    "row.mode": ["Mode", "موڈ"],
    "row.carbs": ["Carbs", "کاربس"],
    "row.fat": ["Fat", "چکنائی"],
    "val.ageYears": ["{n} years", "{n} سال"],
    "val.minPerDay": ["{m} min/day ({a})", "{m} منٹ/دن ({a})"],

    /* ---- profile ---- */
    "profile.title": ["My Profile", "میرا پروفائل"],
    "profile.subtitle": ["Enter your stats <strong>once</strong> — every calculator reads from here. Saved in your browser only (localStorage); nothing is sent anywhere.",
      "اپنی معلومات <strong>ایک بار</strong> درج کریں — ہر کیلکولیٹر یہیں سے پڑھتا ہے۔ صرف آپ کے براؤزر میں محفوظ (localStorage)؛ کہیں بھیجا نہیں جاتا۔"],
    "form.name": ["Name", "نام"],
    "form.nameOpt": ["optional — personalises your PDF report", "اختیاری — PDF رپورٹ کو ذاتی بناتا ہے"],
    "form.namePh": ["e.g. Tausif", "مثلاً Tausif"],
    "form.sex": ["Sex", "جنس"],
    "form.male": ["Male", "مرد"],
    "form.female": ["Female", "عورت"],
    "form.age": ["Age (years)", "عمر (سال)"],
    "form.agePh": ["e.g. 28", "مثلاً 28"],
    "form.weight": ["Weight (kg)", "وزن (کلوگرام)"],
    "form.weightPh": ["e.g. 78.5", "مثلاً 78.5"],
    "form.height": ["Height (inches)", "قد (انچ)"],
    "form.heightPh": ["e.g. 69 — that's 5'9\"", "مثلاً 69 — یعنی 5 فٹ 9 انچ"],
    "form.goalWeight": ["Target weight (kg)", "ہدفی وزن (کلوگرام)"],
    "form.goalWeightOpt": ["for Timeline", "ٹائم لائن کے لیے"],
    "form.goalWeightPh": ["e.g. 72", "مثلاً 72"],
    "form.activity": ["Activity level", "سرگرمی کی سطح"],
    "activityOpt.1.2": ["Sedentary — desk job, little or no exercise", "بیتھے رہنے والا — ڈیسک جاب، ورزش بہت کم یا نہیں"],
    "activityOpt.1.375": ["Light — training 1–3 days/week", "ہلکی — ہفتے میں 1–3 دن ٹریننگ"],
    "activityOpt.1.55": ["Moderate — training 3–5 days/week", "درمیانی — ہفتے میں 3–5 دن ٹریننگ"],
    "activityOpt.1.725": ["Very active — training 6–7 days/week", "بہت سرگرم — ہفتے میں 6–7 دن ٹریننگ"],
    "activityOpt.1.9": ["Athlete — twice-daily training or physical job", "ایتھلیٹ — دن میں دو بار ٹریننگ یا جسمانی کام"],
    "activityShort.1.2": ["Sedentary", "بیتھے رہنے والا"],
    "activityShort.1.375": ["Light (1–3 d/wk)", "ہلکی (1–3 دن/ہفتہ)"],
    "activityShort.1.55": ["Moderate (3–5 d/wk)", "درمیانی (3–5 دن/ہفتہ)"],
    "activityShort.1.725": ["Very active (6–7 d/wk)", "بہت سرگرم (6–7 دن/ہفتہ)"],
    "activityShort.1.9": ["Athlete (2×/day)", "ایتھلیٹ (2×/دن)"],
    "form.goal": ["Goal", "ہدف"],
    "goal.cut": ["Cut", "کٹ"],
    "goal.maintain": ["Maintain", "برقرار"],
    "goal.bulk": ["Lean bulk", "لین بلک"],
    "form.climate": ["Climate", "موسم"],
    "form.climateOpt": ["for Water intake", "پانی کی مقدار کے لیے"],
    "climateOpt.0": ["Temperate", "معتدل"],
    "climateOpt.500": ["Hot / humid — adds 500 ml", "گرم / مرطوب — 500 ملی لیٹر اضافہ"],
    "climateOpt.750": ["Hot &amp; dry or high altitude — adds 750 ml", "گرم و خشک یا پہاڑی علاقہ — 750 ملی لیٹر اضافہ"],
    "climateShort.0": ["Temperate", "معتدل"],
    "climateShort.500": ["Hot / humid", "گرم / مرطوب"],
    "climateShort.750": ["Hot & dry / altitude", "گرم و خشک / پہاڑی"],
    "profile.hint": ["Your activity level also sets training minutes/day for the Water calculator (Sedentary 0 · Light 30 · Moderate 45 · Very active 60 · Athlete 90). Goal targets: Cut = TDEE − 500 kcal, Lean bulk = TDEE + 250 kcal.",
      "آپ کی سرگرمی کی سطح پانی کے کیلکولیٹر کے لیے ٹریننگ منٹ/دن بھی طے کرتی ہے (بیتھے رہنے والا 0 · ہلکی 30 · درمیانی 45 · بہت سرگرم 60 · ایتھلیٹ 90)۔ ہدف: کٹ = TDEE − 500 کیلوریز، لین بلک = TDEE + 250 کیلوریز۔"],
    "profile.save": ["Save profile", "پروفائل محفوظ کریں"],
    "profile.saved": ["Profile saved — all six calculators updated ✔", "پروفائل محفوظ — تمام چھ کیلکولیٹر اپ ڈیٹ ✔"],
    "err.sexGoal": ["Please choose sex and goal.", "براہ کرم جنس اور ہدف منتخب کریں۔"],
    "err.age": ["Age must be between 15 and 100 years.", "عمر 15 سے 100 سال کے درمیان ہونی چاہیے۔"],
    "err.weight": ["Weight must be between 20 and 400 kg.", "وزن 20 سے 400 کلوگرام کے درمیان ہونا چاہیے۔"],
    "err.height": ["Height must be between 36 and 96 inches (3–8 ft).", "قد 36 سے 96 انچ (3–8 فٹ) کے درمیان ہونا چاہیے۔"],
    "err.goalWeight": ["Target weight must be between 20 and 400 kg (or left blank).", "ہدفی وزن 20 سے 400 کلوگرام کے درمیان ہو (یا خالی چھوڑ دیں)۔"],
    "banner.start": ["👋 <strong>Start here:</strong> enter your stats once — every calculator fills itself in automatically.",
      "👋 <strong>یہاں سے شروع کریں:</strong> اپنی معلومات ایک بار درج کریں — ہر کیلکولیٹر خود بخود بھر جائے گا۔"],
    "banner.setup": ["Set up profile", "پروفائل بنائیں"],
    "banner.sexage": ["{sex}, {age}y", "{sex}، {age} سال"],
    "banner.goal": ["Goal: {g}", "ہدف: {g}"],

    /* ---- BMI ---- */
    "bmi.title": ["BMI Calculator", "بی ایم آئی کیلکولیٹر"],
    "bmi.subtitle": ["Body Mass Index — from your profile's weight (kg) and height (inches).",
      "باڈی ماس انڈیکس — آپ کے پروفائل کے وزن (کلوگرام) اور قد (انچ) سے۔"],
    "bmi.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your BMI appears here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — آپ کا BMI یہاں خود بخود ظاہر ہوگا۔"],
    "bmi.heroLabel": ["BMI (kg/m²) ·", "بی ایم آئی (کلوگرام/م²) ·"],
    "bmi.cat.under": ["Underweight", "کم وزن"],
    "bmi.cat.normal": ["Normal", "نارمل"],
    "bmi.cat.over": ["Overweight", "زیادہ وزن"],
    "bmi.cat.obese1": ["Obese · Class I", "موٹاپا · درجہ I"],
    "bmi.cat.obese2": ["Obese · Class II", "موٹاپا · درجہ II"],
    "bmi.cat.obese3": ["Obese · Class III", "موٹاپا · درجہ III"],
    "bmi.healthy": ["Healthy weight for your height", "آپ کے قد کے لیے صحت مند وزن"],
    "bmi.distance": ["Distance to healthy range", "صحت مند رینج تک فاصلہ"],
    "bmi.gain": ["Gain {x} kg to reach BMI 18.5", "BMI 18.5 تک پہنچنے کے لیے {x} کلوگرام بڑھائیں"],
    "bmi.lose": ["Lose {x} kg to reach BMI 24.9", "BMI 24.9 تک پہنچنے کے لیے {x} کلوگرام کم کریں"],
    "bmi.inRange": ["In range — no change needed 💪", "رینج میں — کسی تبدیلی کی ضرورت نہیں 💪"],
    "bmi.disclaimer": ["BMI is a population screening tool — it doesn't distinguish muscle from fat, so very muscular lifters often score \"overweight\".",
      "BMI ایک آبادی سطح کا اسکریننگ ٹول ہے — یہ پٹھوں اور چربی میں فرق نہیں کرتا، اس لیے بہت پٹھے والے لیفٹرز اکثر \"زیادہ وزن\" زمرے میں آتے ہیں۔"],

    /* ---- BMR & TDEE ---- */
    "bmr.title": ["BMR &amp; TDEE", "بی ایم آر اور ٹی ڈی ای ای"],
    "bmr.subtitle": ["Mifflin-St Jeor — from your profile. Your goal's target row is highlighted.",
      "مفلن-سینٹ جیور — آپ کے پروفائل سے۔ آپ کے ہدف کی قطار نمایاں ہے۔"],
    "bmr.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your BMR, TDEE and calorie targets appear here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — BMR، TDEE اور کیلوری ٹارگٹس یہاں خود بخود ظاہر ہوں گے۔"],
    "bmr.heroUnit": ["kcal/day", "کیلوریز/دن"],
    "bmr.heroLabel": ["Maintenance calories (TDEE)", "وزن برقرار رکھنے کیلوریز (TDEE)"],
    "bmr.bmrRow": ["BMR — burn at complete rest", "BMR — مکمل آرام میں جلنے والی کیلوریز"],
    "bmr.activityRow": ["Activity burn (TDEE − BMR)", "سرگرمی میں جلنے والی (TDEE − BMR)"],
    "bmr.targets": ["Targets by goal", "ہدف کے مطابق ٹارگٹس"],
    "th.goal": ["Goal", "ہدف"],
    "th.calories": ["Calories", "کیلوریز"],
    "th.change": ["Est. change", "متوقع تبدیلی"],
    "goalrow.cut20": ["Aggressive cut", "جارحانہ کٹ"],
    "goalrow.cut500": ["Moderate cut", "درمیانہ کٹ"],
    "goalrow.maint": ["Maintenance", "وزن برقرار"],
    "goalrow.bulk250": ["Lean bulk", "لین بلک"],
    "goalrow.bulk500": ["Bulk", "بلک"],
    "plan.you": [" · your plan", " · آپ کا پلان"],
    "rate.maintain": ["maintain", "برقرار"],
    "rate.change": ["{v} kg/wk", "{v} کلوگرام/ہفتہ"],
    "bmr.warn": ["Heads up: an aggressive cut would put you below {f} kcal/day — a commonly used minimum. Consider the moderate cut instead.",
      "خبردار: جارحانہ کٹ آپ کو {f} کیلوریز/دن سے نیچے لے جائے گا — یہ عام طور پر کم از کم حد ہے۔ درمیانہ کٹ بہتر ہے۔"],
    "bmr.disclaimer": ["Estimates assume 1 kg of body tissue ≈ 7,700 kcal. Real-world results vary ±10% — track your weight for 2 weeks and adjust.",
      "اندازہ: 1 کلوگرام جسمانی ٹشو ≈ 7,700 کیلوریز۔ عملی نتائج ±10% مختلف ہو سکتے ہیں — 2 ہفتے وزن نوٹ کریں اور پلان ایڈجسٹ کریں۔"],

    /* ---- Macros ---- */
    "macros.title": ["Macro Split", "میکرو تقسیم"],
    "macros.subtitle": ["Protein / carbs / fat for your goal's calorie target — computed from your profile automatically.",
      "آپ کے ہدف کیلوریز کے لیے پروٹین / کاربس / چکنائی — پروفائل سے خودکار شمار۔"],
    "macros.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your macros appear here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — آپ کے میکروز یہاں خود بخود ظاہر ہوں گے۔"],
    "macro.protein": ["Protein", "پروٹین"],
    "macro.carbs": ["Carbs", "کاربس"],
    "macro.fat": ["Fat", "چکنائی"],
    "legend.protein": ["Protein · 4 kcal/g", "پروٹین · 4 کیلوری/گرام"],
    "legend.carbs": ["Carbs · 4 kcal/g", "کاربس · 4 کیلوری/گرام"],
    "legend.fat": ["Fat · 9 kcal/g", "چکنائی · 9 کیلوری/گرام"],
    "macros.proteinRule": ["Protein rule", "پروٹین اصول"],
    "macros.fatRule": ["Fat rule", "چکنائی اصول"],
    "macros.carbsRule": ["Carbs rule", "کاربس اصول"],
    "macros.pNote.cut": ["2.2 g/kg — higher protein preserves muscle in a deficit", "2.2 گرام/کلوگرام — کمی میں زیادہ پروٹین پٹھوں کو محفوظ رکھتی ہے"],
    "macros.pNote.maintain": ["1.8 g/kg — plenty for maintenance and training", "1.8 گرام/کلوگرام — برقراری اور ٹریننگ کے لیے کافی"],
    "macros.pNote.bulk": ["1.6 g/kg — surplus calories spare protein for growth", "1.6 گرام/کلوگرام — اضافی کیلوریز پروٹین کو نشوونما کے لیے بچاتی ہیں"],
    "macros.fNote.25": ["25% of calories", "25% کیلوریز"],
    "macros.fNote.275": ["27.5% of calories", "27.5% کیلوریز"],
    "macros.cNote": ["Remaining calories after protein & fat", "پروٹین اور چکنائی کے بعد باقی کیلوریز"],
    "row.dailyCalories": ["Daily calories", "روزانہ کیلوریز"],
    "macros.calVal": ["{c} kcal (from your TDEE)", "{c} کیلوریز (آپ کے TDEE سے)"],
    "macros.warnCap": ["Protein capped at 35% of calories ({g} g) — your calorie target is low for your body weight.",
      "پروٹین کیلوریز کے 35% تک محدود ({g} گرام) — آپ کے وزن کے مقابلے میں کیلوری ٹارگٹ کم ہے۔"],
    "macros.warnLowCarb": ["Carbs come out very low (< 10% of calories). If you train hard, consider a smaller deficit.",
      "کاربس بہت کم ہیں (کیلوریز کا 10% سے کم)۔ سخت ٹریننگ کرتے ہیں تو کمی کم رکھیں۔"],
    "macros.disclaimer": ["General sports-nutrition defaults: protein 1.6–2.2 g/kg by goal, fat ~25–28% of calories, carbs fill the remainder. Adjust to preference, performance and how you feel.",
      "عام اسپورٹس نیوٹریشن اصول: ہدف کے مطابق پروٹین 1.6–2.2 گرام/کلوگرام، چکنائی ~25–28% کیلوریز، کاربس باقی مقدار۔ اپنی کارکردگی اور محسوس کے مطابق ایڈجسٹ کریں۔"],

    /* ---- Water ---- */
    "water.title": ["Water Intake", "پانی کی مقدار"],
    "water.subtitle": ["Daily hydration target in litres — training minutes come from your activity level.",
      "روزانہ پانی کا ہدف لیٹر میں — ٹریننگ منٹ آپ کی سرگرمی کی سطح سے آتے ہیں۔"],
    "water.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your water target appears here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — پانی کا ہدف یہاں خود بخود ظاہر ہوگا۔"],
    "water.heroUnit": ["L / day", "لیٹر / دن"],
    "water.heroLabel": ["Daily water target", "روزانہ پانی کا ہدف"],
    "water.baseRow": ["Base need (33 ml/kg)", "بنیادی ضرورت (33 ملی لیٹر/کلوگرام)"],
    "water.trainRow": ["Training (+12 ml/min)", "ٹریننگ (+12 ملی لیٹر/منٹ)"],
    "water.climateRow": ["Climate adder", "موسم کا اضافہ"],
    "water.bottleRow": ["In 500 ml bottles", "500 ملی لیٹر بوتلوں میں"],
    "water.caption": ["≈ {x} glasses of 250 ml", "≈ {x} گلاس (250 ملی لیٹر)"],
    "water.captionMore": [" — showing first {n}", " — پہلے {n} دکھائے گئے"],
    "water.restDay": ["rest day", "آرام کا دن"],
    "water.none": ["none", "کوئی نہیں"],
    "water.trainVal": ["+{ml} ml ({m} min)", "+{ml} ملی لیٹر ({m} منٹ)"],
    "water.disclaimer": ["General guideline — individual needs vary with sweat rate, diet and health. Coffee, tea and water-rich foods also count toward intake. With a heart or kidney condition, follow your doctor's fluid advice.",
      "عام رہنمائی — ذاتی ضرورت پسینے، خوراک اور صحت کے ساتھ بدلتی ہے۔ کافی، چائے اور پانی والی غذائیں بھی شمار ہوتی ہیں۔ دل یا گردے کے مرض میں ڈاکٹر کی ہدایت مانیں۔"],

    /* ---- Steps ---- */
    "steps.title": ["Daily Steps", "روزانہ قدم"],
    "steps.subtitle": ["Your step target — Cut goal switches it to weight-loss mode (+2,000 steps).",
      "آپ کا قدموں کا ہدف — کٹ ہدف اسے وزن میں کمی موڈ میں بدل دیتا ہے (+2,000 قدم)۔"],
    "steps.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your step target appears here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — قدموں کا ہدف یہاں خود بخود ظاہر ہوگا۔"],
    "steps.heroUnit": ["steps/day", "قدم/دن"],
    "steps.labelWL": ["Daily step target — weight loss", "روزانہ قدم کا ہدف — وزن میں کمی"],
    "steps.labelHealth": ["Daily step target — general health", "روزانہ قدم کا ہدف — عام صحت"],
    "steps.age60": [" (age 60+)", " (60 سال سے زائد)"],
    "steps.modeWL": ["Weight loss (goal: cut)", "وزن میں کمی (ہدف: کٹ)"],
    "steps.modeHealth": ["General health", "عام صحت"],
    "steps.rangeRow": ["Research-backed range", "تحقیق سے ثابت رینج"],
    "steps.rangeVal": ["{a} – {b} steps/day", "{a} – {b} قدم/دن"],
    "steps.distRow": ["Distance covered", "طے شدہ فاصلہ"],
    "steps.distVal": ["≈ {x} km/day", "≈ {x} کلومیٹر/دن"],
    "steps.strideRow": ["Your stride (from height)", "آپ کا قدم (قد سے)"],
    "steps.strideVal": ["≈ {x} cm", "≈ {x} سینٹی میٹر"],
    "steps.kcalRow": ["Calories burned walking these steps", "ان قدموں سے جلی کیلوریز"],
    "steps.kcalVal": ["≈ {x} kcal/day", "≈ {x} کیلوریز/دن"],
    "steps.weekRow": ["Distance per week", "ہفتہ وار فاصلہ"],
    "steps.weekVal": ["≈ {x} km/week", "≈ {x} کلومیٹر/ہفتہ"],
    "steps.g1": ["Under ~4,400 — sedentary range", "~4,400 سے کم — بیتھے رہنے والی رینج"],
    "steps.g2": ["4,400–8,000 — health benefits start", "4,400–8,000 — صحت فوائد شروع"],
    "steps.g3": ["8,000–12,000 — optimal range for most adults", "8,000–12,000 — بیشتر بالغوں کے لیے بہترین"],
    "steps.g4": ["12,000–15,000 — very active", "12,000–15,000 — بہت سرگرم"],
    "steps.disclaimer": ["Calorie estimate assumes a moderate pace (~4.8 km/h) on flat ground — hills and speed change it. Step targets are population averages; any increase over your current level helps. A cadence of ~100 steps/min counts as moderate intensity.",
      "کیلوری کا اندازہ معتدل رفتار (~4.8 کلومیٹر/گھنٹہ) اور ہموار زمین فرض کرتا ہے — پہاڑ اور رفتار اسے بدلتے ہیں۔ قدموں کے ہدف آبادی کی اوسط ہیں؛ موجودہ سطح سے کوئی بھی اضافہ مفید ہے۔ ~100 قدم/منٹ معتدل شدت شمار ہوتے ہیں۔"],

    /* ---- Timeline ---- */
    "tl.title": ["Goal Weight Timeline", "ہدفی وزن کی ٹائم لائن"],
    "tl.subtitle": ["When you'll reach your target weight on your goal's calorie plan — all from your profile.",
      "ہدف کیلوری پلان پر آپ اپنے ہدفی وزن تک کب پہنچیں گے — سب کچھ پروفائل سے۔"],
    "tl.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your timeline appears here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — آپ کی ٹائم لائن یہاں خود بخود ظاہر ہوگی۔"],
    "tl.emptyTarget": ["Add a <strong>target weight</strong> in your <a href=\"#/profile\">profile</a> to see your timeline.",
      "ٹائم لائن دیکھنے کے لیے اپنے <a href=\"#/profile\">پروفائل</a> میں <strong>ہدفی وزن</strong> شامل کریں۔"],
    "tl.emptyMaintain": ["Your goal is <strong>Maintain</strong> — your weight stays at {w} kg. Switch your profile goal to <strong>Cut</strong> or <strong>Lean bulk</strong> to see a timeline.",
      "آپ کا ہدف <strong>برقرار</strong> ہے — آپ کا وزن {w} کلوگرام پر رہے گا۔ ٹائم لائن کے لیے پروفائل کا ہدف <strong>کٹ</strong> یا <strong>لین بلک</strong> کریں۔"],
    "tl.emptyAbove": ["Your goal is <strong>{g}</strong> but your target weight ({t} kg) is <em>above</em> your current {c} kg. Adjust the goal or target weight in your <a href=\"#/profile\">profile</a>.",
      "آپ کا ہدف <strong>{g}</strong> ہے مگر ہدفی وزن ({t} کلوگرام) موجودہ {c} کلوگرام سے <em>زیادہ</em> ہے۔ <a href=\"#/profile\">پروفائل</a> میں ہدف یا ہدفی وزن ٹھیک کریں۔"],
    "tl.emptyBelow": ["Your goal is <strong>{g}</strong> but your target weight ({t} kg) is <em>below</em> your current {c} kg. Adjust the goal or target weight in your <a href=\"#/profile\">profile</a>.",
      "آپ کا ہدف <strong>{g}</strong> ہے مگر ہدفی وزن ({t} کلوگرام) موجودہ {c} کلوگرام سے <em>کم</em> ہے۔ <a href=\"#/profile\">پروفائل</a> میں ہدف یا ہدفی وزن ٹھیک کریں۔"],
    "tl.heroUnit": ["weeks", "ہفتے"],
    "tl.dateLabel": ["target date ≈ {d} · ≈ {m} months", "ہدف کی تاریخ ≈ {d} · ≈ {m} ماہ"],
    "tl.atGoal": ["you're already at your goal 🎉", "آپ پہلے ہی اپنے ہدف پر ہیں 🎉"],
    "tl.now": ["{w} kg now", "ابھی {w} کلوگرام"],
    "tl.goalW": ["{w} kg goal", "ہدف {w} کلوگرام"],
    "row.totalChange": ["Total change", "کل تبدیلی"],
    "row.weeklyRate": ["Weekly rate", "ہفتہ وار رفتار"],
    "row.balance": ["Daily energy balance", "روزانہ توانائی کا توازن"],
    "tl.lose": ["lose", "کم"],
    "tl.gain": ["gain", "اضافہ"],
    "tl.rateVal": ["{s}{r} kg/week", "{s}{r} کلوگرام/ہفتہ"],
    "tl.balanceVal": ["{k} kcal/day {d}", "{k} کیلوریز/دن {d}"],
    "tl.deficit": ["deficit", "کمی"],
    "tl.surplus": ["surplus", "اضافہ"],
    "tl.milestones": ["Milestones", "سنگِ میل"],
    "th.progress": ["Progress", "پیش رفت"],
    "th.weightKg": ["Weight (kg)", "وزن (کلوگرام)"],
    "th.byDate": ["By date", "تاریخ تک"],
    "tl.goalReached": ["goal reached 🎉", "ہدف مکمل 🎉"],
    "row.currentWeight": ["Current weight", "موجودہ وزن"],
    "row.targetWeight": ["Target weight", "ہدفی وزن"],
    "row.maintTdee": ["Maintenance (TDEE)", "برقراری (TDEE)"],
    "row.plannedIntake": ["Planned intake", "طے شدہ خوراک"],
    "tl.intakeVal": ["{c} kcal ({g})", "{c} کیلوریز ({g})"],
    "tl.warnPace": ["This pace ({r} kg/wk) exceeds the recommended max of ~{max} kg/wk ({pct}% of bodyweight). Consider a smaller daily {dir} — a safer plan takes about {w} weeks.",
      "یہ رفتار ({r} کلوگرام/ہفتہ) تجویز کردہ زیادہ سے زیادہ ~{max} کلوگرام/ہفتہ (وزن کا {pct}%) سے تجاوز کرتی ہے۔ روزانہ {dir} کم کریں — محفوظ پلان میں تقریباً {w} ہفتے لگیں گے۔"],
    "tl.warnYears": ["That's over 5 years at this pace — consider a nearer interim target weight.",
      "اس رفتار سے 5 سال سے زیادہ لگیں گے — قریبی عارضی ہدفی وزن سوچیں۔"],
    "tl.disclaimer": ["Linear projection — real weight change isn't perfectly linear (water, adherence, metabolic adaptation), so re-run this every few weeks. Safe pace: ~0.5–1% of body weight per week when cutting, ~0.25–0.5% when bulking.",
      "یہ خطی (linear) اندازہ ہے — حقیقی وزن کی تبدیلی بالکل خطی نہیں ہوتی (پانی، پابندی، میٹابولک موافقت)، اس لیے ہر چند ہفتے بعد دوبارہ دیکھیں۔ محفوظ رفتار: کٹ میں ہفتہ وار ~0.5–1% جسمانی وزن، بلک میں ~0.25–0.5%۔"],

    /* ---- Diet ---- */
    "diet.title": ["7-Day Diet Plan 🍛", "7 دن کا ڈائٹ پلان 🍛"],
    "diet.subtitle": ["Pakistani home-style meals — automatically portioned to your goal's calorie and protein targets. Edit your profile and the whole week re-scales.",
      "پاکستانی گھریلو کھانے — آپ کے ہدف کیلوریز اور پروٹین کے مطابق خودکار مقدار۔ پروفائل بدلیں تو پورا ہفتہ دوبارہ ایڈجسٹ ہوتا ہے۔"],
    "diet.empty": ["Set up your <a href=\"#/profile\">profile</a> once — your 7-day Pakistani meal plan appears here automatically.",
      "ایک بار اپنا <a href=\"#/profile\">پروفائل</a> بنائیں — 7 دن کا پاکستانی میل پلان یہاں خود بخود ظاہر ہوگا۔"],
    "diet.day1": ["Day 1 (Mon)", "دن 1 (پیر)"],
    "diet.day2": ["Day 2 (Tue)", "دن 2 (منگل)"],
    "diet.day3": ["Day 3 (Wed)", "دن 3 (بدھ)"],
    "diet.day4": ["Day 4 (Thu)", "دن 4 (جمعرات)"],
    "diet.day5": ["Day 5 (Fri)", "دن 5 (جمعہ)"],
    "diet.day6": ["Day 6 (Sat)", "دن 6 (ہفتہ)"],
    "diet.day7": ["Day 7 (Sun)", "دن 7 (اتوار)"],
    "slot.breakfast": ["Nashta · breakfast", "ناشتہ"],
    "slot.lunch": ["Dopehar · lunch", "دوپہر کا کھانا"],
    "slot.dinner": ["Raat · dinner", "رات کا کھانا"],
    "slot.snacks": ["Snacks", "اسنیکس"],
    "diet.planStyle": ["Plan style", "پلان کی قسم"],
    "diet.styleVal": ["Pakistani home-style · 7-day rotation", "پاکستانی گھریلو کھانا · 7 دن کی روٹیشن"],
    "row.dailyCalTarget": ["Daily calorie target", "روزانہ کیلوریز کا ہدف"],
    "diet.dayTotal": ["Day total vs target ({t} kcal)", "دن کا کل بمقابلہ ہدف ({t} کیلوریز)"],
    "diet.proteinRow": ["Protein (target {t} g)", "پروٹین (ہدف {t} گرام)"],
    "diet.weekAvg": ["Weekly average", "ہفتہ وار اوسط"],
    "diet.weekAvgVal": ["{k} kcal · {p} g protein / day", "{k} کیلوریز · {p} گرام پروٹین / دن"],
    "diet.inRange": ["Days within ±10% of target", "ہدف کے ±10% کے اندر دن"],
    "diet.inRangeVal": ["{n} of 7", "7 میں سے {n}"],
    "diet.variety": ["Variety", "تنوع"],
    "diet.varietyVal": ["7 breakfasts · 7 lunches · 7 dinners — no dish repeats on the same day",
      "7 ناشتے · 7 دوپہر · 7 راتیں — ایک ہی دن کوئی ڈش نہیں دہرائی جاتی"],
    "diet.qtyTimes": ["× {q}", "× {q}"],
    "diet.qtyGrams": ["{g} g", "{g} گرام"],
    "diet.disclaimer": ["Estimates assume home-style Pakistani cooking with moderate oil/ghee — restaurant and street-food portions can be 1.5–2× larger. Swap freely within a category (daal ↔ daal, sabzi ↔ sabzi, roti ↔ rice at 1 roti ≈ 75 g rice). Not medical advice — consult a dietitian for clinical conditions.",
      "اندازے گھریلو پاکستانی کھانے (معتدل تیل/گھی) فرض کرتے ہیں — ہوٹل اور اسٹریٹ فوڈ کی پلیٹیں 1.5–2 گنا بڑی ہو سکتی ہیں۔ ایک ہی قسم میں آزادانہ تبدیلی کریں (دال ↔ دال، سبزی ↔ سبزی، روٹی ↔ چاول: 1 روٹی ≈ 75 گرام چاول)۔ طبی مشورہ نہیں — مرض کی صورت میں ماہرِ غذائیت سے رجوع کریں۔"],
  };
  /* eslint-enable */

  var current = "en";
  var listeners = [];

  function t(key, params) {
    var entry = S[key];
    var str = entry ? (current === "ur" ? entry[1] : entry[0]) : key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        str = str.split("{" + k + "}").join(params[k]);
      });
    }
    return str;
  }

  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
  }

  function updateSwitcher() {
    var btn = document.getElementById("lang-switch");
    if (!btn) return;
    btn.textContent = current === "ur" ? "English" : "اردو";
    btn.title = t("switcher.title");
  }

  function set(lang, initial) {
    current = (lang === "ur") ? "ur" : "en";
    try { window.localStorage.setItem(LANG_KEY, current); } catch (e) {}
    document.documentElement.lang = current === "ur" ? "ur" : "en";
    document.documentElement.dir = current === "ur" ? "rtl" : "ltr";
    applyStatic();
    updateSwitcher();
    if (!initial) listeners.forEach(function (fn) { fn(current); });
  }

  function getSaved() {
    try {
      var v = window.localStorage.getItem(LANG_KEY);
      return (v === "en" || v === "ur") ? v : null;
    } catch (e) { return null; }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var saved = getSaved();
    var gate = document.getElementById("lang-gate");

    if (saved) {
      if (gate) gate.hidden = true;
      set(saved, true);
      listeners.forEach(function (fn) { fn(current); }); // initial notify is safe: modules render themselves anyway
    } else {
      set("en", true); // render English behind the gate
      if (gate) {
        gate.hidden = false;
        var pick = function (lang) {
          return function () {
            set(lang);
            gate.hidden = true;
            gate.classList.add("is-gone");
          };
        };
        document.getElementById("lang-en").addEventListener("click", pick("en"));
        document.getElementById("lang-ur").addEventListener("click", pick("ur"));
      }
    }

    var sw = document.getElementById("lang-switch");
    if (sw) sw.addEventListener("click", function () { set(current === "ur" ? "en" : "ur"); });
  });

  window.FitCalc = window.FitCalc || {};
  FitCalc.i18n = {
    t: t,
    lang: function () { return current; },
    set: set,
    onChange: function (fn) { listeners.push(fn); },
  };
})();
