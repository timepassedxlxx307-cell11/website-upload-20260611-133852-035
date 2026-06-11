(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        const dots = hero.querySelector('[data-hero-dots]');
        let current = 0;
        let timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            if (dots) {
                Array.from(dots.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }
        }

        function autoplay() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (dots) {
            slides.forEach(function (_, index) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换焦点内容');
                dot.addEventListener('click', function () {
                    show(index);
                    autoplay();
                });
                dots.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                autoplay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                autoplay();
            });
        }

        show(0);
        autoplay();
    }

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
        const input = area.querySelector('[data-search-input]');
        const cards = Array.from(area.querySelectorAll('[data-card]'));
        const yearButtons = Array.from(area.querySelectorAll('[data-year-filter]'));
        let year = 'all';

        function apply() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                const text = (card.dataset.text || '').toLowerCase();
                const title = (card.dataset.title || '').toLowerCase();
                const cardYear = card.dataset.year || '';
                const matchesKeyword = !keyword || text.includes(keyword) || title.includes(keyword);
                const matchesYear = year === 'all' || cardYear === year;
                card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                year = button.dataset.yearFilter || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    });
}());

function initMoviePlayer(streamUrl) {
    const video = document.querySelector('[data-video-player]');
    const overlay = document.querySelector('[data-play-overlay]');
    const playButton = document.querySelector('[data-play-button]');
    let loaded = false;
    let hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
    }

    function startPlayback(event) {
        if (event) {
            event.preventDefault();
        }

        loadStream();
        video.controls = true;

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
