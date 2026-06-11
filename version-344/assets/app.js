(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupListings();
    setupRankingTabs();
    setupVideoPlayers();
    setupImageFallbacks();
  });

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupListings() {
    var pages = Array.prototype.slice.call(document.querySelectorAll('[data-listing-page]'));

    pages.forEach(function (page) {
      var grid = page.querySelector('[data-listing-grid]');
      var search = page.querySelector('[data-listing-search]');
      var category = page.querySelector('[data-listing-category]');
      var year = page.querySelector('[data-listing-year]');
      var sort = page.querySelector('[data-listing-sort]');
      var count = page.querySelector('[data-visible-count]');
      var empty = page.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(grid ? grid.querySelectorAll('.movie-card') : []);
      var viewButtons = Array.prototype.slice.call(page.querySelectorAll('[data-view]'));
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q') || '';
      var sortFromUrl = params.get('sort') || '';

      if (!grid) {
        return;
      }

      if (search && queryFromUrl) {
        search.value = queryFromUrl;
      }

      if (sort && sortFromUrl) {
        sort.value = sortFromUrl;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function sortCards(visibleCards) {
        var mode = sort ? sort.value : 'default';
        var sorted = visibleCards.slice();

        if (mode === 'rating') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          });
        } else if (mode === 'views') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          });
        } else if (mode === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        } else {
          sorted.sort(function (a, b) {
            return cards.indexOf(a) - cards.indexOf(b);
          });
        }

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var keyword = normalize(search ? search.value : '');
        var categoryValue = category ? category.value : 'all';
        var yearValue = year ? year.value : 'all';
        var visibleCards = [];

        cards.forEach(function (card) {
          var haystack = normalize(card.dataset.search || '');
          var categories = String(card.dataset.categories || '').split('|');
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = categoryValue === 'all' || categories.indexOf(categoryValue) !== -1;
          var matchesYear = yearValue === 'all' || String(card.dataset.year || '') === yearValue;
          var visible = matchesKeyword && matchesCategory && matchesYear;

          card.hidden = !visible;

          if (visible) {
            visibleCards.push(card);
          }
        });

        sortCards(visibleCards);

        if (count) {
          count.textContent = String(visibleCards.length);
        }

        if (empty) {
          empty.hidden = visibleCards.length !== 0;
        }
      }

      [search, category, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          viewButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          grid.classList.toggle('is-list', button.dataset.view === 'list');
        });
      });

      apply();
    });
  }

  function setupRankingTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-tab]'));
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-list]'));

    if (!tabs.length || !lists.length) {
      return;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.dataset.rankingTab;

        tabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
        });

        lists.forEach(function (list) {
          list.classList.toggle('is-active', list.dataset.rankingList === target);
        });
      });
    });
  }

  var hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library loaded without global Hls object.'));
        }
      };
      script.onerror = function () {
        reject(new Error('Unable to load HLS playback library.'));
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  function setupVideoPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function hideOverlay() {
        button.classList.add('is-hidden');
      }

      function showOverlay() {
        button.classList.remove('is-hidden');
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放器开始观看。');
            showOverlay();
          });
        }
      }

      function attachNative(src) {
        video.src = src;
        video.load();
        setStatus('正在使用浏览器原生 HLS 播放能力。');
        hideOverlay();
        playVideo();
      }

      function attachHls(src) {
        loadHlsLibrary()
          .then(function (Hls) {
            if (!Hls.isSupported()) {
              setStatus('当前浏览器暂不支持 HLS 播放，请更换支持的浏览器。');
              showOverlay();
              return;
            }

            if (hlsInstance) {
              hlsInstance.destroy();
            }

            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              setStatus('播放源加载完成，正在播放。');
              hideOverlay();
              playVideo();
            });
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setStatus('播放源加载失败，请刷新页面或稍后再试。');
                showOverlay();
              }
            });
          })
          .catch(function () {
            setStatus('HLS 播放库加载失败，请检查网络后重试。');
            showOverlay();
          });
      }

      function start() {
        var src = video.dataset.hlsSrc;

        if (!src) {
          setStatus('当前影片未配置播放源。');
          return;
        }

        setStatus('正在加载高清播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          attachNative(src);
        } else {
          attachHls(src);
        }
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', hideOverlay);
      video.addEventListener('pause', showOverlay);
      video.addEventListener('ended', showOverlay);
    });
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-error');
      });
    });
  }
})();
