/* ============================================================================
   Portfolio interactions — vanilla JS, no dependencies.
   Provides: mobile nav toggle, scroll-spy, reveal-on-scroll, theme toggle.
   Expected markup hooks (see style.css header for the full class reference):
     - .nav-toggle              button that opens/closes .nav-mobile
     - .nav-mobile              mobile dropdown panel
     - .nav-link / .nav-mobile-link   anchor links with href="#section-id",
                                       get .is-active from scroll-spy
     - [id] sections referenced by those anchors
     - .theme-toggle            button that flips light/dark, persisted
     - .reveal                  any element that should fade/slide in on scroll
   ============================================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initNavToggle();
    initSmoothAnchorScroll();
    initScrollSpy();
    initReveal();
    initThemeToggle();
    initHeaderShadow();
  }

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".nav-mobile");
    if (!toggle || !panel) return;

    toggle.setAttribute("aria-expanded", "false");

    function closePanel() {
      toggle.classList.remove("is-open");
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function openPanel() {
      toggle.classList.add("is-open");
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    });

    // Close the mobile panel whenever a link inside it is used.
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) closePanel();
    });

    // Close on Escape, and on resize back up to desktop width.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closePanel();
    });
  }

  /* ---------------------------------------------------------------------
     Smooth-scroll for in-page anchor links (backstop for browsers/edge
     cases where CSS scroll-behavior:smooth isn't enough, and to account
     for the sticky nav's height via scroll-margin-top already set in CSS)
  --------------------------------------------------------------------- */
  function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-spy: highlight the nav link matching the section in view
  --------------------------------------------------------------------- */
  function initScrollSpy() {
    var sections = Array.prototype.filter.call(
      document.querySelectorAll("section[id], .section[id]"),
      function (s) { return s.id; }
    );
    var navLinks = document.querySelectorAll(".nav-link, .nav-mobile-link");
    if (!sections.length || !navLinks.length) return;

    var linksById = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#") {
        var id = href.slice(1);
        linksById[id] = linksById[id] || [];
        linksById[id].push(link);
      }
    });

    function setActive(id) {
      navLinks.forEach(function (link) { link.classList.remove("is-active"); });
      (linksById[id] || []).forEach(function (link) { link.classList.add("is-active"); });
    }

    if (!("IntersectionObserver" in window)) return;

    var current = null;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (current !== entry.target.id) {
              current = entry.target.id;
              setActive(current);
            }
          }
        });
      },
      {
        root: null,
        // Treat a section as "current" once it crosses roughly the upper
        // third of the viewport, accounting for the sticky nav height.
        rootMargin: "-84px 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------------------------------------------------------------------
     Reveal-on-scroll: fade/slide .reveal elements in once visible
  --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Theme toggle: light/dark, persisted in localStorage, overrides the
     OS prefers-color-scheme via documentElement[data-theme].
  --------------------------------------------------------------------- */
  var THEME_KEY = "theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (err) {
      /* private mode / storage blocked — theme just won't persist */
    }
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(value) {
    if (value === "light" || value === "dark") {
      document.documentElement.setAttribute("data-theme", value);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      var effective = value || (systemPrefersDark() ? "dark" : "light");
      btn.setAttribute("aria-label", effective === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", effective === "dark" ? "true" : "false");
    });
  }

  function initThemeToggle() {
    // Apply any stored preference immediately (index.html should also inline
    // this same check in <head> to avoid a flash of the wrong theme).
    var stored = getStoredTheme();
    applyTheme(stored);

    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var effectiveCurrent = current || (systemPrefersDark() ? "dark" : "light");
        var next = effectiveCurrent === "dark" ? "light" : "dark";
        applyTheme(next);
        storeTheme(next);
      });
    });

    // If the user has never explicitly chosen, keep following the OS live.
    if (!stored && window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        if (!getStoredTheme()) applyTheme(null);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------------------------------------------------------------------
     Subtle elevation on the sticky nav once the page has scrolled
  --------------------------------------------------------------------- */
  function initHeaderShadow() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    function update() {
      if (window.scrollY > 8) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }
})();
