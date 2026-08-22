// Blesson Facility — site behaviour (vanilla JS, no dependencies)
(function () {
  "use strict";

  // Footer year
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var backdrop = document.getElementById("navBackdrop");

  function closeNav() {
    if (!links) return;
    links.classList.remove("open");
    backdrop && backdrop.classList.remove("open");
    toggle && toggle.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    if (!links) return;
    links.classList.add("open");
    backdrop && backdrop.classList.add("open");
    toggle && toggle.setAttribute("aria-expanded", "true");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.contains("open") ? closeNav() : openNav();
    });
    backdrop && backdrop.addEventListener("click", closeNav);
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  // WhatsApp modal
  var waOpen = document.getElementById("waOpen");
  var waModal = document.getElementById("waModal");
  var waClose = document.getElementById("waClose");
  var waSend = document.getElementById("waSend");

  if (waOpen && waModal) {
    waOpen.addEventListener("click", function (e) {
      e.preventDefault();
      waModal.classList.add("open");
    });
  }
  if (waClose && waModal) {
    waClose.addEventListener("click", function () {
      waModal.classList.remove("open");
    });
    waModal.addEventListener("click", function (e) {
      if (e.target === waModal) waModal.classList.remove("open");
    });
  }
  if (waSend) {
    waSend.addEventListener("click", function () {
      var name = (document.getElementById("waName") || {}).value || "";
      var service = (document.getElementById("waService") || {}).value || "";
      var msg = (document.getElementById("waMessage") || {}).value || "";
      var phone = "919214141538";
      if (!name.trim()) {
        alert("Please enter your name / company.");
        return;
      }
      var text =
        "Hello Blesson Facility!%0A%0A*Name:* " +
        encodeURIComponent(name) +
        "%0A*Service:* " +
        encodeURIComponent(service) +
        "%0A*Message:* " +
        encodeURIComponent(msg);
      window.open("https://wa.me/" + phone + "?text=" + text, "_blank");
    });
  }

  // Pre-fill WhatsApp service dropdown from a data attribute on the page (service detail pages)
  var waServiceSelect = document.getElementById("waService");
  if (waServiceSelect && document.body.dataset.service) {
    var val = document.body.dataset.service;
    for (var i = 0; i < waServiceSelect.options.length; i++) {
      if (waServiceSelect.options[i].text === val) {
        waServiceSelect.selectedIndex = i;
        break;
      }
    }
  }

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (el) {
        if (el !== item) el.classList.remove("open");
      });
      item.classList.toggle("open", !wasOpen);
    });
  });

  // Sticky header shrink-on-scroll
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll-reveal: auto-tag common content blocks, then observe
  var revealSelectors = [
    ".service-card", ".sector-card", ".stat-card", ".photo-card",
    ".feature-row", ".location-chip", ".section-head", ".contact-info-card",
    ".form-card", ".faq-item"
  ];
  var revealEls = document.querySelectorAll(revealSelectors.join(","));
  revealEls.forEach(function (el, i) {
    el.classList.add("reveal", "reveal-stagger");
    el.style.setProperty("--stagger", i % 6);
  });

  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }
  // Fail-safe: guarantee every reveal element becomes visible even if it
  // never scrolls into view (bots, automated renderers, odd viewports).
  window.setTimeout(function () {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }, 3500);

  // Animated counters for stat numbers (e.g. "7", "13", "100%") — skips non-numeric like "24/7"
  var counters = document.querySelectorAll(".stat-card .num");
  var animateCounter = function (el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)(%?)$/);
    if (!match) return; // leave things like "24/7" untouched
    var target = parseInt(match[1], 10);
    var suffix = match[2] || "";
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    var counterIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      counterIo.observe(el);
    });
  }

  // Subtle 3D tilt on cards (skipped on touch devices)
  var isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (!isTouch) {
    var tiltSelectors = ".service-card, .sector-card, .stat-card, .photo-card";
    document.querySelectorAll(tiltSelectors).forEach(function (card) {
      card.classList.add("tilt");
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateY = x * 8;
        var rotateX = y * -8;
        card.style.transform =
          "perspective(700px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();
