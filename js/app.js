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

  window.addEventListener("hashchange", onHashChange);
  document.addEventListener("DOMContentLoaded", function () {
    onHashChange();
    if (window.FitCalc && FitCalc.i18n) {
      FitCalc.i18n.onChange(function () {
        document.title = t("title." + currentRoute());
      });
    }
  });
})();
