(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
  var hlsLoadingPromise = null;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function loadScript(src) {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS 播放组件加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function initNavigation() {
    var toggle = $('[data-nav-toggle]');
    var links = $('[data-nav-links]');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = $('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPageFilters() {
    var scope = $('[data-filter-scope]');

    if (!scope) {
      return;
    }

    var search = $('[data-filter-search]', scope);
    var type = $('[data-filter-type]', scope);
    var region = $('[data-filter-region]', scope);
    var year = $('[data-filter-year]', scope);
    var count = $('[data-filter-count]', scope);
    var cards = $all('[data-filter-list] .movie-card');

    function applyFilter() {
      var keyword = normalize(search && search.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));

        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
          matched = false;
        }

        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          matched = false;
        }

        if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    [search, type, region, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
  }

  function createSearchCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.detail + '" data-movie-id="' + movie.id + '">',
      '  <figure class="card-cover">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
      '  </figure>',
      '  <div class="card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var page = $('[data-search-page]');

    if (!page) {
      return;
    }

    var input = $('[data-global-search]', page);
    var button = $('[data-global-search-button]', page);
    var results = $('[data-search-results]', page);
    var count = $('[data-search-count]', page);
    var dataNode = $('#search-data');

    if (!input || !results || !dataNode) {
      return;
    }

    var movies = [];

    try {
      movies = JSON.parse(dataNode.textContent);
    } catch (error) {
      results.innerHTML = '<p class="filter-count">搜索数据读取失败，请刷新页面重试。</p>';
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (initialKeyword) {
      input.value = initialKeyword;
      applySearch();
    }

    function applySearch() {
      var keyword = normalize(input.value);
      var found = movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.category
        ].join(' '));

        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 200);

      if (count) {
        count.textContent = found.length;
      }

      if (!found.length) {
        results.innerHTML = '<p class="filter-count">没有找到匹配影片，请换一个关键词。</p>';
        return;
      }

      results.innerHTML = found.map(createSearchCard).join('\n');
    }

    input.addEventListener('input', applySearch);

    if (button) {
      button.addEventListener('click', applySearch);
    }
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var trigger = $('[data-player-trigger]', player);
      var message = $('[data-player-message]', player);
      var source = player.getAttribute('data-video-source');
      var initialized = false;
      var hlsInstance = null;

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function attachNative() {
        video.src = source;
        initialized = true;
        return Promise.resolve();
      }

      function attachWithHls(Hls) {
        return new Promise(function (resolve, reject) {
          if (!Hls || !Hls.isSupported()) {
            reject(new Error('当前浏览器不支持 HLS 播放'));
            return;
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            initialized = true;
            resolve();
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error('视频加载失败，请刷新页面重试'));
            }
          });
        });
      }

      function initializePlayer() {
        if (initialized) {
          return Promise.resolve();
        }

        if (!video || !source) {
          return Promise.reject(new Error('播放源缺失'));
        }

        setMessage('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          return attachNative();
        }

        return loadScript(HLS_CDN).then(attachWithHls);
      }

      function play() {
        initializePlayer()
          .then(function () {
            if (trigger) {
              trigger.classList.add('is-hidden');
            }
            setMessage('');
            return video.play();
          })
          .catch(function (error) {
            setMessage(error.message || '播放器初始化失败');
          });
      }

      if (trigger) {
        trigger.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (trigger && video.currentTime === 0) {
          trigger.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });

    $all('[data-scroll-player]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var player = $('[data-player]');

        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var trigger = $('[data-player-trigger]', player);

          if (trigger) {
            trigger.focus({ preventScroll: true });
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroSlider();
    initPageFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
