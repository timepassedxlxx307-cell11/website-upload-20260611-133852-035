
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    var searchInput = document.getElementById('siteSearch');
    var yearFilter = document.getElementById('yearFilter');
    var typeFilter = document.getElementById('typeFilter');
    var empty = document.getElementById('emptySearch');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function filterItems() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, #rankTable tbody tr'));
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var show = matchQuery && matchYear && matchType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, yearFilter, typeFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterItems);
        element.addEventListener('change', filterItems);
      }
    });

    if (searchInput || yearFilter || typeFilter) {
      filterItems();
    }
  });

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('video[data-player="main"]');
    var overlay = document.querySelector('.player-overlay');
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
    }

    function start() {
      attachSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
