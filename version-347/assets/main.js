(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var container = panel.parentElement;
      var grid = container ? container.querySelector('[data-filter-grid]') : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var input = panel.querySelector('[data-filter-input]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = container.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input && initial) {
        input.value = initial;
      }

      function contains(value, target) {
        return !target || String(value || '').toLowerCase().indexOf(String(target).toLowerCase()) !== -1;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var okText = !text || haystack.indexOf(text) !== -1;
          var okRegion = contains(card.getAttribute('data-region'), selectedRegion);
          var okType = contains(card.getAttribute('data-type'), selectedType);
          var cardYear = parseInt(card.getAttribute('data-year'), 10) || 0;
          var okYear = !selectedYear || (selectedYear === '2021' ? cardYear <= 2021 : card.getAttribute('data-year') === selectedYear);
          var ok = okText && okRegion && okType && okYear;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  });
})();
