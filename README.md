# FitCalc 🏋️

**Developed by Tausif Rasool**

A dark, sporty fitness calculator webapp — **plain HTML/CSS/JS, zero dependencies**.

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

**Cross-calculator flow:** every calorie target in the BMR & TDEE results has a **→ send button** that pre-fills the Macro Split calculator (goal, calories, and weight all carry over).

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
    ├── app.js        # shell: hash-based tab routing
    ├── bmi.js        # BMI (kg + inches)
    ├── bmr.js        # BMR & TDEE (Mifflin-St Jeor)
    ├── macros.js     # Macro split + prefill API for the send flow
    ├── water.js      # Water intake (ml/kg + training + climate)
    ├── steps.js      # Daily steps (age-based target + stride + calories)
    └── timeline.js   # Goal weight timeline (rate, dates, milestones)
```

## Formulas

- **BMI** = kg ÷ (inches × 0.0254)²
- **BMR (Mifflin-St Jeor)** = 10·kg + 6.25·cm − 5·age + 5 (male) / − 161 (female)
- **Macros** = protein 1.6–2.2 g/kg by goal, fat 25–27.5% of kcal, carbs the remainder (4/4/9 kcal per g)
- **Water** = 33 ml/kg + 12 ml per training minute + climate adder (0 / 500 / 750 ml)
- **Steps** = 10,000/day under 60, 8,000 for 60+ (+2,000 for weight loss); stride = 0.414 × height; kcal = MET 3.5 × kg × hours at 4.8 km/h
- **Timeline** = |goal − current| ÷ (|intake − maintenance| × 7 ÷ 7,700) weeks; safe pace ≤ 1% BW/wk (cut) or ≤ 0.5% (bulk)

## Disclaimer

Educational tool — not medical advice. Estimates vary between individuals.
