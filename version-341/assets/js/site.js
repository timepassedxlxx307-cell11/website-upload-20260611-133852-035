(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    initHeroSlider();
    initPageFilters();
  });

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");

      function matchesYear(card, selectedYear) {
        if (!selectedYear) {
          return true;
        }

        var cardYear = Number(card.getAttribute("data-year") || 0);
        var selected = Number(selectedYear);

        if (selected === 2022) {
          return cardYear <= 2022;
        }

        return cardYear === selected;
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var selectedYear = yearFilter ? yearFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search-text"));
          var isVisible = (!keyword || haystack.indexOf(keyword) !== -1) && matchesYear(card, selectedYear);
          card.style.display = isVisible ? "" : "none";
          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
      }
    });
  }
})();
