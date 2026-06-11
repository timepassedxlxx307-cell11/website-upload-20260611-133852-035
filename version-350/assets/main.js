(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var controls = document.querySelector('[data-search-controls]');
    var regionSelect = controls ? controls.querySelector('[data-filter-region]') : null;
    var typeSelect = controls ? controls.querySelector('[data-filter-type]') : null;
    var yearSelect = controls ? controls.querySelector('[data-filter-year]') : null;
    var resetButton = controls ? controls.querySelector('[data-filter-reset]') : null;
    var count = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      input.value = initialQuery;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var query = normalize(input.value);
      var region = normalize(regionSelect ? regionSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          ok = false;
        }
        if (type && normalize(card.getAttribute('data-type')) !== type) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', apply);
    [regionSelect, typeSelect, yearSelect].forEach(function (select) {
      if (select) {
        select.addEventListener('change', apply);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        input.value = '';
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function loadHlsLibrary(callback, onerror) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', onerror, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    script.addEventListener('error', onerror, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('[data-video]');
      var poster = player.querySelector('[data-player-poster]');
      var startButton = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var sourceButtons = Array.prototype.slice.call(player.querySelectorAll('[data-source]'));
      var currentSource = player.getAttribute('data-m3u8') || (sourceButtons[0] ? sourceButtons[0].getAttribute('data-source') : '');
      var hlsInstance = null;
      var hasStarted = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function destroyHls() {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      }

      function playWhenReady() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('播放源已加载，请再次点击视频播放按钮。');
          });
        }
      }

      function attachSource(source, autoplay) {
        if (!video || !source) {
          setStatus('当前影片没有可用播放源。');
          return;
        }
        destroyHls();
        currentSource = source;
        setStatus('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function onLoaded() {
            video.removeEventListener('loadedmetadata', onLoaded);
            setStatus('播放源加载完成。');
            if (autoplay) {
              playWhenReady();
            }
          });
          return;
        }

        loadHlsLibrary(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            setStatus('当前浏览器不支持 HLS 播放，请更换支持 MSE/HLS 的浏览器。');
            return;
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成。');
            if (autoplay) {
              playWhenReady();
            }
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放加载异常，请尝试备用线路。');
            }
          });
        }, function () {
          setStatus('HLS 播放库加载失败，请检查网络后重试。');
        });
      }

      sourceButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          sourceButtons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          currentSource = button.getAttribute('data-source');
          if (hasStarted) {
            attachSource(currentSource, true);
          } else {
            setStatus('已选择播放线路，点击“立即播放”开始加载。');
          }
        });
      });

      if (startButton) {
        startButton.addEventListener('click', function () {
          hasStarted = true;
          if (poster) {
            poster.classList.add('hidden');
          }
          attachSource(currentSource, true);
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
