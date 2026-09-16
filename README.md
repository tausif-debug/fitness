# FitCalc 🏋️

**Developed by Tausif Rasool**

A dark, sporty fitness calculator webapp — **plain HTML/CSS/JS, zero dependencies**, fully **bilingual: English and Urdu (اردو, RTL)**.

On first launch a full-screen language gate offers two big buttons — **English** and **اردو**. The choice is remembered (localStorage) and a header pill switches language live at any time. In Urdu mode the entire app flips to RTL with a Nastaliq font stack: every label, result, warning, day chip and even the diet-plan food names are translated. (The PDF report stays English — Urdu script needs font embedding and text shaping, which a dependency-free PDF engine can't do.)

All calculations use fixed units: **weight in kg, height in inches**.

## Calculators

| Calculator | What it does |
|---|---|
| **BMI** | Weight (kg) + height (inches) → BMI with WHO categories, colour gauge, and healthy weight range |
| **BMR & TDEE** | Mifflin-St Jeor equation, 5 activity levels, cut/bulk calorie targets with estimated kg/week change |
| **Macro Split** | Protein / carbs / fat grams by goal (cut · maintain · lean bulk), with safety caps and a stacked split bar |
| **Water Intake** | Daily hydration target in litres from weight (33 ml/kg) + training minutes (+12 ml/min) + climate adder, with glass/bottle equivalents |
| **Daily Steps** | Research-based daily step target by age and goal (health / weight loss), with distance from height-derived stride and calories from weight |
| **Goal Weight Timeline** | Weeks and target date to reach a goal weight from maintenance vs planned intake — weekly rate, milestone dates, direction checks and safe-pace warnings |
| **7-Day Diet Plan** | A full week of Pakistani home-style meals (nashta / lunch / dinner / snacks) portioned to the goal's calorie and protein targets — day chips, per-meal calories, day-total match bar and weekly averages |

**One profile, six calculators:** the user enters their stats once (optional name, sex, age, weight, height, activity level, goal, target weight, climate) in the **Profile** tab — saved to localStorage — and every calculator renders from that shared state automatically. Changing the profile live-updates all results. Derived links: activity level → training minutes for Water; goal + TDEE → macro calories and Timeline intake; goal → Steps mode.

**Themes:** five full looks, cycled by the ◐ pill in the header and remembered in localStorage — **Heritage** (default): deep emerald canvas, gold accent, warm-white cards; **Volt Classic**: the original dark-charcoal + volt-green sporty theme; **Sunrise**: light cream editorial with coral accent; **Neon Night**: near-black cyber with magenta + cyan; **Ocean**: deep teal with aqua. All five work in English and Urdu.

**PDF report:** once the profile is saved, the Overview shows a **Download PDF report** button that generates a complete report — profile, BMI, BMR & TDEE with all five calorie targets, macros at your goal calories, water, steps, the goal-weight timeline, and the full 7-day diet plan — as a single A4 PDF, entirely client-side. If a name is set in the profile, the report is personalised ("Fitness Report for …"). The PDF engine (`js/pdf.js`) is hand-rolled: block layout, auto-pagination, xref assembly, Blob download. No libraries, no server, no build step.

## Run locally

No build step. Either open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# → http://localhost:8080

# or use the bundled no-cache dev server (recommended while iterating):
python3 serve.py
```

## Deploy

Works on any static host — GitHub Pages, Netlify, Vercel, Cloudflare Pages. Drop the folder in and point the host at the root (`index.html`).

## Project structure

```
fitness-calculator/
├── index.html        # app shell + all calculator views (hash-routed tabs)
├── css/
│   └── style.css     # dark sporty design system (volt accent, cards, gauges, tables)
└── js/
    ├── i18n.js       # language gate + English/Urdu dictionary + t() engine
    ├── app.js        # shell: hash-based tab routing
    ├── profile.js    # shared profile store (localStorage) + derived calc helpers
    ├── bmi.js        # BMI (kg + inches)
    ├── bmr.js        # BMR & TDEE (Mifflin-St Jeor)
    ├── macros.js     # Macro split + prefill API for the send flow
    ├── water.js      # Water intake (ml/kg + training + climate)
    ├── steps.js      # Daily steps (age-based target + stride + calories)
    ├── timeline.js   # Goal weight timeline (rate, dates, milestones)
    ├── diet.js       # 7-day Pakistani diet plan (food DB, rotation, tuner)
    ├── pdf.js        # minimal PDF engine: layout, pagination, xref, Blob download
    └── report.js     # collects all calculator results into PDF report blocks
```

## Formulas

- **BMI** = kg ÷ (inches × 0.0254)²
- **BMR (Mifflin-St Jeor)** = 10·kg + 6.25·cm − 5·age + 5 (male) / − 161 (female)
- **Macros** = protein 1.6–2.2 g/kg by goal, fat 25–27.5% of kcal, carbs the remainder (4/4/9 kcal per g)
- **Water** = 33 ml/kg + 12 ml per training minute + climate adder (0 / 500 / 750 ml)
- **Steps** = 10,000/day under 60, 8,000 for 60+ (+2,000 for weight loss); stride = 0.414 × height; kcal = MET 3.5 × kg × hours at 4.8 km/h
- **Timeline** = |goal − current| ÷ (|intake − maintenance| × 7 ÷ 7,700) weeks; safe pace ≤ 1% BW/wk (cut) or ≤ 0.5% (bulk)
- **Diet plan** = deterministic 7-day rotation of Pakistani meal templates; staples (roti/rice/paratha) scale ×0.75 (cut) / ×1 (maintain) / ×1.35 (bulk); snacks and boosters close the gap to the calorie target (stop at 96%) and protein target (stop at 80%); food macros are standard home-cooking estimates

## Disclaimer

Educational tool — not medical advice. Estimates vary between individuals.
