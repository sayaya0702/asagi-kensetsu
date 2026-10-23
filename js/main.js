/* =========================================================
   浅葱建設株式会社 — main.js
   Header scroll · mobile drawer · reveal · count-up · form
   ========================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header background on scroll ---- */
  var header = document.getElementById("header");
  var onScroll = function () {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile drawer ---- */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("drawer");
  var closeDrawer = function () {
    document.body.classList.remove("nav-open");
    drawer.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
  };
  var openDrawer = function () {
    document.body.classList.add("nav-open");
    drawer.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "メニューを閉じる");
  };
  if (toggle) {
    toggle.addEventListener("click", function () {
      drawer.classList.contains("open") ? closeDrawer() : openDrawer();
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
          var c = en.target.querySelector("[data-count]");
          if (c) countUp(c);
          if (en.target.hasAttribute("data-count")) countUp(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up numbers ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    if (reduce) { el.textContent = target; return; }
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  // Observe standalone count elements not wrapped in .reveal
  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (!el.closest(".reveal") && "IntersectionObserver" in window && !reduce) {
      var o = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { countUp(el); o.disconnect(); }
      }, { threshold: 0.6 });
      o.observe(el);
    } else if (reduce) {
      el.textContent = el.getAttribute("data-count");
    }
  });

  /* ---- Smooth anchor + close drawer (native smooth already on) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---- Contact form (static demo) ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = document.getElementById("formMsg");
      msg.classList.add("show");
      form.querySelector('button[type="submit"]').disabled = true;
      msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      // TODO: 実際の送信先（メール送信/フォームサービス）を設定
    });
  }
})();
