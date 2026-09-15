# FitCalc 🏋️

A dark, sporty fitness calculator webapp — **plain HTML/CSS/JS, zero dependencies**.

All calculations use fixed units: **weight in kg, height in inches**.

## Calculators

| Calculator | What it does |
|---|---|
| **BMI** | Weight (kg) + height (inches) → BMI with WHO categories, colour gauge, and healthy weight range |
| **BMR & TDEE** | Mifflin-St Jeor equation, 5 activity levels, cut/bulk calorie targets with estimated kg/week change |
| **1-Rep Max** | Epley estimate + Brzycki cross-check, % loading table (100→60%) with estimated reps per load |
| **Heart Rate Zones** | Tanaka max HR (208 − 0.68 × age) or manual override; % of max HR or Karvonen HRR method; Z1–Z5 with training purposes |
| **Macro Split** | Protein / carbs / fat grams by goal (cut · maintain · lean bulk), with safety caps and a stacked split bar |

**Cross-calculator flow:** every calorie target in the BMR & TDEE results has a **→ send button** that pre-fills the Macro Split calculator (goal, calories, and weight all carry over).

## Run locally

No build step. Either open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# → http://localhost:8080
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
    ├── onerm.js      # 1-Rep Max (Epley + Brzycki)
    ├── hrzones.js    # Heart rate zones (Tanaka + Karvonen)
    └── macros.js     # Macro split + prefill API for the send flow
```

## Formulas

- **BMI** = kg ÷ (inches × 0.0254)²
- **BMR (Mifflin-St Jeor)** = 10·kg + 6.25·cm − 5·age + 5 (male) / − 161 (female)
- **1RM (Epley)** = weight × (1 + reps ÷ 30) · **(Brzycki)** = weight × 36 ÷ (37 − reps)
- **Max HR (Tanaka)** = 208 − 0.68 × age · **Karvonen target** = resting + (max − resting) × %
- **Macros** = protein 1.6–2.2 g/kg by goal, fat 25–27.5% of kcal, carbs the remainder (4/4/9 kcal per g)

## Disclaimer

Educational tool — not medical advice. Estimates vary between individuals.
