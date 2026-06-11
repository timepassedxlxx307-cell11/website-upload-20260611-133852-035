(function () {
  const ready = function (callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  };

  const initializeMenu = function () {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  };

  const initializeCarousel = function () {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
      const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
      let index = 0;
      let timer = null;

      if (slides.length <= 1) {
        return;
      }

      const show = function (nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      };

      const start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };

      const stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          stop();
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  };

  const initializeFilters = function () {
    const panel = document.querySelector('[data-search-page]');

    if (!panel) {
      return;
    }

    const input = panel.querySelector('[data-filter-input]');
    const category = panel.querySelector('[data-filter-category]');
    const year = panel.querySelector('[data-filter-year]');
    const empty = document.querySelector('[data-empty-state]');
    const items = Array.from(document.querySelectorAll('.searchable-item'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    const apply = function () {
      const term = input ? input.value.trim().toLowerCase() : '';
      const selectedCategory = category ? category.value : '';
      const selectedYear = year ? year.value : '';
      let visible = 0;

      items.forEach(function (item) {
        const searchText = item.getAttribute('data-search') || '';
        const itemCategory = item.getAttribute('data-category') || '';
        const itemYear = item.getAttribute('data-year') || '';
        const matchedTerm = !term || searchText.indexOf(term) !== -1;
        const matchedCategory = !selectedCategory || itemCategory === selectedCategory;
        const matchedYear = !selectedYear || itemYear === selectedYear;
        const matched = matchedTerm && matchedCategory && matchedYear;

        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  };

  const initializePlayers = function () {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      const video = player.querySelector('video');
      const source = video ? video.querySelector('source') : null;
      const overlay = player.querySelector('.player-overlay');

      if (!video || !source || !source.src) {
        return;
      }

      let loaded = false;
      let hls = null;

      const load = function () {
        if (loaded) {
          return;
        }

        const url = source.src;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }

        loaded = true;
      };

      const play = function () {
        load();
        video.controls = true;
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  const initializeScrollTop = function () {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scroll-top';
    button.textContent = '↑';
    document.body.appendChild(button);

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    const update = function () {
      button.classList.toggle('is-visible', window.scrollY > 360);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  ready(function () {
    initializeMenu();
    initializeCarousel();
    initializeFilters();
    initializePlayers();
    initializeScrollTop();
  });
})();
