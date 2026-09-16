/* ============================================================
   FitCalc — app shell (Step 1)
   Hash-based routing between calculator views.
   Later steps: each calculator registers itself here.
   ============================================================ */

(function () {
  "use strict";

  var ROUTES = ["overview", "bmi", "bmr", "macros", "water", "steps", "timeline"];
  var DEFAULT_ROUTE = "overview";

  function currentRoute() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    return ROUTES.indexOf(hash) !== -1 ? hash : DEFAULT_ROUTE;
  }

  function showRoute(route) {
    // Toggle sections
    document.querySelectorAll(".route").forEach(function (section) {
      var isMatch = section.dataset.route === route;
      section.hidden = !isMatch;
    });

    // Toggle nav tabs
    document.querySelectorAll(".nav-tab").forEach(function (tab) {
      tab.classList.toggle("is-active", tab.dataset.route === route);
    });

    // Scroll to top on route change (except initial load keeps position)
    window.scrollTo({ top: 0 });

    // Update document title
    var titles = {
      overview: "FitCalc — Gym Fitness Calculators",
      bmi: "BMI Calculator — FitCalc",
      bmr: "BMR & TDEE — FitCalc",
      macros: "Macro Split — FitCalc",
      water: "Water Intake — FitCalc",
      steps: "Daily Steps — FitCalc",
      timeline: "Goal Weight Timeline — FitCalc",
    };
    document.title = titles[route] || titles[DEFAULT_ROUTE];
  }

  function onHashChange() {
    showRoute(currentRoute());
  }

  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("DOMContentLoaded", onHashChange);
})();
