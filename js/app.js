/* ============================================================
   FitCalc — app shell
   Hash-based routing between calculator views + i18n titles.
   ============================================================ */

(function () {
  "use strict";

  var ROUTES = ["overview", "profile", "bmi", "bmr", "macros", "water", "steps", "timeline", "diet"];
  var DEFAULT_ROUTE = "overview";

  function t(key) {
    return window.FitCalc && FitCalc.i18n ? FitCalc.i18n.t(key) : key;
  }

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

    // Scroll to top on route change
    window.scrollTo({ top: 0 });

    // Update document title (translated)
    document.title = t("title." + route);
  }

  function onHashChange() {
    showRoute(currentRoute());
  }

  /* ---- theme: 5 token themes, cycled by the ◐ pill ---- */
  var THEME_KEY = "fitcalc-theme-v1";
  var THEMES = ["heritage", "volt", "sunrise", "neon", "ocean"];

  function savedTheme() {
    try {
      var v = window.localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(v) !== -1 ? v : "heritage";
    } catch (e) { return "heritage"; }
  }

  function applyTheme(th) {
    document.documentElement.setAttribute("data-theme", th);
    try { window.localStorage.setItem(THEME_KEY, th); } catch (e) {}
  }

  window.addEventListener("hashchange", onHashChange);
  document.addEventListener("DOMContentLoaded", function () {
    onHashChange();
    applyTheme(savedTheme());

    var themeBtn = document.getElementById("theme-switch");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("data-theme");
        var next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
        applyTheme(next);
        themeBtn.title = t("switcher.theme") + " · " + next;
      });
    }

    if (window.FitCalc && FitCalc.i18n) {
      var sync = function () {
        document.title = t("title." + currentRoute());
        if (themeBtn) themeBtn.title = t("switcher.theme");
      };
      sync();
      FitCalc.i18n.onChange(sync);
    }
  });
})();
