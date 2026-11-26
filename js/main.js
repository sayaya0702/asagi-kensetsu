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

  /* ---- Contact form -> Web3Forms (info@asagi-kensetsu.co.jp) ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var msg = document.getElementById("formMsg");
      var orig = btn.innerHTML;
      btn.disabled = true; btn.textContent = "送信中…";
      msg.classList.remove("show", "error");
      fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.success) throw new Error(j.message || "error");
          msg.textContent = "お問い合わせありがとうございます。内容を確認のうえ、折り返しご連絡いたします。";
          msg.classList.add("show");
          form.reset();
          msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        })
        .catch(function () {
          msg.textContent = "送信に失敗しました。お手数ですが、お電話（048-731-8980）またはメール（info@asagi-kensetsu.co.jp）でご連絡ください。";
          msg.classList.add("show", "error");
          msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        })
        .then(function () { btn.disabled = false; btn.innerHTML = orig; });
    });
  }
})();
